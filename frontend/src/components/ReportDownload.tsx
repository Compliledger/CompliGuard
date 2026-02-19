import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2, CheckCircle } from 'lucide-react';
import { ComplianceStatus } from '@/lib/types';

interface ReportDownloadProps {
  data: ComplianceStatus;
}

function generateReportHTML(data: ComplianceStatus): string {
  const statusColor = data.status === 'GREEN' ? '#22c55e' : data.status === 'YELLOW' ? '#eab308' : '#ef4444';
  const statusLabel = data.status === 'GREEN' ? 'COMPLIANT' : data.status === 'YELLOW' ? 'AT RISK' : 'NON-COMPLIANT';
  const now = new Date().toISOString();

  const controlRows = (data.controls || []).map(c => {
    const cColor = c.status === 'GREEN' ? '#22c55e' : c.status === 'YELLOW' ? '#eab308' : '#ef4444';
    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${c.controlType.replace(/_/g, ' ')}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
        <span style="background:${cColor}20;color:${cColor};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;">${c.status}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;">${c.value ?? '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;">${c.threshold ?? '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${c.message}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CompliGuard Compliance Report</title>
<style>
  body{font-family:'Segoe UI',system-ui,sans-serif;margin:0;padding:40px;color:#1f2937;background:#fff;}
  .header{display:flex;align-items:center;gap:12px;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #3b82f6;}
  .header h1{font-size:22px;margin:0;color:#1e40af;}
  .badge{display:inline-block;background:${statusColor}20;color:${statusColor};padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px;letter-spacing:0.5px;}
  .section{margin-top:28px;}
  .section h2{font-size:15px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;font-weight:600;}
  table{width:100%;border-collapse:collapse;margin-top:8px;}
  th{padding:10px 12px;text-align:left;background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;}
  .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .meta-item{background:#f9fafb;border-radius:8px;padding:12px 16px;}
  .meta-item label{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;}
  .meta-item p{font-size:13px;margin:0;font-family:monospace;word-break:break-all;}
  .explanation{background:#f0f9ff;border-left:3px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.7;white-space:pre-wrap;}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;}
  @media print{body{padding:20px;}}
</style></head><body>

<div class="header">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <h1>CompliGuard Compliance Report</h1>
</div>

<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
  <span class="badge">${statusLabel}</span>
  <span style="font-size:13px;color:#6b7280;">Generated: ${new Date(now).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium', timeZone: 'UTC' })} UTC</span>
</div>

<div class="section">
  <h2>Evaluation Metadata</h2>
  <div class="meta-grid">
    <div class="meta-item"><label>Evidence Hash</label><p>${data.evidenceHash || '—'}</p></div>
    <div class="meta-item"><label>Policy Version</label><p>${data.policyVersion || '—'}</p></div>
    <div class="meta-item"><label>Evaluation Time</label><p>${data.timestamp ? new Date(data.timestamp).toISOString() : '—'}</p></div>
    <div class="meta-item"><label>Contract</label><p>0xf9BaAE04C412c23BC750E79C84A19692708E71b9 (Sepolia)</p></div>
  </div>
</div>

<div class="section">
  <h2>Control Results</h2>
  <table>
    <thead><tr>
      <th>Control</th><th style="text-align:center;">Status</th><th>Value</th><th>Threshold</th><th>Message</th>
    </tr></thead>
    <tbody>${controlRows}</tbody>
  </table>
</div>

<div class="section">
  <h2>AI Explanation (Advisory Only)</h2>
  <div class="explanation">${data.explanation || 'No explanation available.'}</div>
</div>

<div class="footer">
  <p>CompliGuard \u00b7 Privacy-Preserving Compliance Enforcement \u00b7 Chainlink CRE + Ethereum Sepolia</p>
  <p>This report was generated automatically. AI explanations are advisory only and do not modify compliance severity.</p>
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
