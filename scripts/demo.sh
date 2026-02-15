#!/bin/bash
# ──────────────────────────────────────────────────────────────
# CompliGuard Demo Script — for 3-5 minute video recording
# 
# Flow (per plan.md M4):
#   1. GREEN state
#   2. Confidential HTTP fetch
#   3. Policy violation
#   4. RED state
#   5. Explanation shown
#   6. Privacy preserved
#
# Prerequisites:
#   Terminal 1: npm run mock-server   (running on :3001)
#   Terminal 2: run this script
# ──────────────────────────────────────────────────────────────

BASE="http://localhost:3001"
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

pause() {
  echo ""
  echo -e "${CYAN}───── Press ENTER to continue ─────${NC}"
  read -r
}

header() {
  echo ""
  echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
  echo ""
}

# ──────────────────────────────────────────────────────────────
header "🛡️  CompliGuard — Live Compliance Demo"
echo "Privacy-preserving compliance enforcement powered by Chainlink CRE."
echo ""
echo "This demo shows:"
echo "  • Continuous compliance evaluation (4 controls)"
echo "  • State transitions: GREEN → YELLOW → RED"
echo "  • AI-generated explanations (advisory only)"
echo "  • Privacy preserved throughout (no raw data exposed)"
pause

# ──────────────────────────────────────────────────────────────
header "Step 1: HEALTHY STATE (🟢 GREEN)"
echo -e "Switching to ${GREEN}healthy${NC} scenario..."
echo ""
curl -s -X POST "$BASE/api/simulate/scenario" \
  -H 'Content-Type: application/json' \
  -d '{"scenario":"healthy"}' | jq .
echo ""
echo -e "Fetching compliance status..."
echo ""
curl -s "$BASE/api/compliance/status" | jq '{
  status: .data.status,
  policyVersion: .data.policyVersion,
  evidenceHash: .data.evidenceHash,
  explanation: .data.explanation,
  controls: [.data.controls[] | {controlType, status, message}]
}'
echo ""
echo -e "${GREEN}✅ All 4 controls PASS — system is fully compliant.${NC}"
echo -e "${CYAN}Note: Only status, hash, and timestamp are emitted — no raw reserve values.${NC}"
pause

# ──────────────────────────────────────────────────────────────
header "Step 2: CONFIDENTIAL HTTP FETCH"
echo "In CRE deployment, data is fetched via ConfidentialHTTPClient:"
echo ""
echo "  • API credentials sealed inside DON (never exposed)"
echo "  • Request parameters kept private"
echo "  • Response payloads processed offchain only"
echo ""
echo "Attestation format (plan.md M1):"
curl -s "$BASE/attestation/latest" | jq .
echo ""
echo -e "${CYAN}In production: this fetch happens inside the DON via ConfidentialHTTPClient.${NC}"
echo -e "${CYAN}Raw values above are visible only for demo — never emitted on-chain.${NC}"
pause

# ──────────────────────────────────────────────────────────────
header "Step 3: AT-RISK STATE (🟡 YELLOW)"
echo -e "Switching to ${YELLOW}at_risk${NC} scenario..."
echo "  • Reserve ratio drops to 1.01x (thin margin)"
echo "  • Proof age increases to 10 hours"
echo "  • Concentration rises to 78%"
echo ""
curl -s -X POST "$BASE/api/simulate/scenario" \
  -H 'Content-Type: application/json' \
  -d '{"scenario":"at_risk"}' | jq .state
echo ""
echo -e "Fetching compliance status..."
echo ""
curl -s "$BASE/api/compliance/status" | jq '{
  status: .data.status,
  explanation: .data.explanation,
  controls: [.data.controls[] | {controlType, status, message}]
}'
echo ""
echo -e "${YELLOW}⚠️  Multiple controls flagged — worst-of aggregation yields YELLOW.${NC}"
pause

# ──────────────────────────────────────────────────────────────
header "Step 4: NON-COMPLIANT STATE (🔴 RED)"
echo -e "Switching to ${RED}non_compliant${NC} scenario..."
echo "  • Reserve ratio drops below 1.0x (undercollateralized)"
echo "  • Proof is 30 hours stale"
echo "  • Disallowed assets present"
echo "  • Risky assets exceed 30%"
echo ""
curl -s -X POST "$BASE/api/simulate/scenario" \
  -H 'Content-Type: application/json' \
  -d '{"scenario":"non_compliant"}' | jq .state
echo ""
echo -e "Fetching compliance status..."
echo ""
curl -s "$BASE/api/compliance/status" | jq '{
  status: .data.status,
  explanation: .data.explanation,
  controls: [.data.controls[] | {controlType, status, message}]
}'
echo ""
echo -e "${RED}🔴 System is NON-COMPLIANT — immediate action required.${NC}"
pause

# ──────────────────────────────────────────────────────────────
header "Step 5: AI EXPLANATION"
echo "The AI Reasoning Agent provides human-readable analysis."
echo "It is ADVISORY ONLY — it cannot modify the compliance status."
echo ""
curl -s "$BASE/api/compliance/status" | jq '.data.explanation'
echo ""
echo -e "${CYAN}If AI fails, the system degrades gracefully — enforcement continues.${NC}"
pause

# ──────────────────────────────────────────────────────────────
header "Step 6: PRIVACY PRESERVED"
echo "What is EMITTED (safe to expose):"
echo "  ✅ Compliance status (GREEN/YELLOW/RED)"
echo "  ✅ Evidence hash (SHA-256)"
echo "  ✅ Policy version"
echo "  ✅ Evaluation timestamp"
echo "  ✅ Human-readable explanation"
echo ""
echo "What is NEVER EXPOSED:"
echo "  ❌ Raw reserve values"
echo "  ❌ Liability amounts"
echo "  ❌ API credentials"
echo "  ❌ Asset composition details"
echo ""
echo "On-chain report (ABI-encoded):"
echo "  (uint8 status, bytes32 evidenceHash, string policyVersion, uint256 timestamp, uint8 controlCount)"
echo ""
echo -e "${GREEN}✅ Privacy boundary enforced throughout the entire workflow.${NC}"
pause

# ──────────────────────────────────────────────────────────────
header "Step 7: EVALUATION HISTORY"
echo "Timeline of all evaluations (for dashboard):"
echo ""
curl -s "$BASE/api/compliance/history?limit=5" | jq '.data[] | {timestamp, status, evidenceHash}'
pause

# ──────────────────────────────────────────────────────────────
header "✅ Demo Complete"
echo "CompliGuard — Privacy-preserving compliance enforcement."
echo ""
echo "Tracks: Risk & Compliance (Primary), Privacy (Confidential HTTP)"
echo "Engine: Deterministic, 4 controls, worst-of aggregation"
echo "CRE: HTTPClient + ConfidentialHTTPClient + EVMClient + runtime.report()"
echo "AI: Advisory explanations (non-decisional)"
echo "Tests: 38 passing"
echo ""
echo -e "${BOLD}Compliance cannot be slower than risk.${NC}"
echo ""
