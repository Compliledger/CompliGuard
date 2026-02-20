# CompliGuard CRE Workflow

Privacy-preserving compliance enforcement running on **Chainlink Runtime Environment (CRE)**.

## Quick Start

### 1. Install the CRE CLI

```bash
# macOS (Apple Silicon)
curl -L https://cre.chain.link/cli/latest/cre-cli-darwin-arm64 -o cre
chmod +x cre
sudo mv cre /usr/local/bin/

# macOS (Intel)
curl -L https://cre.chain.link/cli/latest/cre-cli-darwin-amd64 -o cre
chmod +x cre
sudo mv cre /usr/local/bin/

# Linux
curl -L https://cre.chain.link/cli/latest/cre-cli-linux-amd64 -o cre
chmod +x cre
sudo mv cre /usr/local/bin/
```

### 2. Login to CRE

```bash
cre auth login
```

### 3. Configure

Edit `config.json` with your API endpoints:

```json
{
  "schedule": "0 */5 * * * *",
  "reserveApiUrl": "http://localhost:3001",
  "liabilityApiUrl": "http://localhost:3001"
}
```

### 4. Set up secrets (for simulation)

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 5. Start API Server (in a separate terminal)

```bash
cd .. && npm run server
```

### 6. Simulate the workflow

```bash
cre workflow simulate --workflow-file main.ts --config-file config.json
```

## Modes

| Mode | Handler | Use Case |
|------|---------|----------|
| **Standard** | `initWorkflow` | Simulation, non-confidential |
| **Privacy Track** | `initWorkflowConfidential` | ConfidentialHTTPClient (seals data in DON) |
| **With Secrets** | `initWorkflowWithSecrets` | Sealed API keys via CRE Vault |

To switch modes, change the `runner.run()` call in `main.ts`.

## Privacy Guarantees

- API keys are **sealed via CRE secrets** — never in logs or on-chain
- Raw reserve/liability values **never leave the DON**
- Only **compliance status + SHA-256 evidence hash** are emitted
- All compliance rules are **deterministic** — no probabilistic logic

## Architecture

```
[CRE Cron Trigger]
       ↓
[HTTPClient / ConfidentialHTTPClient]
  → Fetch reserves (with DON consensus)
  → Fetch liabilities (with DON consensus)
       ↓
[Deterministic Compliance Rules]
  → Reserve ratio check
  → Proof freshness check
  → Asset quality check
  → Concentration check
       ↓
[Worst-of Aggregation → GREEN/YELLOW/RED]
       ↓
[Evidence Hash + Status Emission]
  → Only safe data leaves the DON
```
