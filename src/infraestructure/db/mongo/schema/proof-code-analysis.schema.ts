import { Schema } from 'mongoose';
import type { IMProofCodeAnalysis } from '../models/proof-code-analysis.model';

const AnalysisChecklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    status: { type: String, required: true },
    weight: { type: Number, required: true },
    reason: { type: String, required: true },
    evidenceRef: { type: String },
  },
  { _id: false },
);

export const ProofCodeAnalysisSchema = new Schema<IMProofCodeAnalysis>(
  {
    id: { type: String, required: true, unique: true },
    caseId: { type: String, required: true, index: true },
    listingId: { type: String, required: true },
    status: { type: String, required: true },
    score: { type: Number },
    items: { type: [AnalysisChecklistItemSchema], default: [] },
    modelId: { type: String },
    promptVersion: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    failureReason: { type: String },
  },
  { timestamps: true, collection: 'proof_code_analyses' },
);

ProofCodeAnalysisSchema.index({ caseId: 1, createdAt: -1 });
