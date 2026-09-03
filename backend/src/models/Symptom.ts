import { Document, Schema, model } from 'mongoose';

export interface ISymptom extends Document {
  userId: Schema.Types.ObjectId;
  medicationId?: Schema.Types.ObjectId;
  description: string;
  severity: number; // 1–10
  mood?: 'low' | 'neutral' | 'good';
  loggedAt: Date;
}

const SymptomSchema = new Schema<ISymptom>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication' },
  description: { type: String, required: true },
  severity: { type: Number, min: 1, max: 10, required: true },
  mood: { type: String, enum: ['low', 'neutral', 'good'] },
  loggedAt: { type: Date, default: Date.now },
});

export default model<ISymptom>('Symptom', SymptomSchema);
