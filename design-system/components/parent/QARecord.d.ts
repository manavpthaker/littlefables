/** @startingPoint section="Parent" subtitle="Three-stage QA outcomes with violations, evidence-forward" viewport="700x260" */
export interface QARecordProps {
  stages: {
    name: string; // e.g. "Stage 1 · Hard gates"
    result: 'pass' | 'fail' | 'skip' | 'unverified';
    detail?: string;
    violations?: string[];
    score?: number | string;
  }[];
}
