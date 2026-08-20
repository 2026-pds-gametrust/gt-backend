export interface IProofCodeChecklistDefinitionItem {
  id: string;
  weight: number;
  promptHint: string;
}

export const PROOF_CODE_ANALYSIS_PROMPT_VERSION = 'proof-code-v1';

/** Canonical possession-code Validação IA checklist (presence / legibility / framing). */
export const PROOF_CODE_ANALYSIS_CHECKLIST: IProofCodeChecklistDefinitionItem[] =
  [
    {
      id: 'proof-code-present',
      weight: 40,
      promptHint:
        'Há um código alfanumérico curto de posse (desafio) visível no quadro',
    },
    {
      id: 'proof-code-legible',
      weight: 35,
      promptHint: 'O código de posse no quadro está legível (foco e contraste)',
    },
    {
      id: 'proof-code-in-frame',
      weight: 25,
      promptHint:
        'O código de posse está inteiro no quadro (sem corte / fora de frame)',
    },
  ];

export function proofCodeChecklistItems(): IProofCodeChecklistDefinitionItem[] {
  return PROOF_CODE_ANALYSIS_CHECKLIST;
}

export function computeProofCodeAnalysisScore(
  items: Array<{ status: string; weight: number }>,
): number {
  let passWeight = 0;
  let applicableWeight = 0;

  for (const item of items) {
    if (item.status === 'UNCERTAIN') {
      continue;
    }
    applicableWeight += item.weight;
    if (item.status === 'PASS') {
      passWeight += item.weight;
    }
  }

  if (applicableWeight === 0) {
    return 0;
  }

  return Math.round((passWeight / applicableWeight) * 100);
}
