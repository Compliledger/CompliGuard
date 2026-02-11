/**
 * AI Reasoning Agent
 *
 * Generates human-readable compliance explanations from policy engine output.
 *
 * Design principles (per plan.md):
 * - Input: policy engine output (ComplianceResult)
 * - Output: human-readable explanation
 * - CANNOT modify severity — advisory only
 * - Failure degrades gracefully (returns fallback explanation)
 */

import { ComplianceResult, ComplianceStatus, ControlResult, ControlType } from './types';
import { logger } from '../utils';

/**
 * AI Reasoning configuration
 */
export interface AIReasoningConfig {
  /** Enable/disable AI reasoning (graceful degradation) */
  enabled: boolean;
  /** Maximum explanation length (characters) */
  maxLength: number;
  /** Include remediation suggestions */
  includeRemediation: boolean;
  /** Regulatory frameworks to reference */
  frameworks: string[];
}

export const DEFAULT_AI_REASONING_CONFIG: AIReasoningConfig = {
  enabled: true,
  maxLength: 2000,
  includeRemediation: true,
  frameworks: ['GENIUS Act', 'CLARITY Act']
};

/**
 * Structured reasoning output
 */
export interface ReasoningOutput {
  summary: string;
  controlAnalysis: ControlAnalysis[];
  remediation: string[];
  regulatoryContext: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  generatedAt: Date;
}

export interface ControlAnalysis {
  controlType: ControlType;
  status: ComplianceStatus;
  finding: string;
  impact: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

/**
 * Control-specific reasoning templates
 */
const CONTROL_TEMPLATES: Record<ControlType, {
  green: (v?: number) => string;
  yellow: (v?: number) => string;
  red: (v?: number) => string;
  impact: Record<ComplianceStatus, string>;
}> = {
  [ControlType.RESERVE_RATIO]: {
    green: (v) => `Reserve ratio at ${v ? (v * 100).toFixed(1) : '>102'}% indicates full collateralization with adequate safety buffer.`,
    yellow: (v) => `Reserve ratio at ${v ? (v * 100).toFixed(1) : '100-102'}% meets minimum collateralization but safety margin is thin. Immediate monitoring recommended.`,
    red: (v) => `Reserve ratio at ${v ? (v * 100).toFixed(1) : '<100'}% indicates undercollateralization. Liabilities exceed provable reserves — immediate action required.`,
    impact: {
      [ComplianceStatus.GREEN]: 'Token holders are fully protected by verifiable reserves.',
      [ComplianceStatus.YELLOW]: 'Token holders face marginally elevated risk due to thin reserve coverage.',
      [ComplianceStatus.RED]: 'Token holders face material risk. Reserves do not cover outstanding liabilities.'
    }
  },
  [ControlType.PROOF_FRESHNESS]: {
    green: (v) => `Attestation proof is ${v ? v.toFixed(1) : '<6'} hours old — within acceptable freshness window.`,
    yellow: (v) => `Attestation proof is ${v ? v.toFixed(1) : '6-24'} hours old — approaching staleness threshold. Data reliability is degrading.`,
    red: (v) => `Attestation proof is ${v ? v.toFixed(1) : '>24'} hours old — stale. Reserve data cannot be relied upon for current compliance determination.`,
    impact: {
      [ComplianceStatus.GREEN]: 'Reserve data is current and reliable.',
      [ComplianceStatus.YELLOW]: 'Reserve data freshness is degrading; confidence in current state is reduced.',
      [ComplianceStatus.RED]: 'Reserve data is stale and should not be trusted for compliance decisions.'
    }
  },
  [ControlType.ASSET_QUALITY]: {
    green: () => 'All reserve assets meet quality requirements. No disallowed or excessively risky holdings detected.',
    yellow: () => 'Asset composition shows elevated risk profile but remains within acceptable bounds.',
    red: () => 'Reserve composition contains disallowed assets or excessive risk concentration. Portfolio fails quality requirements.',
    impact: {
      [ComplianceStatus.GREEN]: 'Reserve portfolio is composed of acceptable, low-risk assets.',
      [ComplianceStatus.YELLOW]: 'Reserve portfolio quality is marginal.',
      [ComplianceStatus.RED]: 'Reserve portfolio quality fails regulatory expectations for backing assets.'
    }
  },
  [ControlType.ASSET_CONCENTRATION]: {
    green: (v) => `Maximum single-asset concentration at ${v ? v.toFixed(1) : '<75'}% — portfolio is adequately diversified.`,
    yellow: (v) => `Single-asset concentration at ${v ? v.toFixed(1) : '>75'}% exceeds diversification threshold. Portfolio is over-concentrated.`,
    red: () => 'Extreme asset concentration detected. Portfolio diversification is critically insufficient.',
    impact: {
      [ComplianceStatus.GREEN]: 'Portfolio diversification reduces single-point-of-failure risk.',
      [ComplianceStatus.YELLOW]: 'Over-concentration introduces correlated risk if the dominant asset devalues.',
      [ComplianceStatus.RED]: 'Critical concentration risk — a single asset failure could cascade to full reserve impairment.'
    }
  }
};

/**
 * Remediation suggestions by control type and status
 */
const REMEDIATION_MAP: Record<string, string[]> = {
  [`${ControlType.RESERVE_RATIO}_${ComplianceStatus.YELLOW}`]: [
    'Increase reserve buffer to restore safety margin above 102%.',
    'Consider pausing new token issuance until ratio is restored.'
  ],
  [`${ControlType.RESERVE_RATIO}_${ComplianceStatus.RED}`]: [
    'URGENT: Inject additional reserves to restore collateralization.',
    'Halt new token issuance immediately.',
    'Notify compliance officers and initiate incident response.'
  ],
  [`${ControlType.PROOF_FRESHNESS}_${ComplianceStatus.YELLOW}`]: [
    'Request updated attestation from reserve custodian.',
    'Verify attestation pipeline is operational.'
  ],
  [`${ControlType.PROOF_FRESHNESS}_${ComplianceStatus.RED}`]: [
    'URGENT: Obtain fresh attestation immediately.',
    'Investigate attestation pipeline failure.',
    'Consider temporary operational pause until fresh proof is available.'
  ],
  [`${ControlType.ASSET_QUALITY}_${ComplianceStatus.RED}`]: [
    'Remove disallowed assets from reserve portfolio.',
    'Rebalance portfolio to reduce risky asset exposure below 30%.',
    'Document remediation steps for audit trail.'
  ],
  [`${ControlType.ASSET_CONCENTRATION}_${ComplianceStatus.YELLOW}`]: [
    'Diversify reserve portfolio to reduce single-asset concentration below 75%.',
    'Establish asset allocation limits with automated monitoring.'
  ]
};

/**
 * AI Reasoning Agent
 *
 * Advisory only — cannot modify compliance severity.
 * Graceful degradation on failure.
 */
export class AIReasoningAgent {
  private config: AIReasoningConfig;

  constructor(config: Partial<AIReasoningConfig> = {}) {
    this.config = { ...DEFAULT_AI_REASONING_CONFIG, ...config };
  }

  /**
   * Generate a structured reasoning output from a compliance result.
   * NEVER modifies the compliance status — advisory only.
   */
  generateReasoning(result: ComplianceResult): ReasoningOutput {
    try {
      if (!this.config.enabled) {
        return this.fallbackReasoning(result);
      }

      const controlAnalysis = this.analyzeControls(result.controls);
      const remediation = this.config.includeRemediation
        ? this.generateRemediation(result.controls)
        : [];
      const summary = this.generateSummary(result, controlAnalysis);
      const regulatoryContext = this.generateRegulatoryContext(result);

      return {
        summary,
        controlAnalysis,
        remediation,
        regulatoryContext,
        confidence: 'HIGH',
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('AI Reasoning Agent failed — degrading gracefully', {
        error: error instanceof Error ? error.message : String(error)
      });
      return this.fallbackReasoning(result);
    }
  }

  /**
   * Generate a single-string explanation (for backward compatibility with engine)
   */
  generateExplanation(result: ComplianceResult): string {
    try {
      const reasoning = this.generateReasoning(result);
      const parts: string[] = [
        reasoning.summary,
        '',
        '--- Control Analysis ---',
        ...reasoning.controlAnalysis.map(
          a => `[${a.severity}] ${a.controlType}: ${a.finding}`
        )
      ];

      if (reasoning.remediation.length > 0) {
        parts.push('', '--- Recommended Actions ---');
        parts.push(...reasoning.remediation.map((r, i) => `${i + 1}. ${r}`));
      }

      if (reasoning.regulatoryContext) {
        parts.push('', `Regulatory context: ${reasoning.regulatoryContext}`);
      }

      const explanation = parts.join('\n');
      return explanation.length > this.config.maxLength
        ? explanation.substring(0, this.config.maxLength - 3) + '...'
        : explanation;
    } catch {
      return result.explanation; // fallback to engine-generated explanation
    }
  }

  private analyzeControls(controls: ControlResult[]): ControlAnalysis[] {
    return controls.map(control => {
      const template = CONTROL_TEMPLATES[control.controlType as ControlType];
      if (!template) {
        return {
          controlType: control.controlType as ControlType,
          status: control.status,
          finding: control.message,
          impact: 'Impact assessment not available.',
          severity: this.mapSeverity(control.status)
        };
      }

      const statusKey = control.status.toLowerCase() as 'green' | 'yellow' | 'red';
      const finding = template[statusKey](control.value);
      const impact = template.impact[control.status];

      return {
        controlType: control.controlType as ControlType,
        status: control.status,
        finding,
        impact,
        severity: this.mapSeverity(control.status)
      };
    });
  }

  private generateRemediation(controls: ControlResult[]): string[] {
    const remediations: string[] = [];
    for (const control of controls) {
      if (control.status === ComplianceStatus.GREEN) continue;
      const key = `${control.controlType}_${control.status}`;
      const suggestions = REMEDIATION_MAP[key];
      if (suggestions) {
        remediations.push(...suggestions);
      }
    }
    return [...new Set(remediations)]; // deduplicate
  }

  private generateSummary(result: ComplianceResult, analyses: ControlAnalysis[]): string {
    const statusLabel: Record<ComplianceStatus, string> = {
      [ComplianceStatus.GREEN]: 'COMPLIANT',
      [ComplianceStatus.YELLOW]: 'AT RISK',
      [ComplianceStatus.RED]: 'NON-COMPLIANT'
    };

    const failedControls = analyses.filter(a => a.status !== ComplianceStatus.GREEN);
    const label = statusLabel[result.overallStatus];

    if (failedControls.length === 0) {
      return `CompliGuard Assessment: ${label}. All ${analyses.length} compliance controls passed. Reserve backing is verified, proof is fresh, and asset composition meets policy requirements (policy ${result.policyVersion}).`;
    }

    const issues = failedControls.map(a =>
      `${a.controlType.replace(/_/g, ' ').toLowerCase()} (${a.status})`
    ).join(', ');

    return `CompliGuard Assessment: ${label}. ${failedControls.length} of ${analyses.length} controls flagged: ${issues}. Worst-of aggregation yields overall ${result.overallStatus} status (policy ${result.policyVersion}).`;
  }

  private generateRegulatoryContext(result: ComplianceResult): string {
    const frameworks = this.config.frameworks.join(' and ');

    if (result.overallStatus === ComplianceStatus.GREEN) {
      return `This evaluation aligns with ${frameworks} expectations for reserve-backed digital asset compliance. All controls meet or exceed minimum requirements.`;
    }

    if (result.overallStatus === ComplianceStatus.YELLOW) {
      return `Under ${frameworks} frameworks, this status indicates marginal compliance. Issuers should proactively address flagged controls before regulatory thresholds are breached.`;
    }

    return `Under ${frameworks} frameworks, this status indicates a compliance violation. Immediate remediation is expected. Continued non-compliance may trigger enforcement actions or operational restrictions.`;
  }

  private mapSeverity(status: ComplianceStatus): 'CRITICAL' | 'WARNING' | 'INFO' {
    switch (status) {
      case ComplianceStatus.RED: return 'CRITICAL';
      case ComplianceStatus.YELLOW: return 'WARNING';
      default: return 'INFO';
    }
  }

  /**
   * Graceful fallback when AI reasoning fails
   */
  private fallbackReasoning(result: ComplianceResult): ReasoningOutput {
    return {
      summary: `Compliance status: ${result.overallStatus}. ${result.controls.length} controls evaluated. AI reasoning unavailable — using fallback.`,
      controlAnalysis: result.controls.map(c => ({
        controlType: c.controlType as ControlType,
        status: c.status,
        finding: c.message,
        impact: 'Detailed impact analysis unavailable.',
        severity: this.mapSeverity(c.status)
      })),
      remediation: [],
      regulatoryContext: 'Regulatory context generation unavailable.',
      confidence: 'LOW',
      generatedAt: new Date()
    };
  }
}
