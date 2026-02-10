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

## 🔗 Chainlink Usage (Required)

- `src/cre/workflow.ts` — CRE workflow definition and orchestration entrypoint
- `(Feb 14) src/cre/confidential-http.ts` — Confidential HTTP integration (privacy track)
- Additional Chainlink-related files will be added alongside CRE features

---

## 🧪 Run with CRE (Simulation / Deployment)

```bash
# Simulate the workflow (placeholder commands; align with CRE CLI)
cre workflow simulate --workflow ./src/cre/workflow.ts

# Deploy the workflow (placeholder commands; align with CRE CLI)
cre workflow deploy --workflow ./src/cre/workflow.ts
```

**Local workflow run (today):**
```bash
npm install

# Terminal 1
npm run mock-server

# Terminal 2
npm run workflow
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
compliGuard/
├── src/
│   ├── core/              # Core policy engine
│   │   ├── engine.ts      # Main compliance engine
│   │   ├── rules/         # Compliance rule definitions
│   │   └── types.ts       # Type definitions
│   ├── api/               # Mock APIs for testing
│   │   └── mock-server.ts # Reserve/liability mock server
│   ├── cre/               # Chainlink CRE integration
│   │   └── workflow.ts    # CRE workflow definitions
│   └── utils/             # Utility functions
├── tests/                 # Test suites
├── docs/                  # Documentation
└── config/                # Configuration files
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
