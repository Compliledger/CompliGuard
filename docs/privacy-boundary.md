# Privacy Boundary Architecture

> **Plan.md M2 Requirement**: "Sensitive data never leaves the privacy boundary."

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRIVACY BOUNDARY (CRE DON)                    │
│                                                                  │
│  ┌─────────────────────┐                                         │
│  │  CRE Vault           │                                        │
│  │  • RESERVE_API_KEY   │─────────┐                              │
│  │  • LIABILITY_API_KEY  │         │                              │
│  └─────────────────────┘         │                              │
│                                   ▼                              │
│  ┌────────────────────────────────────────────┐                  │
│  │   Confidential HTTP Fetch                   │                  │
│  │   • API credentials sealed inside DON       │                  │
│  │   • Request params never logged             │                  │
│  │   • Response payloads stay offchain          │                  │
│  └─────────────────────┬──────────────────────┘                  │
│                        │                                         │
│                        ▼                                         │
│  ┌────────────────────────────────────────────┐                  │
│  │   Raw Data (NEVER LEAVES THIS BOUNDARY)     │                  │
│  │   • Reserve values (USD amounts)             │                  │
│  │   • Liability values (circulating supply)    │                  │
│  │   • Asset composition (individual holdings)  │                  │
│  │   • API response payloads                    │                  │
│  └─────────────────────┬──────────────────────┘                  │
│                        │                                         │
│                        ▼                                         │
│  ┌────────────────────────────────────────────┐                  │
│  │   Offchain Policy Evaluation                │                  │
│  │   • Deterministic rules (no probability)    │                  │
│  │   • Worst-of aggregation                    │                  │
│  │   • 4 controls evaluated                    │                  │
│  │   • Evidence hash computed (SHA-256)         │                  │
│  └─────────────────────┬──────────────────────┘                  │
│                        │                                         │
│                        ▼                                         │
│  ┌────────────────────────────────────────────┐                  │
│  │   AI Reasoning (Advisory Only)              │                  │
│  │   • Cannot modify severity                  │                  │
│  │   • Generates human-readable explanation    │                  │
│  │   • Failure degrades gracefully             │                  │
│  └─────────────────────┬──────────────────────┘                  │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────┐
│   Status + Evidence Emission (PUBLIC)       │
│   ✅ Compliance status (GREEN/YELLOW/RED)   │
│   ✅ Policy version (v1.0.0)                │
│   ✅ Evidence hash (SHA-256)                 │
│   ✅ Evaluation timestamp                    │
│   ✅ Human-readable explanation              │
│   ❌ NO raw reserve values                   │
│   ❌ NO liability amounts                    │
│   ❌ NO API credentials                      │
│   ❌ NO asset composition details             │
└────────────────────────────────────────────┘
```

## Data Classification Matrix

| Data Element | Classification | Boundary | Emitted? |
|-------------|---------------|----------|----------|
| API keys (RESERVE_API_KEY, LIABILITY_API_KEY) | **SECRET** | CRE Vault only | ❌ Never |
| Reserve USD values | **CONFIDENTIAL** | DON memory only | ❌ Never |
| Liability USD values | **CONFIDENTIAL** | DON memory only | ❌ Never |
| Asset composition (holdings) | **CONFIDENTIAL** | DON memory only | ❌ Never |
| HTTP request parameters | **CONFIDENTIAL** | DON memory only | ❌ Never |
| HTTP response payloads | **CONFIDENTIAL** | DON memory only | ❌ Never |
| Compliance status | **PUBLIC** | On-chain / API | ✅ Always |
| Evidence hash | **PUBLIC** | On-chain / API | ✅ Always |
| Policy version | **PUBLIC** | On-chain / API | ✅ Always |
| Evaluation timestamp | **PUBLIC** | On-chain / API | ✅ Always |
| AI explanation | **PUBLIC** | API only | ✅ Always |
| Control-level status (GREEN/YELLOW/RED per rule) | **PUBLIC** | API only | ✅ Always |

## CRE Confidential HTTP Guarantees

1. **Credential Sealing**: API keys are stored in CRE Vault and accessed via `runtime.getSecret()`. They are never visible to any individual DON node, logs, or on-chain calldata.

2. **Request Privacy**: HTTP requests made via `ConfidentialHTTPClient` seal request parameters inside the DON. The URL, headers, and body are not visible outside the execution environment.

3. **Response Privacy**: API responses (reserve balances, liability data) are processed entirely offchain within the DON. Only derived outputs (status, hash, timestamp) are emitted.

4. **Consensus Aggregation**: Multiple DON nodes independently fetch and validate the same data. Consensus ensures correctness without any single node having special access.

## Evidence Hashing

Sensitive inputs are hashed before any emission:

```
evidenceHash = SHA-256(
  reserveData.totalValue +
  liabilityData.totalValue +
  reserveData.attestationTimestamp +
  controlResults[]
)
```

The hash allows anyone to **verify** that a specific evaluation occurred, but **cannot** reverse-engineer the input values.

## Verification

To verify the privacy boundary is enforced:

1. **Run tests**: `npm test` — includes privacy enforcement tests
2. **Inspect on-chain output**: Only `(status, evidenceHash, policyVersion, timestamp, controlCount)` are ABI-encoded
3. **Review `cre-workflow/main.ts`**: No raw values appear in `runtime.log()` or `runtime.report()`
4. **Check audit log**: `AuditLogger` stores only hashes and statuses, never raw amounts
