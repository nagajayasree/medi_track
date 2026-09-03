import { Document, Schema, model } from 'mongoose';

export interface IVital extends Document {
  userId: Schema.Types.ObjectId;
  type:
    | 'blood_pressure'
    | 'blood_sugar'
    | 'weight'
    | 'heart_rate'
    | 'spo2'
    | 'temperature';
  value: string;
  unit: string;
  source: 'manual' | 'healthkit' | 'googlefit';
  recordedAt: Date;
}

const VitalSchema = new Schema<IVital>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String, required: true },
  source: {
    type: String,
    enum: ['manual', 'healthkit', 'googlefit'],
    default: 'manual',
  },
  recordedAt: { type: Date, default: Date.now },
});

export default model<IVital>('Vital', VitalSchema);
