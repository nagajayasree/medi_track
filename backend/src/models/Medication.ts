// src/models/Medication.ts
import { Schema, model, type Document } from 'mongoose';

export const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  'As needed',
] as const;

export type Frequency = (typeof FREQUENCY_OPTIONS)[number];

export interface IMedication extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: Frequency;
  times: string[]; // ["08:00", "20:00"]
  startDate: Date;
  endDate?: Date;
  deactivatedAt?: Date;
  refillsRemaining?: number;
  active: boolean;
  notificationIds: string[];
}

const MedicationSchema = new Schema<IMedication>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, enum: FREQUENCY_OPTIONS, required: true },
  times: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: false },
  deactivatedAt: { type: Date, required: false },
  refillsRemaining: Number,
  active: { type: Boolean, default: true },
  notificationIds: [{ type: String }],
});

export default model<IMedication>('Medication', MedicationSchema);
