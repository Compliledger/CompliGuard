<div align="center">

# 🛡️ CompliGuard

### Privacy-Preserving Compliance Enforcement with Chainlink CRE

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chainlink CRE](https://img.shields.io/badge/Chainlink-CRE-375BD2)](https://chain.link)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

*Continuous compliance enforcement for financial systems — privacy-preserving, deterministic, and automated.*

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Compliance Controls](#-compliance-controls) • [Documentation](#-documentation)

</div>

---

## 📋 Overview

**CompliGuard** is a production-grade compliance enforcement engine that continuously evaluates and enforces financial safety controls using deterministic rules, private offchain data, and Chainlink's Runtime Environment (CRE).

Unlike traditional compliance tools that rely on periodic reporting and trust, CompliGuard treats compliance as a **runtime system property** — evaluated continuously and enforced automatically.

### The Problem

Modern financial systems (stablecoins, tokenized assets, treasuries, custodians) rely on sensitive, non-public data to meet regulatory expectations:

- Are reserves still covering liabilities?
- Is proof of backing recent and reliable?
- Are reserves held in acceptable, diversified assets?
- What happens immediately when those conditions fail?

**Existing approaches are:** periodic, manual, document-driven, and slow to react.

**CompliGuard provides:** continuous, automated enforcement — without exposing sensitive data.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Continuous Monitoring** | Real-time evaluation of compliance controls |
| 🔐 **Privacy-Preserving** | Sensitive data never exposed on-chain |
| ⚡ **Deterministic Rules** | Machine-readable, auditable policy engine |
| 🔗 **Chainlink CRE** | Secure offchain orchestration |
| 🤖 **AI-Enhanced** | Human-readable explanations (non-decisional) |
| 📊 **Multi-Control** | Reserve ratio, freshness, asset quality |

### What CompliGuard Is

✅ A compliance **enforcement engine**  
✅ A Chainlink CRE **workflow**  
✅ A deterministic **control plane**  
✅ A privacy-preserving **architecture**  
✅ A foundation for **automated safeguards**

### What CompliGuard Is Not

❌ A legal opinion  
❌ A regulatory certification  
❌ A sanctions adjudication engine  
❌ A dashboard or reporting tool  
❌ A replacement for auditors or regulators

> **CompliGuard enforces controls — it does not encode laws.**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     External Regulated APIs         │
│  (reserves, liabilities, signals)   │
└──────────────────┬──────────────────┘
                   │ Confidential HTTP
                   ▼
┌─────────────────────────────────────┐
│   Chainlink Runtime Environment     │
│            (CRE)                    │
│      Offchain Execution Layer       │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│    Deterministic Policy Engine      │
│   ┌─────────┬─────────┬─────────┐   │
│   │ Reserve │  Proof  │  Asset  │   │
│   │  Ratio  │Freshness│ Quality │   │
│   └─────────┴─────────┴─────────┘   │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│     Compliance Status + Evidence    │
│       🟢 GREEN │ 🟡 YELLOW │ 🔴 RED  │
└─────────────────────────────────────┘
```

CRE acts as the orchestration and reliability layer, coordinating private data ingestion, policy execution, and output propagation.

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Chainlink CRE access (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/Compliledger/CompliGuard.git
cd CompliGuard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run in development mode
npm run dev
```

---

## 🔗 Chainlink CRE Files (Required for Submission)

| File | Purpose |
|------|---------|
| [`cre-workflow/main.ts`](./cre-workflow/main.ts) | **Primary CRE workflow** — `Runner`, `handler`, `CronCapability`, `HTTPClient`, `ConfidentialHTTPClient`, `EVMClient`, `runtime.report()` |
| [`cre-workflow/config.json`](./cre-workflow/config.json) | Workflow configuration (schedule, API URLs, report contract address) |
| [`cre-workflow/secrets.yaml`](./cre-workflow/secrets.yaml) | CRE Vault secret declarations (`RESERVE_API_KEY`, `LIABILITY_API_KEY`) |
| [`cre-workflow/README.md`](./cre-workflow/README.md) | CRE setup, simulation, and deployment guide |
| [`src/cre/workflow.ts`](./src/cre/workflow.ts) | Local CRE workflow executor (orchestrates engine + API clients) |
| [`src/cre/http.ts`](./src/cre/http.ts) | HTTP adapter (Node ↔ CRE mode switching) |
| [`src/cre/confidential-http.ts`](./src/cre/confidential-http.ts) | Confidential HTTP bridge (local fallback; CRE uses SDK directly) |
| [`src/cre/run.ts`](./src/cre/run.ts) | Local workflow runner (`npm run workflow`) |
| [`docs/privacy-boundary.md`](./docs/privacy-boundary.md) | Privacy boundary architecture and data classification |

---

## 🧪 Run with CRE (Simulation / Deployment)

```bash
# Simulate the CRE workflow via CLI
cd cre-workflow
cre workflow simulate --config config.json --secrets secrets.yaml main.ts

# Deploy to CRE network
cre workflow deploy --config config.json --secrets secrets.yaml main.ts
```

**Local workflow run (without CRE CLI):**
```bash
npm install

# Terminal 1 — Start API server
npm run server

# Terminal 2 — Run local workflow
npm run workflow
```

**Demo scenarios (for video recording):**
```bash
# Switch to healthy (GREEN)
curl -X POST http://localhost:3001/api/simulate/scenario -H 'Content-Type: application/json' -d '{"scenario":"healthy"}'

# Switch to at-risk (YELLOW)
curl -X POST http://localhost:3001/api/simulate/scenario -H 'Content-Type: application/json' -d '{"scenario":"at_risk"}'

# Switch to non-compliant (RED)
curl -X POST http://localhost:3001/api/simulate/scenario -H 'Content-Type: application/json' -d '{"scenario":"non_compliant"}'

# Get current compliance status
curl http://localhost:3001/api/compliance/status
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

---

## 📏 Compliance Controls

CompliGuard enforces explicit, machine-readable financial safety controls.

### 1️⃣ Asset Coverage (Reserve Ratio)

```
reserve_ratio = reserves / liabilities
```

| Condition | Status |
|-----------|--------|
| ≥ 1.02 | 🟢 GREEN |
| 1.00–1.019 | 🟡 YELLOW |
| < 1.00 | 🔴 RED |

### 2️⃣ Proof Freshness

| Attestation Age | Status |
|-----------------|--------|
| ≤ 6 hours | 🟢 GREEN |
| 6–24 hours | 🟡 YELLOW |
| > 24 hours | 🔴 RED |

### 3️⃣ Asset Quality & Concentration

| Condition | Status |
|-----------|--------|
| Disallowed assets present | 🔴 RED |
| Risky assets > 30% | 🔴 RED |
| Single-asset concentration > 75% | 🟡 YELLOW |

### Aggregation Rule

> **Worst-of wins.** If any required control fails, the system is non-compliant.

This mirrors real-world prudential logic used by regulators and auditors.

---

## 🔐 Privacy Architecture

CompliGuard is **privacy-preserving by design**, using Chainlink CRE's Confidential HTTP capability to securely integrate sensitive Web2 data into decentralized workflows.

### Data Classification

| Never Exposed | Safely Exposed |
|---------------|----------------|
| API keys and credentials | Compliance status (GREEN/YELLOW/RED) |
| Raw reserve values | Policy version |
| Liability values | Cryptographic evidence hash |
| Detailed asset composition | Evaluation timestamp |
| Internal evaluation logic | Human-readable explanation |

### Privacy Flow

```
[Confidential HTTP Fetch] → [Offchain Policy Evaluation] → [Status + Evidence Emission]
```

> See [Privacy Boundary Architecture](./docs/privacy-boundary.md) for the complete data flow diagram, classification matrix, and verification steps.

---

## 🔐 Regulatory Alignment

CompliGuard is policy-agnostic and designed to operationalize regulatory requirements without hardcoding statutory language.

### Alignment with Modern Regulation

Modern regulation (GENIUS, CLARITY, etc.) emphasizes:

- ✅ Continuous monitoring
- ✅ Verified reserve backing
- ✅ Clear, enforceable controls
- ✅ Immediate response to breaches
- ✅ Use of non-public, regulated data

> **Laws define obligations. Risk systems detect exposure. CompliGuard enforces consequences.**

---

## 🤖 AI Usage

AI is used **only** to generate human-readable explanations of deterministic outcomes.

- AI does **not** decide compliance
- AI **cannot** override rules
- AI failure does **not** affect enforcement

This ensures: **auditability**, **determinism**, and **explainability without risk**.

---

## ⚙️ Chainlink CRE Integration

CompliGuard uses Chainlink CRE to:

- 🔄 Orchestrate offchain workflows
- 🔐 Securely integrate external APIs
- 🔁 Manage retries and failures
- 🖥️ Execute confidential computation
- ✅ Produce verifiable execution outcomes

**CRE is the control plane that makes CompliGuard production-ready.**

---

## 🧪 Demo Flow

A typical demonstration (3–5 minutes):

1. System starts **🟢 GREEN**
2. Confidential reserve data is ingested
3. Policy rules are evaluated offchain
4. A control threshold is violated
5. Status flips to **🔴 RED**
6. Explanation is generated
7. **Sensitive data remains private throughout**

---

## 📁 Project Structure

```
CompliGuard/
├── cre-workflow/              # Chainlink CRE workflow (production)
│   ├── main.ts                # CRE SDK workflow (Runner, handler, ConfidentialHTTP)
│   ├── config.json            # Workflow configuration
│   ├── secrets.yaml           # CRE Vault secret declarations
│   ├── .env.example           # Environment template
│   └── README.md              # CRE setup guide
├── src/
│   ├── core/                  # Core policy engine
│   │   ├── engine.ts          # Deterministic compliance engine
│   │   ├── ai-reasoning.ts    # AI reasoning agent (advisory only)
│   │   ├── audit.ts           # Tamper-proof audit logger
│   │   ├── validation.ts      # Zod schema validation
│   │   ├── rules/             # 4 compliance rules
│   │   │   ├── reserve-ratio.rule.ts
│   │   │   ├── proof-freshness.rule.ts
│   │   │   ├── asset-quality.rule.ts
│   │   │   └── asset-concentration.rule.ts
│   │   └── types.ts           # Type definitions
│   ├── api/                   # API layer
│   │   ├── server.ts          # API server + compliance status endpoints
│   │   └── clients.ts         # Reserve/liability API clients (retry, cache)
│   ├── cre/                   # CRE integration (local mode)
│   │   ├── workflow.ts        # Local CRE workflow executor
│   │   ├── http.ts            # HTTP adapter (Node/CRE mode)
│   │   ├── confidential-http.ts # Confidential HTTP bridge
│   │   └── run.ts             # CLI runner
│   └── utils/                 # Utilities (hash, logger)
├── tests/                     # 38 tests (engine, AI, audit, determinism, integration)
├── docs/
│   └── privacy-boundary.md    # Privacy boundary architecture
└── progress.md                # Milestone tracker
```

---

## 🏁 Hackathon Tracks

| Track | Status |
|-------|--------|
| Risk & Compliance | ✅ Primary |
| Privacy (Confidential HTTP) | ✅ Primary |
| AI | ➕ Supporting |
| Infrastructure / Orchestration | ➕ Supporting |

---

## 🧩 Why This Matters

> **Compliance cannot be slower than risk.**

CompliGuard turns compliance from a periodic promise into a **continuously enforced system property** — while preserving privacy, auditability, and institutional trust.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**CompliGuard** — *Privacy-preserving compliance enforcement, powered by Chainlink CRE.*

</div>
