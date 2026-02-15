# CompliGuard — Hackathon Submission Blurbs

## Track 1: Risk & Compliance

**Title**: CompliGuard — Privacy-Preserving Compliance Enforcement Engine

**One-liner**: Continuous, deterministic compliance monitoring for reserve-backed digital assets — powered by Chainlink CRE.

**Description**:
CompliGuard is a production-grade compliance enforcement engine that evaluates financial safety controls in real time using Chainlink CRE. It monitors reserve ratios, proof freshness, asset quality, and portfolio concentration through deterministic rules with worst-of aggregation — ensuring compliance is a runtime system property, not a periodic report.

The CRE workflow orchestrates confidential data ingestion from external APIs, offchain policy evaluation, and on-chain reporting — all without exposing sensitive financial data. An AI reasoning agent provides human-readable explanations of compliance outcomes, while never influencing the deterministic enforcement logic.

**Key features**:
- 4 deterministic compliance controls (reserve ratio, proof freshness, asset quality, concentration)
- Worst-of aggregation: if any control fails, the system is non-compliant
- On-chain reporting via `runtime.report()` + `EVMClient.writeReport()` with ABI encoding
- AI-generated explanations (advisory only, graceful degradation)
- 38 automated tests including determinism verification

**CRE Usage**:
- `cre-workflow/main.ts`: CRE SDK workflow with `Runner`, `handler`, `CronCapability`, `HTTPClient`, `ConfidentialHTTPClient`, `EVMClient`
- `cre-workflow/config.json`: Workflow configuration
- `cre-workflow/secrets.yaml`: CRE Vault secret declarations

---

## Track 2: Privacy

**Title**: CompliGuard — Confidential Compliance with Zero Data Leakage

**One-liner**: Enforce reserve-backing compliance using Chainlink Confidential HTTP — API credentials, request data, and financial balances never leave the DON.

**Description**:
CompliGuard uses Chainlink CRE's ConfidentialHTTPClient to fetch sensitive reserve and liability data from external APIs while ensuring that API credentials, request parameters, and response payloads are sealed inside the DON and never exposed on-chain, in logs, or to any individual node.

The privacy boundary is enforced by design: raw reserve values and liability amounts are processed entirely offchain. Only a compliance status (GREEN/YELLOW/RED), a cryptographic evidence hash (SHA-256), a policy version, and an evaluation timestamp are emitted. A detailed privacy boundary architecture document maps every data element to its classification and boundary.

**Privacy guarantees**:
- API keys sealed in CRE Vault, accessed via `runtime.getSecret()`
- Reserve/liability values never emitted on-chain or in logs
- Evidence hashing: SHA-256 commitment of inputs without revealing values
- Tamper-proof audit trail stores only hashes and statuses
- On-chain report contains only `(uint8 status, bytes32 evidenceHash, string policyVersion, uint256 timestamp, uint8 controlCount)`

**CRE Confidential HTTP Usage**:
- `cre-workflow/main.ts`: `ConfidentialHTTPClient` + `runtime.getSecret()` for sealed API calls
- `docs/privacy-boundary.md`: Full data flow diagram and classification matrix
- `src/cre/confidential-http.ts`: Local bridge (CRE deployment uses SDK directly)
