import { Router } from 'express';
import { type AuthRequest, requireAuth } from '../middleware/auth.middleware.js';
import Medication from '../models/Medication.js';

const router = Router();

// GET /api/medications — list the logged-in user's active medications
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const medications = await Medication.find({
      userId: req.userId,
      active: true,
    } as Record<string, unknown>);

    res.json(medications);
  } catch (err) {
    console.error('List medications error:', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// POST /api/medications — create a medication for the logged-in user
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, dosage, frequency, times, startDate } = req.body;
    if (!name || !dosage || !frequency || !times || !startDate) {
      return res.status(400).json({
        error: 'name, dosage, frequency, times, and startDate are required',
      });
    }

    const medication = await Medication.create({
      ...req.body,
      userId: req.userId,
    } as Record<string, unknown>);

    res.status(201).json(medication);
  } catch (err) {
    console.error('Create medication error:', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// PATCH /api/medications/:id — update a medication owned by the logged-in user
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as Record<string, unknown>,
      req.body,
      { new: true },
    );

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json(medication);
  } catch (err) {
    console.error('Update medication error:', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// DELETE /api/medications/:id — soft-delete (deactivate) a medication
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId } as Record<string, unknown>,
      { active: false },
    );

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Delete medication error:', err);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

export default router;