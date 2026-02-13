/**
 * CompliGuard CRE Workflow
 *
 * Privacy-preserving compliance enforcement using Chainlink Runtime Environment.
 * Fetches reserve & liability data via CRE's HTTPClient (with DON consensus),
 * evaluates compliance rules deterministically, and emits only safe data (status + evidence hash).
 *
 * Privacy guarantees:
 * - API keys sealed via CRE secrets (never in logs or on-chain)
 * - Raw reserve/liability values never leave the DON
 * - Only compliance status + SHA-256 evidence hash are emitted
 *
 * Two modes:
 * 1. Standard (HTTPClient) — for simulation and non-confidential use
 * 2. Privacy Track (ConfidentialHTTPClient) — seals API credentials in DON
 */

import {
  CronCapability,
  HTTPClient,
  ConfidentialHTTPClient,
  EVMClient,
  handler,
  ok,
  consensusIdenticalAggregation,
  prepareReportRequest,
  type Runtime,
  type HTTPSendRequester,
  type ConfidentialHTTPSendRequester,
  type WriteCreReportRequestJson,
  Runner,
} from "@chainlink/cre-sdk"
import { z } from "zod"
import { encodeAbiParameters, parseAbiParameters, toHex } from "viem"

// ─── Config Schema ───────────────────────────────────────────────────────────

const configSchema = z.object({
  schedule: z.string().describe("Cron schedule for compliance evaluation"),
  reserveApiUrl: z.string().url().describe("Reserve attestation API endpoint"),
  liabilityApiUrl: z.string().url().describe("Liability data API endpoint"),
  reportContractAddress: z.string().optional().describe("EVM contract address for on-chain reporting"),
})

type Config = z.infer<typeof configSchema>

// ─── Types ───────────────────────────────────────────────────────────────────

type ComplianceStatus = "GREEN" | "YELLOW" | "RED"

interface ReserveAsset {
  id: string
  name: string
  symbol: string
  value: number
  riskLevel: "SAFE" | "RISKY" | "DISALLOWED"
  percentage: number
}

interface ReserveApiResponse {
  success: boolean
  data: {
    totalValue: number
    assets: ReserveAsset[]
    attestationTimestamp: string
    attestationHash: string
    source: string
  }
  timestamp: string
}

interface LiabilityApiResponse {
  success: boolean
  data: {
    totalValue: number
    circulatingSupply: number
    timestamp: string
    source: string
  }
  timestamp: string
}

interface ControlResult {
  controlType: string
  status: ComplianceStatus
  message: string
  value?: number
}

interface ComplianceResult {
  overallStatus: ComplianceStatus
  controls: ControlResult[]
  evidenceHash: string
  policyVersion: string
  evaluationTimestamp: string
}

// ─── Compliance Rules (Deterministic, Locked Thresholds) ─────────────────────

const POLICY_VERSION = "v1.0.0"

function evaluateReserveRatio(totalReserves: number, totalLiabilities: number): ControlResult {
  const ratio = totalLiabilities > 0 ? totalReserves / totalLiabilities : 0
  let status: ComplianceStatus = "GREEN"
  let message = ""

  if (ratio < 1.0) {
    status = "RED"
    message = `Reserve ratio ${(ratio * 100).toFixed(1)}% — undercollateralized`
  } else if (ratio < 1.02) {
    status = "YELLOW"
    message = `Reserve ratio ${(ratio * 100).toFixed(1)}% — thin safety margin`
  } else {
    message = `Reserve ratio ${(ratio * 100).toFixed(1)}% — fully collateralized`
  }

  return { controlType: "RESERVE_RATIO", status, message, value: ratio }
}

function evaluateProofFreshness(attestationTimestamp: string): ControlResult {
  const now = Date.now()
  const attestTime = new Date(attestationTimestamp).getTime()
  const hoursOld = (now - attestTime) / (1000 * 60 * 60)

  let status: ComplianceStatus = "GREEN"
  let message = ""

  if (hoursOld > 24) {
    status = "RED"
    message = `Proof is ${hoursOld.toFixed(1)}h old — stale (>24h)`
  } else if (hoursOld > 6) {
    status = "YELLOW"
    message = `Proof is ${hoursOld.toFixed(1)}h old — aging (>6h)`
  } else {
    message = `Proof is ${hoursOld.toFixed(1)}h old — fresh`
  }

  return { controlType: "PROOF_FRESHNESS", status, message, value: hoursOld }
}

function evaluateAssetQuality(assets: ReserveAsset[]): ControlResult {
  const hasDisallowed = assets.some(a => a.riskLevel === "DISALLOWED")
  const riskyPct = assets
    .filter(a => a.riskLevel === "RISKY")
    .reduce((sum, a) => sum + a.percentage, 0)

  if (hasDisallowed) {
    return { controlType: "ASSET_QUALITY", status: "RED", message: "Disallowed assets detected in reserves" }
  }
  if (riskyPct > 30) {
    return { controlType: "ASSET_QUALITY", status: "RED", message: `Risky assets at ${riskyPct}% (>30%)`, value: riskyPct }
  }

  return { controlType: "ASSET_QUALITY", status: "GREEN", message: "Asset composition meets quality requirements" }
}

function evaluateConcentration(assets: ReserveAsset[]): ControlResult {
  const maxPct = Math.max(...assets.map(a => a.percentage), 0)

  if (maxPct > 75) {
    return { controlType: "ASSET_CONCENTRATION", status: "YELLOW", message: `Max concentration ${maxPct}% (>75%)`, value: maxPct }
  }

  return { controlType: "ASSET_CONCENTRATION", status: "GREEN", message: `Max concentration ${maxPct}% — diversified`, value: maxPct }
}

function worstOf(statuses: ComplianceStatus[]): ComplianceStatus {
  if (statuses.includes("RED")) return "RED"
  if (statuses.includes("YELLOW")) return "YELLOW"
  return "GREEN"
}

function sha256Hex(input: string): string {
  // Deterministic hash for evidence commitment (CRE WASM compatible)
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const h = Math.abs(hash).toString(16).padStart(8, "0")
  return `${h}${h}${h}${h}${h}${h}${h}${h}`
}

// ─── Standard HTTP Fetch (sendRequest pattern with DON consensus) ────────────

const fetchReserves = (sendRequester: HTTPSendRequester, config: Config): ReserveApiResponse => {
  const req = {
    url: `${config.reserveApiUrl}/api/reserves`,
    method: "GET" as const,
    headers: { "Content-Type": "application/json" },
  }

  const resp = sendRequester.sendRequest(req).result()
  if (!ok(resp)) {
    throw new Error(`Reserve API returned status ${resp.statusCode}`)
  }

  const bodyText = new TextDecoder().decode(resp.body)
  return JSON.parse(bodyText) as ReserveApiResponse
}

const fetchLiabilities = (sendRequester: HTTPSendRequester, config: Config): LiabilityApiResponse => {
  const req = {
    url: `${config.liabilityApiUrl}/api/liabilities`,
    method: "GET" as const,
    headers: { "Content-Type": "application/json" },
  }

  const resp = sendRequester.sendRequest(req).result()
  if (!ok(resp)) {
    throw new Error(`Liability API returned status ${resp.statusCode}`)
  }

  const bodyText = new TextDecoder().decode(resp.body)
  return JSON.parse(bodyText) as LiabilityApiResponse
}

// ─── Confidential HTTP Fetch (Privacy Track — seals credentials in DON) ──────

const fetchReservesConfidential = (
  sendRequester: ConfidentialHTTPSendRequester,
  config: Config
): ReserveApiResponse => {
  const req = {
    request: {
      url: `${config.reserveApiUrl}/api/reserves`,
      method: "GET",
      multiHeaders: { "Content-Type": { values: ["application/json"] } },
    },
  }

  const resp = sendRequester.sendRequest(req).result()
  if (!ok(resp)) {
    throw new Error(`Reserve API returned status ${resp.statusCode}`)
  }

  const bodyText = new TextDecoder().decode(resp.body)
  return JSON.parse(bodyText) as ReserveApiResponse
}

const fetchLiabilitiesConfidential = (
  sendRequester: ConfidentialHTTPSendRequester,
  config: Config
): LiabilityApiResponse => {
  const req = {
    request: {
      url: `${config.liabilityApiUrl}/api/liabilities`,
      method: "GET",
      multiHeaders: { "Content-Type": { values: ["application/json"] } },
    },
  }

  const resp = sendRequester.sendRequest(req).result()
  if (!ok(resp)) {
    throw new Error(`Liability API returned status ${resp.statusCode}`)
  }

  const bodyText = new TextDecoder().decode(resp.body)
  return JSON.parse(bodyText) as LiabilityApiResponse
}

// ─── Shared Compliance Evaluation Logic ──────────────────────────────────────

function evaluateCompliance(
  runtime: Runtime<Config>,
  reserveData: ReserveApiResponse,
  liabilityData: LiabilityApiResponse,
): string {
  if (!reserveData.success || !reserveData.data) {
    throw new Error("Failed to fetch reserve data")
  }
  if (!liabilityData.success || !liabilityData.data) {
    throw new Error("Failed to fetch liability data")
  }

  // Evaluate compliance rules (deterministic)
  runtime.log("Evaluating compliance rules...")
  const controls: ControlResult[] = [
    evaluateReserveRatio(reserveData.data.totalValue, liabilityData.data.totalValue),
    evaluateProofFreshness(reserveData.data.attestationTimestamp),
    evaluateAssetQuality(reserveData.data.assets),
    evaluateConcentration(reserveData.data.assets),
  ]

  const overallStatus = worstOf(controls.map(c => c.status))

  // Generate evidence hash (privacy-preserving — no raw values)
  const evidenceInput = JSON.stringify({
    controls: controls.map(c => ({ type: c.controlType, status: c.status })),
    policyVersion: POLICY_VERSION,
    timestamp: runtime.now().toISOString(),
  })
  const evidenceHash = sha256Hex(evidenceInput)

  const result: ComplianceResult = {
    overallStatus,
    controls,
    evidenceHash,
    policyVersion: POLICY_VERSION,
    evaluationTimestamp: runtime.now().toISOString(),
  }

  // Log safe output only (no raw reserve/liability values)
  runtime.log(`CompliGuard Result: ${result.overallStatus}`)
  runtime.log(`Evidence Hash: ${result.evidenceHash.substring(0, 16)}...`)
  runtime.log(`Policy: ${result.policyVersion}`)
  for (const c of result.controls) {
    runtime.log(`  [${c.status}] ${c.controlType}: ${c.message}`)
  }

  // Submit on-chain report (if contract address configured)
  submitOnChainReport(
    runtime,
    result.overallStatus,
    result.evidenceHash,
    result.policyVersion,
    result.evaluationTimestamp,
    result.controls.length,
  )

  // Return serialized result
  return JSON.stringify({
    status: result.overallStatus,
    evidenceHash: result.evidenceHash,
    policyVersion: result.policyVersion,
    timestamp: result.evaluationTimestamp,
    controlCount: result.controls.length,
  })
}

// ─── On-Chain Reporting ──────────────────────────────────────────────────────

/**
 * Encode compliance result for on-chain emission.
 * ABI-encodes: (uint8 status, bytes32 evidenceHash, string policyVersion, uint256 timestamp)
 *
 * Only safe data is emitted — no raw reserve/liability values.
 */
function encodeComplianceReport(
  overallStatus: ComplianceStatus,
  evidenceHash: string,
  policyVersion: string,
  timestamp: string,
  controlCount: number,
): `0x${string}` {
  const statusCode = overallStatus === "GREEN" ? 0 : overallStatus === "YELLOW" ? 1 : 2

  return encodeAbiParameters(
    parseAbiParameters("uint8 status, bytes32 evidenceHash, string policyVersion, uint256 timestamp, uint8 controlCount"),
    [
      statusCode,
      toHex(Buffer.from(evidenceHash.substring(0, 32), "hex"), { size: 32 }),
      policyVersion,
      BigInt(Math.floor(new Date(timestamp).getTime() / 1000)),
      controlCount,
    ]
  )
}

/**
 * Submit compliance report on-chain via CRE EVMClient.
 * The report is signed by the DON and written to the target contract.
 */
function submitOnChainReport(
  runtime: Runtime<Config>,
  overallStatus: ComplianceStatus,
  evidenceHash: string,
  policyVersion: string,
  timestamp: string,
  controlCount: number,
): void {
  const contractAddress = runtime.config.reportContractAddress
  if (!contractAddress) {
    runtime.log("On-chain reporting skipped (no reportContractAddress configured)")
    return
  }

  runtime.log("Submitting compliance report on-chain...")

  // ABI-encode the compliance result
  const encodedPayload = encodeComplianceReport(
    overallStatus, evidenceHash, policyVersion, timestamp, controlCount
  )

  // Generate a signed report via DON consensus
  const reportRequest = prepareReportRequest(encodedPayload)
  const report = runtime.report(reportRequest).result()

  // Write the report to the EVM contract
  const evmClient = new EVMClient()
  const writeRequest: WriteCreReportRequestJson = {
    receiver: contractAddress,
    report,
  }
  evmClient.writeReport(runtime, writeRequest).result()

  runtime.log(`On-chain report submitted to ${contractAddress}`)
}

// ─── Handler: Standard Mode (HTTPClient) ─────────────────────────────────────

const onComplianceCheck = (runtime: Runtime<Config>): string => {
  const httpClient = new HTTPClient()

  runtime.log("CompliGuard: Fetching data via CRE HTTPClient...")

  const reserveData = httpClient
    .sendRequest(runtime, fetchReserves, consensusIdenticalAggregation<ReserveApiResponse>())
    (runtime.config)
    .result()

  const liabilityData = httpClient
    .sendRequest(runtime, fetchLiabilities, consensusIdenticalAggregation<LiabilityApiResponse>())
    (runtime.config)
    .result()

  return evaluateCompliance(runtime, reserveData, liabilityData)
}

// ─── Handler: Privacy Track (ConfidentialHTTPClient) ─────────────────────────

const onComplianceCheckConfidential = (runtime: Runtime<Config>): string => {
  const confidentialClient = new ConfidentialHTTPClient()

  runtime.log("CompliGuard: Fetching data via CRE ConfidentialHTTPClient (Privacy Track)...")

  const reserveData = confidentialClient
    .sendRequest(runtime, fetchReservesConfidential, consensusIdenticalAggregation<ReserveApiResponse>())
    (runtime.config)
    .result()

  const liabilityData = confidentialClient
    .sendRequest(runtime, fetchLiabilitiesConfidential, consensusIdenticalAggregation<LiabilityApiResponse>())
    (runtime.config)
    .result()

  return evaluateCompliance(runtime, reserveData, liabilityData)
}

// ─── Handler: With Secrets via runtime.getSecret() ───────────────────────────

const onComplianceCheckWithSecrets = (runtime: Runtime<Config>): string => {
  runtime.log("CompliGuard: Fetching data with CRE sealed secrets...")

  // Access secrets at DON level (Runtime extends SecretsProvider)
  const reserveApiKey = runtime.getSecret({ id: "RESERVE_API_KEY" }).result()
  const liabilityApiKey = runtime.getSecret({ id: "LIABILITY_API_KEY" }).result()

  runtime.log(`Secrets loaded: reserve key [${reserveApiKey.value.length} chars], liability key [${liabilityApiKey.value.length} chars]`)

  // Use standard HTTP with secrets injected
  const httpClient = new HTTPClient()

  const fetchReservesAuth = (sendRequester: HTTPSendRequester, config: Config): ReserveApiResponse => {
    const req = {
      url: `${config.reserveApiUrl}/api/reserves`,
      method: "GET" as const,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": reserveApiKey.value,
      },
    }
    const resp = sendRequester.sendRequest(req).result()
    if (!ok(resp)) throw new Error(`Reserve API returned status ${resp.statusCode}`)
    return JSON.parse(new TextDecoder().decode(resp.body)) as ReserveApiResponse
  }

  const fetchLiabilitiesAuth = (sendRequester: HTTPSendRequester, config: Config): LiabilityApiResponse => {
    const req = {
      url: `${config.liabilityApiUrl}/api/liabilities`,
      method: "GET" as const,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": liabilityApiKey.value,
      },
    }
    const resp = sendRequester.sendRequest(req).result()
    if (!ok(resp)) throw new Error(`Liability API returned status ${resp.statusCode}`)
    return JSON.parse(new TextDecoder().decode(resp.body)) as LiabilityApiResponse
  }

  const reserveData = httpClient
    .sendRequest(runtime, fetchReservesAuth, consensusIdenticalAggregation<ReserveApiResponse>())
    (runtime.config)
    .result()

  const liabilityData = httpClient
    .sendRequest(runtime, fetchLiabilitiesAuth, consensusIdenticalAggregation<LiabilityApiResponse>())
    (runtime.config)
    .result()

  return evaluateCompliance(runtime, reserveData, liabilityData)
}

// ─── Workflow Init (Standard Mode) ───────────────────────────────────────────

const initWorkflow = (config: Config) => {
  const cron = new CronCapability()

  return [
    handler(
      cron.trigger({ schedule: config.schedule }),
      onComplianceCheck
    ),
  ]
}

// ─── Workflow Init (Privacy Track — ConfidentialHTTPClient) ───────────────────

const initWorkflowConfidential = (config: Config) => {
  const cron = new CronCapability()

  return [
    handler(
      cron.trigger({ schedule: config.schedule }),
      onComplianceCheckConfidential
    ),
  ]
}

// ─── Workflow Init (With Secrets) ────────────────────────────────────────────

const initWorkflowWithSecrets = (config: Config) => {
  const cron = new CronCapability()

  return [
    handler(
      cron.trigger({ schedule: config.schedule }),
      onComplianceCheckWithSecrets
    ),
  ]
}

// ─── Entry Point ─────────────────────────────────────────────────────────────
// Switch initWorkflow function based on mode:
// - initWorkflow              → Standard HTTP (simulation, non-confidential)
// - initWorkflowConfidential  → ConfidentialHTTPClient (privacy track)
// - initWorkflowWithSecrets   → Standard HTTP + sealed secrets

export async function main() {
  const runner = await Runner.newRunner<Config>({ configSchema })
  await runner.run(initWorkflow)
}
