import { Document, Schema, model } from 'mongoose';

export interface IMedication extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: 'daily' | 'weekly' | 'as-needed';
  times: string[]; // ["08:00", "20:00"]
  startDate: Date;
  endDate?: Date;
  refillsRemaining?: number;
  active: boolean;
  notificationIds: string[];
}

const MedicationSchema = new Schema<IMedication>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'as-needed'],
    required: true,
  },
  times: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: Date,
  refillsRemaining: Number,
  active: { type: Boolean, default: true },
  notificationIds: [{ type: String }],
});

export default model<IMedication>('Medication', MedicationSchema);
