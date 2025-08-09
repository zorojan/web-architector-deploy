import express from 'express';
import { getDatabase } from '../database/init';
import { authenticateToken } from './auth';
import { promisify } from 'util';

const router = express.Router();

// Get all settings
router.get('/', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const db = getDatabase();
    const all = promisify(db.all.bind(db)) as any;

    const settings = await all('SELECT * FROM settings ORDER BY key') as any[];

    // Don't send password values in response for security
    const safeSettings = settings.map(setting => ({
      ...setting,
      value: setting.type === 'password' && setting.value ? '***hidden***' : setting.value
    }));

    res.json(safeSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get specific setting
router.get('/:key', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { key } = req.params;
    const db = getDatabase();
    const get = promisify(db.get.bind(db)) as any;

    const setting = await get('SELECT * FROM settings WHERE key = ?', [key]) as any;

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Don't send password values
    if (setting.type === 'password' && setting.value) {
      setting.value = '***hidden***';
    }

    res.json(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update setting
router.put('/:key', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as any;
    const get = promisify(db.get.bind(db)) as any;

    // Check if setting exists
    const existing = await get('SELECT * FROM settings WHERE key = ?', [key]) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Update setting
    await run(
      'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [value, key]
    );

    res.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Create new setting
router.post('/', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { key, value, description, type = 'string' } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as any;
    const get = promisify(db.get.bind(db)) as any;

    // Check if setting already exists
    const existing = await get('SELECT * FROM settings WHERE key = ?', [key]) as any;
    if (existing) {
      return res.status(409).json({ error: 'Setting already exists' });
    }

    // Create setting
    await run(
      'INSERT INTO settings (key, value, description, type) VALUES (?, ?, ?, ?)',
      [key, value, description, type]
    );

    res.status(201).json({ success: true, message: 'Setting created successfully' });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({ error: 'Failed to create setting' });
  }
});

// Delete setting
router.delete('/:key', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { key } = req.params;
    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as any;

    await run('DELETE FROM settings WHERE key = ?', [key]);

    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

export default router;
