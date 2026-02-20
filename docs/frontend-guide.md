# CompliGuard — Frontend Developer Guide

> **Scope**: Read-only compliance status dashboard.  
> **Timebox**: ≤ 1 day (per plan.md M3).  
> **Backend**: `http://localhost:3001` (mock API server with CORS enabled).

---

## 1. Tech Stack (Recommended)

| Layer | Tool | Why |
|-------|------|-----|
| Framework | **React 18 + Vite** | Fast dev server, tree-shaking |
| Styling | **TailwindCSS** | Rapid UI, utility-first |
| Components | **shadcn/ui** | Polished, accessible primitives |
| Icons | **Lucide React** | Clean icon set |
| HTTP | **fetch** or **axios** | Simple GET/POST calls |
| State | **React Query (TanStack)** | Auto-polling, caching, refetch |

---

## 2. API Endpoints

Base URL: `http://localhost:3001`

### 2.1 `GET /api/compliance/status`

Returns the **current** compliance evaluation. This is the primary endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-02-15T10:30:00.000Z",
    "status": "GREEN",
    "evidenceHash": "0xabc123...",
    "policyVersion": "1.0.0",
    "explanation": "CompliGuard Assessment: COMPLIANT. All 4 compliance controls passed...",
    "controls": [
      {
        "controlType": "RESERVE_RATIO",
        "status": "GREEN",
        "value": 1.05,
        "threshold": 1.02,
        "message": "Reserve ratio 1.050 >= 1.02 threshold",
        "timestamp": "2026-02-15T10:30:00.000Z"
      },
      {
        "controlType": "PROOF_FRESHNESS",
        "status": "GREEN",
        "value": 2,
        "threshold": 6,
        "message": "Attestation age 2.0h <= 6h threshold",
        "timestamp": "2026-02-15T10:30:00.000Z"
      },
      {
        "controlType": "ASSET_QUALITY",
        "status": "GREEN",
        "value": 15,
        "threshold": 30,
        "message": "Risky assets at 15.0%, below 30% threshold",
        "timestamp": "2026-02-15T10:30:00.000Z"
      },
      {
        "controlType": "ASSET_CONCENTRATION",
        "status": "GREEN",
        "value": 50,
        "threshold": 75,
        "message": "Max concentration 50.0%, below 75% threshold",
        "timestamp": "2026-02-15T10:30:00.000Z"
      }
    ]
  },
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

### 2.2 `GET /api/compliance/history?limit=20`

Returns the last N evaluations (max 50). Use for timeline/chart.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-02-15T10:30:00.000Z",
      "status": "GREEN",
      "evidenceHash": "0xabc123...",
      "policyVersion": "1.0.0",
      "explanation": "...",
      "controls": [...]
    }
  ],
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

### 2.3 `POST /api/simulate/scenario`

Switch demo scenario. Used for live demo during video recording.

**Request body:**
```json
{ "scenario": "healthy" }
```

Valid scenarios: `healthy`, `at_risk`, `non_compliant`

**Response:**
```json
{
  "success": true,
  "scenario": "healthy",
  "state": {
    "reserveMultiplier": 1.05,
    "attestationAgeHours": 2,
    "includeDisallowedAsset": false,
    "riskyAssetPercentage": 15,
    "concentrationPercentage": 50
  },
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

### 2.4 `GET /health`

Health check endpoint.

---

## 3. TypeScript Types

Copy these into your frontend project:

```typescript
type ComplianceStatus = 'GREEN' | 'YELLOW' | 'RED';

type ControlType =
  | 'RESERVE_RATIO'
  | 'PROOF_FRESHNESS'
  | 'ASSET_QUALITY'
  | 'ASSET_CONCENTRATION';

interface ControlResult {
  controlType: ControlType;
  status: ComplianceStatus;
  value?: number;
  threshold?: number;
  message: string;
  timestamp: string;
}

interface ComplianceEntry {
  timestamp: string;
  status: ComplianceStatus;
  evidenceHash: string;
  policyVersion: string;
  explanation: string;
  controls: ControlResult[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

---

## 4. Component Spec

### 4.1 Page Layout

```
┌──────────────────────────────────────────────────┐
│  🛡️ CompliGuard Dashboard              [Refresh] │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         STATUS HERO CARD                 │    │
│  │    🟢 COMPLIANT  |  🟡 AT RISK  |  🔴 RED │    │
│  │    (large, color-coded, center)          │    │
│  │    Policy v1.0.0  •  <timestamp>         │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │ Reserve │ │  Proof  │ │  Asset  │ │ Concen- ││
│  │  Ratio  │ │Freshness│ │ Quality │ │ tration ││
│  │  🟢 1.05 │ │  🟢 2h   │ │  🟢 15%  │ │  🟢 50%  ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         AI EXPLANATION                   │    │
│  │  "CompliGuard Assessment: COMPLIANT..."  │    │
│  │  (read-only text block)                  │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         EVIDENCE                          │    │
│  │  Hash: 0xabc123...                       │    │
│  │  (monospace, truncated with copy button) │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         HISTORY TIMELINE                  │    │
│  │  10:30 🟢  10:25 🟢  10:20 🟡  10:15 🔴  │    │
│  │  (color dots on a timeline)              │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  DEMO CONTROLS (bottom, collapsible)     │    │
│  │  [Healthy] [At Risk] [Non-Compliant]     │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### 4.2 Components Breakdown

| Component | Data Source | Notes |
|-----------|------------ |-------|
| **StatusHero** | `data.status` | Large card. Background: green/yellow/red. Text: COMPLIANT / AT RISK / NON-COMPLIANT |
| **ControlCards** (×4) | `data.controls[]` | One card per control. Show `controlType`, `status` (color dot), `value`, `threshold`, `message` |
| **ExplanationPanel** | `data.explanation` | Read-only text. Render as markdown or preformatted |
| **EvidenceBlock** | `data.evidenceHash`, `data.policyVersion` | Monospace hash, copy-to-clipboard button, policy badge |
| **HistoryTimeline** | `/api/compliance/history` | Horizontal or vertical timeline. Color-coded dots. Click to expand |
| **DemoControls** | `POST /api/simulate/scenario` | 3 buttons: Healthy, At Risk, Non-Compliant. Collapsible panel at bottom |

### 4.3 Color System

```typescript
const STATUS_COLORS = {
  GREEN:  { bg: '#10B981', text: '#065F46', label: 'COMPLIANT' },
  YELLOW: { bg: '#F59E0B', text: '#92400E', label: 'AT RISK' },
  RED:    { bg: '#EF4444', text: '#991B1B', label: 'NON-COMPLIANT' },
};
```

Tailwind classes:
- **GREEN**: `bg-emerald-500 text-emerald-900`
- **YELLOW**: `bg-amber-500 text-amber-900`
- **RED**: `bg-red-500 text-red-900`

---

## 5. Polling Strategy

Use React Query with auto-refetch:

```typescript
import { useQuery } from '@tanstack/react-query';

function useComplianceStatus() {
  return useQuery({
    queryKey: ['compliance-status'],
    queryFn: () =>
      fetch('http://localhost:3001/api/compliance/status')
        .then(r => r.json()),
    refetchInterval: 5000, // poll every 5 seconds
  });
}

function useComplianceHistory(limit = 20) {
  return useQuery({
    queryKey: ['compliance-history', limit],
    queryFn: () =>
      fetch(`http://localhost:3001/api/compliance/history?limit=${limit}`)
        .then(r => r.json()),
    refetchInterval: 10000, // poll every 10 seconds
  });
}
```

---

## 6. Hard Rules (DO NOT VIOLATE)

1. **Read-only** — the dashboard displays data, it does not modify compliance state
2. **No raw financial data** — never display reserve USD values, liability amounts, or asset composition details (these are confidential)
3. **No controls/inputs** that affect compliance evaluation logic
4. **Status is authoritative** — display exactly what the API returns, do not reinterpret
5. **AI explanation is advisory** — label it clearly as "AI-Generated Explanation"
6. **Timebox: ≤ 1 day** — ship a clean, minimal UI. No feature creep

---

## 7. Quick Start

```bash
# Create the frontend project (in repo root)
npm create vite@latest dashboard -- --template react-ts
cd dashboard
npm install
npm install @tanstack/react-query tailwindcss @tailwindcss/vite lucide-react

# Start dev server (port 5173)
npm run dev

# Backend must be running on port 3001:
# (in separate terminal, from repo root)
npm run server
```

---

## 8. What "Done" Looks Like

- [ ] Status hero shows GREEN / YELLOW / RED with correct color
- [ ] 4 control cards show individual rule results
- [ ] AI explanation renders below controls
- [ ] Evidence hash displayed in monospace with copy button
- [ ] History timeline shows last 10-20 evaluations
- [ ] Demo control buttons switch scenario and UI updates within 5s
- [ ] No raw financial data visible anywhere
- [ ] Works in Chrome/Safari, responsive (desktop + tablet)
