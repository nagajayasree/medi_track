import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  biometricEnabled: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  biometricEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model<IUser>('User', UserSchema);
