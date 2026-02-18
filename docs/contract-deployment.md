# CompliGuard Smart Contract Deployment

## Deployed Contract

| Field | Value |
|-------|-------|
| **Network** | Ethereum Sepolia Testnet |
| **Chain ID** | 11155111 |
| **Contract Address** | `0xf9BaAE04C412c23BC750E79C84A19692708E71b9` |
| **Deployer** | `0xa58DCCb0F17279abD1d0D9069Aa8711Df4a4c58E` |
| **Deployment TX** | `0xbbffa19c13cb50579dada8da8f4496c35b5c8aa83971b1d01949c9a9390ac357` |
| **Block Explorer** | [View on Etherscan](https://sepolia.etherscan.io/address/0xf9BaAE04C412c23BC750E79C84A19692708E71b9) |

## Contract Functions

### Write Functions

#### `receiveReport(uint8 _status, bytes32 _evidenceHash, string _policyVersion, uint256 _timestamp, uint8 _controlCount)`

Receives a compliance report from the CRE workflow.

| Parameter | Type | Description |
|-----------|------|-------------|
| `_status` | uint8 | 0=GREEN, 1=YELLOW, 2=RED |
| `_evidenceHash` | bytes32 | SHA256 hash of evaluation inputs |
| `_policyVersion` | string | Policy version (e.g., "1.0.0") |
| `_timestamp` | uint256 | Unix timestamp |
| `_controlCount` | uint8 | Number of controls evaluated |

### Read Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `getLatestStatus()` | uint8 | Latest compliance status |
| `getReportCount()` | uint256 | Total reports received |
| `getReport(uint256 index)` | Report | Get report by index |
| `hasReport(bytes32 hash)` | bool | Check if hash exists |
| `latestReport()` | Report | Full latest report struct |

## Test Commands

```bash
# Check report count
cast call 0xf9BaAE04C412c23BC750E79C84A19692708E71b9 "getReportCount()" --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Check latest status (0=GREEN, 1=YELLOW, 2=RED)
cast call 0xf9BaAE04C412c23BC750E79C84A19692708E71b9 "getLatestStatus()" --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Send a test report
cast send 0xf9BaAE04C412c23BC750E79C84A19692708E71b9 \
  "receiveReport(uint8,bytes32,string,uint256,uint8)" \
  0 \
  0x$(openssl rand -hex 32) \
  "1.0.0" \
  $(date +%s) \
  4 \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY
```

## Events

### ComplianceReportReceived

Emitted when a new report is received.

```solidity
event ComplianceReportReceived(
    uint8 indexed status,
    bytes32 evidenceHash,
    string policyVersion,
    uint256 timestamp,
    uint8 controlCount
);
```

## First Test Report

| Field | Value |
|-------|-------|
| **TX Hash** | `0xa27d9f54923542920761a85f3be4e8cff01bc9aca393dc8ce2a2a82f86ba68c5` |
| **Status** | 0 (GREEN) |
| **Policy Version** | 1.0.0 |
| **Control Count** | 4 |
| **Block** | 10287611 |

## Integration with CRE Workflow

The CRE workflow sends reports to this contract via the `receiveReport` function. The workflow:

1. Fetches reserve and liability data via ConfidentialHTTPClient
2. Evaluates 4 compliance rules
3. Generates evidence hash
4. Calls `receiveReport()` on-chain

Configuration in `config.production.json`:
```json
{
  "compliGuardReceiver": "0xf9BaAE04C412c23BC750E79C84A19692708E71b9",
  "chainId": 11155111
}
```
