import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2, CheckCircle } from 'lucide-react';
import { ComplianceStatus, toTrafficLight } from '@/lib/types';

interface ReportDownloadProps {
  data: ComplianceStatus;
}

function generateReportHTML(data: ComplianceStatus): string {
  const trafficLight = toTrafficLight(data.status);
  const statusColor = trafficLight === 'GREEN' ? '#22c55e' : trafficLight === 'YELLOW' ? '#eab308' : '#ef4444';
  const statusLabel = trafficLight === 'GREEN' ? 'COMPLIANT' : trafficLight === 'YELLOW' ? 'AT RISK' : 'NON-COMPLIANT';
  const now = new Date().toISOString();

  const controlRows = (data.controls || []).map(c => {
    const cColor = c.status === 'GREEN' ? '#22c55e' : c.status === 'YELLOW' ? '#eab308' : '#ef4444';
    const formatValue = (val: any) => {
      if (val === null || val === undefined) return '—';
      if (typeof val === 'number') return val.toLocaleString('en-US', { maximumFractionDigits: 4 });
      return val;
    };
    return `<tr>
      <td class="control-name">${c.controlType.replace(/_/g, ' ')}</td>
      <td style="text-align:center;">
        <span class="control-badge" style="background:${cColor}25;color:${cColor};border:1px solid ${cColor}40;">${c.status}</span>
      </td>
      <td class="control-value">${formatValue(c.value)}</td>
      <td class="control-value">${formatValue(c.threshold)}</td>
      <td style="color:#6b7280;">${c.message}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CompliGuard Compliance Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 48px 64px; color: #111827; background: #ffffff; line-height: 1.6; }
  .document-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 3px solid #3b82f6; }
  .document-header .left { display: flex; align-items: center; gap: 16px; }
  .logo-shield { width: 40px; height: 40px; }
  .document-title { font-size: 28px; font-weight: 700; color: #1e40af; letter-spacing: -0.5px; }
  .document-subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .status-bar { display: flex; align-items: center; gap: 20px; padding: 20px 24px; background: linear-gradient(135deg, ${statusColor}08 0%, ${statusColor}15 100%); border-left: 4px solid ${statusColor}; border-radius: 12px; margin-bottom: 36px; }
  .status-badge { display: inline-flex; align-items: center; gap: 8px; background: ${statusColor}; color: #ffffff; padding: 10px 20px; border-radius: 24px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 12px ${statusColor}40; }
  .status-badge::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #ffffff; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .timestamp { font-size: 14px; color: #6b7280; font-weight: 500; }
  .section { margin-top: 40px; }
  .section-header { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .section-header::before { content: ''; width: 4px; height: 16px; background: #3b82f6; border-radius: 2px; }
  .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .meta-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 20px; transition: all 0.2s; }
  .meta-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .meta-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.2px; display: block; margin-bottom: 8px; font-weight: 600; }
  .meta-value { font-size: 13px; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace; word-break: break-all; color: #374151; font-weight: 500; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  thead { background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%); }
  th { padding: 14px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #6b7280; font-weight: 700; border-bottom: 2px solid #e5e7eb; }
  th:nth-child(2) { text-align: center; }
  tbody tr { transition: background 0.15s; }
  tbody tr:hover { background: #f9fafb; }
  td { padding: 14px 16px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
  tbody tr:last-child td { border-bottom: none; }
  .control-name { font-weight: 600; color: #111827; }
  .control-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
  .control-value { font-family: 'SF Mono', 'Monaco', monospace; font-weight: 500; }
  .explanation-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; padding: 20px 24px; border-radius: 12px; font-size: 14px; line-height: 1.8; color: #1e40af; white-space: pre-wrap; }
  .footer { margin-top: 56px; padding-top: 24px; border-top: 2px solid #f3f4f6; text-align: center; }
  .footer-brand { font-size: 13px; color: #6b7280; font-weight: 600; margin-bottom: 8px; }
  .footer-disclaimer { font-size: 11px; color: #9ca3af; line-height: 1.6; max-width: 800px; margin: 0 auto; }
  @media print { body { padding: 24px 32px; } .status-badge { box-shadow: none; } }
</style></head><body>

<div class="document-header">
  <div class="left">
    <svg class="logo-shield" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    <div>
      <h1 class="document-title">CompliGuard Compliance Report</h1>
      <p class="document-subtitle">Privacy-Preserving Reserve Verification</p>
    </div>
  </div>
</div>

<div class="status-bar">
  <span class="status-badge">${statusLabel}</span>
  <span class="timestamp">Generated: ${new Date(now).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium', timeZone: 'UTC' })} UTC</span>
</div>

<div class="section">
  <div class="section-header">Evaluation Metadata</div>
  <div class="meta-grid">
    <div class="meta-card"><label class="meta-label">Evidence Hash</label><p class="meta-value">${data.evidenceHash || '—'}</p></div>
    <div class="meta-card"><label class="meta-label">Policy Version</label><p class="meta-value">${data.policyVersion || '—'}</p></div>
    <div class="meta-card"><label class="meta-label">Evaluation Time</label><p class="meta-value">${data.timestamp ? new Date(data.timestamp).toISOString() : '—'}</p></div>
    <div class="meta-card"><label class="meta-label">On-Chain Anchor</label><p class="meta-value">0xf9BaAE04C412c23BC750E79C84A19692708E71b9 (Sepolia)</p></div>
  </div>
</div>

<div class="section">
  <div class="section-header">Control Results</div>
  <table>
    <thead><tr>
      <th>Control</th><th style="text-align:center;">Status</th><th>Value</th><th>Threshold</th><th>Message</th>
    </tr></thead>
    <tbody>${controlRows}</tbody>
  </table>
</div>

<div class="section">
  <div class="section-header">AI Explanation (Advisory Only)</div>
  <div class="explanation-box">${data.explanation || 'No explanation available.'}</div>
</div>

<div class="footer">
  <p class="footer-brand">CompliGuard · Privacy-Preserving Compliance Enforcement · Chainlink CRE + Ethereum Sepolia</p>
  <p class="footer-disclaimer">This report was generated automatically using Chainlink Runtime Environment workflows. The compliance evaluation uses deterministic worst-of aggregation across all control policies. AI explanations are advisory only and do not modify compliance severity. Evidence hash provides cryptographic proof of evaluation integrity.</p>
</div>

</body></html>`;
}

const ReportDownload = ({ data }: ReportDownloadProps) => {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    setDone(false);

    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 400));

    const html = generateReportHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CompliGuard_Report_${data.status}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloading(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 bg-secondary hover:bg-accent border border-border/50 rounded-xl px-4 py-2 text-xs font-semibold text-foreground transition-all disabled:opacity-70"
    >
      {downloading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : done ? (
        <CheckCircle className="h-3.5 w-3.5 text-compliance-green" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      {done ? 'Downloaded' : 'Download Report'}
    </motion.button>
  );
};

export default ReportDownload;
