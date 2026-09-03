import { Document, Schema, model } from 'mongoose';

export interface IDoseLog extends Document {
  userId: Schema.Types.ObjectId;
  medicationId: Schema.Types.ObjectId;
  scheduledTime: Date;
  status: 'taken' | 'missed' | 'skipped' | 'snoozed';
  reason?: 'forgot' | 'side_effects' | 'ran_out';
  actionedAt: Date;
}

const DoseLogSchema = new Schema<IDoseLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
  },
  scheduledTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['taken', 'missed', 'skipped', 'snoozed'],
    required: true,
  },
  reason: { type: String, enum: ['forgot', 'side_effects', 'ran_out'] },
  actionedAt: { type: Date, default: Date.now },
});

export default model<IDoseLog>('DoseLog', DoseLogSchema);
