import { EListingAnalysisScope } from '../entity/enums/EListingAnalysisScope';

export interface IChecklistDefinitionItem {
  id: string;
  weight: number;
  promptHint: string;
}

export const LISTING_ANALYSIS_PROMPT_VERSION = 'v1';

export const LISTING_ANALYSIS_CHECKLIST: IChecklistDefinitionItem[] = [
  {
    id: 'photo-front-visible',
    weight: 15,
    promptHint: 'Produto visível de frente nas fotos',
  },
  {
    id: 'photo-lighting-focus',
    weight: 10,
    promptHint: 'Iluminação adequada e foco nas fotos',
  },
  {
    id: 'photo-serial-label',
    weight: 10,
    promptHint: 'Número de série ou etiqueta visível quando aplicável',
  },
  {
    id: 'photo-no-sensitive-data',
    weight: 15,
    promptHint: 'Sem documentos pessoais, endereço ou dados sensíveis visíveis',
  },
  {
    id: 'video-boot-test',
    weight: 25,
    promptHint: 'Vídeo sugere produto ligando ou teste básico de funcionamento',
  },
  {
    id: 'text-condition-coherent',
    weight: 15,
    promptHint: 'Descrição coerente com condição declarada e fotos',
  },
  {
    id: 'text-defects-mentioned',
    weight: 10,
    promptHint: 'Defeitos ou marcas de uso mencionados quando visíveis nas fotos',
  },
];

export function checklistItemsForScope(
  scope: EListingAnalysisScope,
): IChecklistDefinitionItem[] {
  if (scope === EListingAnalysisScope.DRAFT) {
    return LISTING_ANALYSIS_CHECKLIST.filter((item) => item.id !== 'video-boot-test');
  }
  return LISTING_ANALYSIS_CHECKLIST;
}

export function computeAnalysisScore(
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
