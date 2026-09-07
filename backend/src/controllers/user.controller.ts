import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import User from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email } = req.body;
    if (!name && !email) {
      return res
        .status(400)
        .json({ error: 'Provide at least a name or email to update' });
    }

    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 6 characters' });
    }

    // passwordHash is included by default on this schema (no select:false),
    // so a plain findById gives us what we need to compare against.
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSameAsOld) {
      return res
        .status(400)
        .json({ error: 'New password must be different from the current one' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}