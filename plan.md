🛡️ CompliGuard — Final Developer Milestone Plan (v1.0)
Project: CompliGuard (CompliLedger)
Hackathon: Convergence – A Chainlink Hackathon
Tracks: Risk & Compliance (Primary), Privacy (Confidential HTTP)
Execution Window: Feb 6 – March 1
Core Principle:
CRE orchestrates. Rules decide. AI explains. Privacy is enforced by design.
 
🚨 Non-Negotiable Engineering Rules
1. Deterministic logic only (no probabilistic decisions)
2. No sensitive data onchain or in logs
3. Confidential HTTP is mandatory (post-Feb 14)
4. AI is advisory, never authoritative
5. Worst-of aggregation governs compliance
6. No scope expansion without approval
If a change violates these → do not implement it.
 
🧱 System Scope (Locked)
CompliGuard Enforces
• Reserve ratio (assets ÷ liabilities)
• Proof freshness
• Asset quality & concentration
• Deterministic compliance state: GREEN | YELLOW | RED
CompliGuard Outputs
• Status
• Reason (AI-generated explanation)
• Policy version
• Evidence hash
• Timestamp
CompliGuard Does NOT
• Encode legal text
• Run sanctions lists
• Identify counterparties
• Issue legal or regulatory certifications
 
📅 Milestone Breakdown
 
🔒 Milestone 1 — Core Enforcement Engine
Feb 6 – Feb 12
Goal:
“The compliance engine is complete and production-credible.”
Deliverables
1. Reserve Attestation API (Mock PoR)
Owner: Backend Dev
• Endpoint: GET /attestation/latest
• Deterministic scenarios:
o healthy
o at_risk
o non_compliant
{
 "issuer": "string",
 "attestationId": "string",
 "lastAttestedAt": 0,
 "reservesUsd": 0,
 "liabilitiesUsd": 0,
 "composition": [
   { "asset": "CASH", "amountUsd": 0, "risk": "SAFE" }
 ]
}
⚠️ No auth, no randomness, no external dependencies
 
2. Policy Engine (Authoritative)
Owner: Platform Dev
Locked thresholds:
• Reserve Ratio
o ≥ 1.02 → GREEN
o 1.00–1.019 → YELLOW
o < 1.00 → RED
• Freshness
o ≤ 6h → GREEN
o 6–24h → YELLOW
o 24h → RED
• Composition
o Disallowed asset → RED
o Risky assets > 30% → RED
o Concentration > 75% → YELLOW
Aggregation:
Worst-of wins
Output:
{
 "baseStatus": "RED",
 "signals": {},
 "policyVersion": "v1.0.0"
}
 
3. AI Reasoning Agent
Owner: AI / Backend Dev
• Input: policy output
• Output: human-readable explanation
• Cannot modify severity
• Failure must degrade gracefully
 
4. CRE Workflow (Non-Confidential Phase)
Owner: Lead + CRE-enabled Dev
• Orchestrate:
o attestation fetch
o policy evaluation
o AI explanation
• Handle retries + failures
• No Confidential HTTP yet (pre-Feb 14)
 
Exit Criteria (Milestone 1)
• One CRE simulation runs end-to-end
• GREEN → RED transition works
• Logs show:
o inputs (non-sensitive)
o triggered rules
o final status
• Architecture frozen
❌ No frontend
❌ No privacy wiring yet
❌ No new features
 
🔐 Milestone 2 — Privacy Integration (Critical)
Feb 14 – Feb 19
Goal:
“Sensitive data never leaves the privacy boundary.”
Deliverables
1. CRE Confidential HTTP Integration
Owner: CRE-enabled Dev
• Replace attestation fetch with:
o Confidential HTTP
• Seal:
o API credentials
o request parameters
o response payloads
• Ensure:
o no sensitive data in logs
o no sensitive data in calldata
 
2. Privacy Boundary Documentation
Owner: Lead
Add explicit workflow step:
[Confidential HTTP Fetch]
       ↓
[Offchain Policy Evaluation]
       ↓
[Status + Evidence Emission]
 
3. Evidence Hashing
Owner: Backend Dev
• Hash sensitive inputs before emitting evidence
• Emit:
o hash
o status
o timestamp
o policy version
 
Exit Criteria (Milestone 2)
• Confidential HTTP live
• API keys never exposed
• Raw balances never visible
• Privacy track requirements clearly satisfied
 
🧪 Milestone 3 — Hardening & Optional Read-Only Frontend
Feb 20 – Feb 23
Goal:
“System is reliable, boring, and predictable.”
Deliverables
• Failure-mode tests:
o stale data
o API timeout
o AI failure
• Determinism verification
• Optional read-only status UI:
o status
o reason
o timestamp
o ❌ no controls
Timebox frontend: ≤ 1 day
 
🎥 Milestone 4 — Demo & Submission Readiness
Feb 24 – Feb 27
Goal:
“Judges understand this in 90 seconds.”
Deliverables
• Final demo script
• 3–5 minute demo video
• Clean README
• Track-specific submission blurbs
Demo flow:
1. GREEN state
2. Confidential HTTP fetch
3. Policy violation
4. RED state
5. Explanation shown
6. Privacy preserved
 
📦 Milestone 5 — Final Freeze & Submission
Feb 28 – March 1
Goal:
“Nothing breaks. Nothing surprises.”
• Final CRE simulation
• Verify links & repo
• Submit early
❌ No new features
❌ No refactors
 
🧠 Daily Developer Standup (Required)
Each dev answers:
1. What did I build?
2. Which rule does it support?
3. How does it fail safely?
 
✅ Final Definition of Done
CompliGuard is complete when:
• Compliance state is deterministic
• Sensitive data is never exposed
• CRE orchestrates end-to-end
• Privacy track criteria are met
• Demo is calm, clear, and credible
 
🔒 FINAL LOCK STATEMENT
CompliGuard is a privacy-preserving compliance enforcement engine that operationalizes GENIUS-, CLARITY-, and sanctions-aligned controls using deterministic rules orchestrated through Chainlink CRE.
 