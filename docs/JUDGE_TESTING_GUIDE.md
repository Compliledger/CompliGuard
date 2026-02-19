# 🏆 CompliGuard — Judge & Tester Guide

> **No setup required. Everything is live on real infrastructure.**

---

## 🚀 Quick Start (30 seconds)

### Step 1: Open the Live Dashboard
```
https://frontend-lran1il1i-satyam-10124s-projects.vercel.app/dashboard
```

### Step 2: View Real Blockchain Data
Scroll down to see the **"On-Chain Verification"** panel showing:
- Live connection to Sepolia testnet
- Real report count from the smart contract
- Latest compliance status stored on-chain

### Step 3: Try Different Scenarios
Click the scenario buttons at the bottom:
- 🟢 **Healthy** — All rules pass
- 🟡 **At Risk** — Warning level
- 🔴 **Non-Compliant** — Enforcement required

---

## 🔗 Live Deployment URLs

| Component | URL | Type |
|-----------|-----|------|
| **Frontend Dashboard** | https://frontend-lran1il1i-satyam-10124s-projects.vercel.app/dashboard | Vercel |
| **Backend API** | https://compli-guard-api-production.up.railway.app | Railway |
| **Smart Contract** | [0xf9BaAE04C412c23BC750E79C84A19692708E71b9](https://sepolia.etherscan.io/address/0xf9BaAE04C412c23BC750E79C84A19692708E71b9) | Sepolia |

---

## 📊 What You'll See on the Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🛡️ CompliGuard                                          [Live • Updated 5s ago]
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔒 Privacy Mode: Chainlink CRE — Confidential HTTP                         │
│                                                                             │
│                    ┌─────────────────────────┐                              │
│                    │     ✅ FULLY COMPLIANT   │                             │
│                    │  No enforcement actions  │                             │
│                    │       required           │                             │
│                    └─────────────────────────┘                              │
│                                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │  Reserve   │ │   Proof    │ │   Asset    │ │   Concen-  │               │
│  │   Ratio    │ │  Freshness │ │  Quality   │ │   tration  │               │
│  │  🟢 1.05x   │ │  🟢 2h old  │ │  🟢 15%     │ │  🟢 50%     │               │
│  │  ≥1.02 ✓   │ │  ≤6h ✓     │ │  ≤30% ✓    │ │  ≤75% ✓    │               │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
│                                                                             │
│  ┌─ AI Explanation ─────────────────────────────────────────────────────┐  │
│  │ "CompliGuard Assessment: COMPLIANT. All 4 compliance controls        │  │
│  │  passed. Reserve backing is verified, proof is fresh, and asset      │  │
│  │  composition meets policy requirements (policy 1.0.0)."              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Metadata ───────────────────────────────────────────────────────────┐  │
│  │  Timestamp: Feb 19, 2026 • 18:45:32 UTC                              │  │
│  │  Policy: v1.0.0  │  Evidence: 0x3e979f0d96ed...                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ On-Chain Verification ─────────────────────────────────── LIVE ─────┐  │
│  │  Network: Sepolia  │  Reports: 3  │  Chain ID: 11155111              │  │
│  │  Contract: 0xf9BaAE04C412...E71b9                                    │  │
│  │  Latest Status: GREEN  │  Controls: 4  │  Policy: 1.0.0              │  │
│  │  Evidence Hash: 0xdac4155f18f8a45ded7fa2f3b2e885acee132129...        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Scenario Controls ──────────────────────────────────────────────────┐  │
│  │  [🟢 Healthy]    [🟡 At Risk]    [🔴 Non-Compliant]                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⛓️ Verify On-Chain Data (Etherscan)

### Method 1: Direct Contract Read
1. Go to: https://sepolia.etherscan.io/address/0xf9BaAE04C412c23BC750E79C84A19692708E71b9#readContract
2. Click **"Read Contract"**
3. Check these functions:
   - `getReportCount()` → Total compliance reports stored
   - `getLatestStatus()` → 0=GREEN, 1=YELLOW, 2=RED
   - `latestReport()` → Full report with evidence hash

### Method 2: API Endpoint
```bash
# Get on-chain summary
curl https://compli-guard-api-production.up.railway.app/api/onchain/summary | jq

# Get all on-chain reports
curl https://compli-guard-api-production.up.railway.app/api/onchain/reports | jq

# Verify specific evidence hash
curl https://compli-guard-api-production.up.railway.app/api/onchain/verify/0x1234...
```

### Method 3: Cast CLI (for developers)
```bash
# Check report count
cast call 0xf9BaAE04C412c23BC750E79C84A19692708E71b9 "getReportCount()" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Check latest status
cast call 0xf9BaAE04C412c23BC750E79C84A19692708E71b9 "getLatestStatus()" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

---

## 🔐 Privacy Architecture (Key Differentiator)

### What's Private (Never Exposed)
| Data | Location | Access |
|------|----------|--------|
| Reserve amounts ($494M) | CRE TEE | ❌ Never public |
| Liability amounts ($470M) | CRE TEE | ❌ Never public |
| Individual asset holdings | CRE TEE | ❌ Never public |
| API credentials | CRE Vault | ❌ Sealed secrets |

### What's Public (On-Chain)
| Data | Location | Purpose |
|------|----------|---------|
| Compliance status (GREEN/YELLOW/RED) | Smart Contract | Enforcement trigger |
| Evidence hash | Smart Contract | Proves evaluation happened |
| Policy version | Smart Contract | Audit trail |
| Control count | Smart Contract | Completeness check |

### How Privacy is Achieved
```
┌─────────────────────────────────────────────────────────────────┐
│                  CHAINLINK CRE (Trusted Execution)              │
│                                                                 │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │
│   │  RESERVE    │      │ COMPLIANCE  │      │   REPORT    │    │
│   │    API      │ ───▶ │   ENGINE    │ ───▶ │  GENERATOR  │    │
│   │  (Secret)   │      │  (Private)  │      │  (Hash)     │    │
│   └─────────────┘      └─────────────┘      └─────────────┘    │
│         │                                          │            │
│         ▼                                          ▼            │
│   ┌─────────────┐                          ┌─────────────┐     │
│   │ LIABILITY   │                          │   ON-CHAIN  │     │
│   │    API      │                          │   REPORT    │     │
│   │  (Secret)   │                          │ (Public)    │     │
│   └─────────────┘                          └─────────────┘     │
│                                                                 │
│   🔒 All computation happens inside TEE                        │
│   🔒 Raw data NEVER leaves the enclave                         │
│   🔒 Only compliance verdict goes on-chain                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Scenarios

### Scenario 1: Healthy (GREEN)
Click **"Healthy"** button:
- Reserve ratio: 1.05x (above 1.02 threshold) ✅
- Proof age: 2 hours (under 6 hour limit) ✅
- Risky assets: 15% (under 30% limit) ✅
- Max concentration: 50% (under 75% limit) ✅

### Scenario 2: At Risk (YELLOW)
Click **"At Risk"** button:
- Reserve ratio: 1.01x (just below threshold) ⚠️
- Proof age: 10 hours (over 6 hour limit) ⚠️
- Risky assets: 28% (approaching limit) ⚠️
- Max concentration: 78% (over limit) ⚠️

### Scenario 3: Non-Compliant (RED)
Click **"Non-Compliant"** button:
- Reserve ratio: 0.92x (under-collateralized) ❌
- Proof age: 30 hours (stale) ❌
- Risky assets: 40% (over limit) ❌
- Disallowed assets present ❌

---

## 📁 Key Code Files for Review

| File | Purpose | Lines |
|------|---------|-------|
| [`compliGuard/compliance-monitor/main.ts`](../compliGuard/compliance-monitor/main.ts) | CRE workflow with ConfidentialHTTPClient | 391 |
| [`src/core/engine.ts`](../src/core/engine.ts) | Compliance evaluation engine | ~150 |
| [`src/core/rules/`](../src/core/rules/) | 4 compliance rule implementations | 4 files |
| [`contracts/src/CompliGuardReceiver.sol`](../contracts/src/CompliGuardReceiver.sol) | On-chain report storage | 113 |
| [`src/api/onchain-reader.ts`](../src/api/onchain-reader.ts) | Blockchain data reader | ~170 |
| [`docs/privacy-boundary.md`](./privacy-boundary.md) | Privacy architecture docs | 98 |

---

## 🎯 Chainlink CRE Features Used

| Feature | Implementation | File |
|---------|----------------|------|
| `ConfidentialHTTPClient` | Fetch reserve/liability data privately | `main.ts:245-255` |
| `CronCapability` | Scheduled compliance checks | `main.ts:354` |
| `EVMClient` | Read on-chain token data | `main.ts:94-126` |
| `runtime.report()` | Generate signed report | `main.ts:210-217` |
| `runtime.getSecret()` | Access sealed API keys | Used via config |
| `ConsensusAggregation` | Multi-node agreement | `main.ts:250-253` |

---

## ✅ Hackathon Submission Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Working demo | ✅ | https://frontend-lran1il1i-satyam-10124s-projects.vercel.app |
| Chainlink CRE integration | ✅ | `main.ts` with ConfidentialHTTPClient |
| Smart contract deployed | ✅ | Sepolia: `0xf9BaAE...E71b9` |
| Real blockchain transactions | ✅ | 3+ reports on-chain |
| Privacy preservation | ✅ | Raw data never exposed |
| Documentation | ✅ | README, privacy-boundary.md |
| Source code | ✅ | GitHub repo |

---

## 🆘 Troubleshooting

### Dashboard shows "Connecting to Sepolia..."
- Wait 5-10 seconds for RPC connection
- Check browser console for errors
- Sepolia RPC may have temporary issues

### On-chain reports show 0
- Real reports have been submitted
- Verify on Etherscan directly

### API returns error
- Railway deployment may be spinning up (cold start)
- Retry in 10-20 seconds

---

## 📞 Contact

For any issues during judging, the system is designed to be self-explanatory through the UI. All real blockchain data can be independently verified on Etherscan.

**Sepolia Contract**: `0xf9BaAE04C412c23BC750E79C84A19692708E71b9`
