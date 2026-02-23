# CompliGuard CRE Workflow

Privacy-preserving compliance enforcement running on **Chainlink Runtime Environment (CRE)**.

This workflow reads real Chainlink Proof of Reserve data directly from Ethereum mainnet,
evaluates a 4-control compliance policy inside the DON, and anchors the result on Sepolia.

## Project Structure

```
cre-workflow/
├── compliance-monitor/          # CRE workflow (compiled to WASM)
│   ├── main.ts                  # Workflow logic (entry point)
│   ├── config.staging.json      # Staging config (feed addresses, API URLs)
│   ├── config.production.json   # Production config
│   ├── workflow.yaml            # CRE workflow metadata
│   ├── package.json             # Workflow dependencies
│   └── tsconfig.json            # TypeScript config
├── contracts/
│   └── abi/
│       ├── AggregatorV3.ts      # Chainlink AggregatorV3Interface ABI
│       ├── ERC20.ts             # ERC20 totalSupply ABI
│       └── index.ts             # Barrel export
├── project.yaml                 # Global CRE project config (RPCs, targets)
├── secrets.yaml                 # Secret name declarations
├── .env.example                 # Environment variable template
├── config.json                  # Legacy config (kept for reference)
└── main.ts                      # Legacy workflow (kept for reference)
```

## Quick Start

### 1. Install the CRE CLI

```bash
# macOS (Apple Silicon)
curl -L https://cre.chain.link/cli/latest/cre-cli-darwin-arm64 -o cre
chmod +x cre && sudo mv cre /usr/local/bin/

# macOS (Intel)
curl -L https://cre.chain.link/cli/latest/cre-cli-darwin-amd64 -o cre
chmod +x cre && sudo mv cre /usr/local/bin/

# Linux
curl -L https://cre.chain.link/cli/latest/cre-cli-linux-amd64 -o cre
chmod +x cre && sudo mv cre /usr/local/bin/
```

### 2. Authenticate

```bash
cre login
cre whoami    # verify
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env — add your funded Sepolia private key (64-char hex, no 0x)
```

### 4. Install Dependencies

```bash
cd compliance-monitor
bun install
cd ..
```

### 5. Simulate the Workflow

```bash
cre workflow simulate compliance-monitor --target staging-settings
```

## Workflow Pipeline

```
[Cron Trigger — every 5 minutes]
       |
       v
[Step 1] EVM Read (Ethereum Mainnet)
  ├── Chainlink WBTC PoR Feed — latestRoundData()
  ├── BTC/USD Price Feed — latestRoundData() + decimals()
  └── WBTC ERC20 — totalSupply()
       |
       v
[Step 2] Deterministic Policy Evaluation (inside DON)
  ├── Reserve Ratio      (>=1.02x GREEN, >=1.0x YELLOW, <1.0x RED)
  ├── Proof Freshness    (<=12h GREEN, <=24h YELLOW, >24h RED)
  ├── Asset Quality      (Chainlink-verified = GREEN always)
  └── Asset Concentration (<=60% GREEN, <=75% YELLOW, >75% RED)
       |
       v
[Step 3] Evidence Hash Generation (privacy-preserving)
  └── Deterministic hash of control results + policy version
       |
       v
[Step 4] Backend Notification (HTTP POST with DON consensus)
  └── POST /api/run — sends result to CompliGuard dashboard
       |
       v
[Step 5] On-Chain Anchoring (Sepolia via EVMClient.writeReport)
  └── ABI-encoded (status, evidenceHash, policyVersion, timestamp)
```

## Privacy Guarantees

- API credentials **sealed via CRE secrets** — never in logs or on-chain
- Raw reserve/liability USD values **processed inside the DON only**
- Only **compliance status + evidence hash** emitted on-chain
- All policy rules are **deterministic** — identical results across DON nodes

## On-Chain Data Sources

| Feed | Address | Data |
|------|---------|------|
| **WBTC PoR** | `0xa81FE04086865e63E12dD3776978E49DEEa2ea4e` | BTC reserves backing WBTC |
| **BTC/USD** | `0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c` | Bitcoin price in USD |
| **WBTC Token** | `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` | Circulating supply (liabilities) |

## Hackathon Prize Tracks

This workflow targets multiple Chainlink Convergence Hackathon tracks:

| Track | How CompliGuard Qualifies |
|-------|---------------------------|
| **Best Use of CRE** | Full CRE workflow: EVM reads + HTTP + EVM write + cron trigger |
| **Best Use of Chainlink Data** | Reads WBTC PoR + BTC/USD price feeds on mainnet |
| **Privacy Track** | Confidential HTTP ready; raw values never leave DON |
| **DeFi Track** | Automated compliance monitoring for wrapped-asset reserves |
