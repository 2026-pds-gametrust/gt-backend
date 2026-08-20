import { EAnalysisChecklistItemStatus } from '../../domain/ai/entity/enums/EAnalysisChecklistItemStatus';
import { IAnalysisChecklistItem } from '../../domain/ai/entity/interfaces/listing-analysis.interface';
import {
  proofCodeChecklistItems,
} from '../../domain/ai/analysis/proof-code-analysis-checklist';
import {
  IProofCodeAnalysisProvider,
  IProofCodeAnalysisProviderResult,
  IParamsProofCodeAnalysisProviderInput,
} from '../../domain/ai/provider/proof-code-analysis.provider.interface';

export interface IParamsGeminiProofCodeAnalysisProvider {
  apiKey: string;
  modelId: string;
  timeoutMs: number;
}

interface IGeminiChecklistItemResponse {
  id: string;
  status: string;
  reason: string;
  evidenceRef?: string;
}

/**
 * Vision provider for possession-code assist.
 * Prompt intentionally omits expected plaintext (DEC-071 / AC-11).
 */
export class GeminiProofCodeAnalysisProvider
  implements IProofCodeAnalysisProvider
{
  private readonly apiKey: string;
  private readonly modelId: string;
  private readonly timeoutMs: number;

  constructor(params: IParamsGeminiProofCodeAnalysisProvider) {
    this.apiKey = params.apiKey;
    this.modelId = params.modelId;
    this.timeoutMs = params.timeoutMs;
  }

  async analyze(
    input: IParamsProofCodeAnalysisProviderInput,
  ): Promise<IProofCodeAnalysisProviderResult> {
    if (!this.apiKey.trim()) {
      throw new Error('gemini_api_key_missing');
    }

    const checklistDefs = proofCodeChecklistItems();
    const checklistPrompt = checklistDefs
      .map((item) => `- ${item.id}: ${item.promptHint}`)
      .join('\n');

    const systemPrompt = [
      'Você analisa evidências fotográficas/vídeo de verificação de posse em um marketplace.',
      'Avalie se um código alfanumérico curto de posse aparece no quadro, se está legível e se está inteiro no enquadramento.',
      'NÃO compare com um valor esperado; NÃO faça OCR de match; NÃO invente o texto do código.',
      'NÃO aprove, rejeite ou decida o caso — apenas avalie presença, legibilidade e enquadramento.',
      'Responda APENAS com JSON válido no formato:',
      '{"items":[{"id":"...","status":"PASS|FAIL|UNCERTAIN","reason":"...","evidenceRef":"..."}]}',
      'Regras:',
      '- Use UNCERTAIN quando não houver informação suficiente.',
      '- reason em português brasileiro, curto e objetivo, SEM repetir qualquer código lido na imagem.',
      '- Avalie somente estes itens:',
      checklistPrompt,
    ].join('\n');

    const userText = [
      'Analise as evidências anexadas quanto à presença, legibilidade e enquadramento de um código de posse alfanumérico curto.',
      'Não mencione nem repita o texto de qualquer código nas razões.',
    ].join('\n');

    const parts: Array<Record<string, unknown>> = [{ text: userText }];

    for (const photo of input.photos) {
      parts.push({
        inlineData: {
          mimeType: photo.mimeType,
          data: photo.data.toString('base64'),
        },
      });
    }

    if (input.video) {
      parts.push({
        inlineData: {
          mimeType: input.video.mimeType,
          data: input.video.data.toString('base64'),
        },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.modelId)}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt }, ...parts] },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`gemini_http_${response.status}`);
      }

      const body = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text?.trim()) {
        throw new Error('gemini_empty_response');
      }

      const parsed = JSON.parse(text) as {
        items?: IGeminiChecklistItemResponse[];
      };

      const items = this.normalizeItems(parsed.items ?? [], checklistDefs);

      return {
        items,
        modelId: this.modelId,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeItems(
    rawItems: IGeminiChecklistItemResponse[],
    checklistDefs: Array<{ id: string; weight: number }>,
  ): IAnalysisChecklistItem[] {
    const byId = new Map(rawItems.map((item) => [item.id, item]));

    return checklistDefs.map((def: { id: string; weight: number }) => {
      const raw = byId.get(def.id);
      const status = this.normalizeStatus(raw?.status);
      return {
        id: def.id,
        status,
        weight: def.weight,
        reason:
          raw?.reason?.trim() ||
          'Sem informação suficiente para avaliar o código de posse.',
        evidenceRef: raw?.evidenceRef?.trim() || undefined,
      };
    });
  }

  private normalizeStatus(value?: string): EAnalysisChecklistItemStatus {
    const normalized = String(value ?? '').trim().toUpperCase();
    if (normalized === EAnalysisChecklistItemStatus.PASS) {
      return EAnalysisChecklistItemStatus.PASS;
    }
    if (normalized === EAnalysisChecklistItemStatus.FAIL) {
      return EAnalysisChecklistItemStatus.FAIL;
    }
    return EAnalysisChecklistItemStatus.UNCERTAIN;
  }
}
