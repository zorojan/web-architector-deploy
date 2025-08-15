import express from 'express';
import { getDatabase } from '../database/init';
import { authenticateToken } from './auth';
import { promisify } from 'util';
import axios from 'axios';

const router = express.Router();

// Get all agents
router.get('/', async (req: any, res: express.Response) => {
  try {
    const db = getDatabase();
    const all = promisify(db.all.bind(db)) as any;

    const agents = await all('SELECT * FROM agents WHERE is_active = 1 ORDER BY name') as any[];

    res.json(agents);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get specific agent
router.get('/:id', async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const get = promisify(db.get.bind(db)) as any;

    const agent = await get('SELECT * FROM agents WHERE id = ?', [id]) as any;

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create new agent (admin only)
router.post('/', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const {
      id,
      name,
      personality,
      body_color,
      voice,
      avatar_url,
      knowledge_base,
      system_prompt
    } = req.body;

    if (!id || !name || !personality || !body_color || !voice) {
      return res.status(400).json({ 
        error: 'ID, name, personality, body_color, and voice are required' 
      });
    }

    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as any;
    const get = promisify(db.get.bind(db)) as any;

    // Check if agent already exists
    const existing = await get('SELECT * FROM agents WHERE id = ?', [id]) as any;
    if (existing) {
      return res.status(409).json({ error: 'Agent with this ID already exists' });
    }

    // Create agent
    await run(`
      INSERT INTO agents 
      (id, name, personality, body_color, voice, avatar_url, knowledge_base, system_prompt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, name, personality, body_color, voice, 
      avatar_url || null, knowledge_base || null, system_prompt || null
    ]);

    res.status(201).json({ success: true, message: 'Agent created successfully' });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update agent (admin only)
router.put('/:id', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      personality,
      body_color,
      voice,
      avatar_url,
      knowledge_base,
      system_prompt,
      is_active
    } = req.body;

    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as any;
    const get = promisify(db.get.bind(db)) as any;

    // Check if agent exists
    const existing = await get('SELECT * FROM agents WHERE id = ?', [id]) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (personality !== undefined) {
      updates.push('personality = ?');
      values.push(personality);
    }
    if (body_color !== undefined) {
      updates.push('body_color = ?');
      values.push(body_color);
    }
    if (voice !== undefined) {
      updates.push('voice = ?');
      values.push(voice);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url);
    }
    if (knowledge_base !== undefined) {
      updates.push('knowledge_base = ?');
      values.push(knowledge_base);
    }
    if (system_prompt !== undefined) {
      updates.push('system_prompt = ?');
      values.push(system_prompt);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await run(
      `UPDATE agents SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Agent updated successfully' });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete agent (admin only)
router.delete('/:id', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const run = promisify(db.run.bind(db)) as any;

    // Soft delete - set is_active to false
    await run('UPDATE agents SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Send message to agent (text chat)
router.post('/:id/message', async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const db = getDatabase();
    const get = promisify(db.get.bind(db)) as any;

    // Get agent details
    const agent = await get('SELECT * FROM agents WHERE id = ? AND is_active = 1', [id]) as any;
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get API key and message dialog model
    const apiKeySetting = await get('SELECT value FROM settings WHERE key = ?', ['gemini_api_key']) as any;
    const modelSetting = await get('SELECT value FROM settings WHERE key = ?', ['message_dialog_model']) as any;

    if (!apiKeySetting || !apiKeySetting.value) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const apiKey = apiKeySetting.value;
    const model = modelSetting?.value || 'gemini-1.5-flash';

    // Create system prompt
    const systemPrompt = agent.system_prompt || `You are ${agent.name}. ${agent.personality}`;

    // Call Gemini API
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: `User: ${message.trim()}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const response = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    res.json({ response });
  } catch (error) {
    console.error('Send message error:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      
      // Handle specific error cases
      if (status === 503) {
        return res.status(503).json({ 
          error: 'API service is temporarily unavailable. This usually means the API quota has been exceeded or the service is down. Please try again later or check your API key configuration.' 
        });
      } else if (status === 429) {
        return res.status(429).json({ 
          error: 'Too many requests. Please wait a moment before trying again.' 
        });
      } else if (status === 401) {
        return res.status(401).json({ 
          error: 'Invalid API key. Please check your Gemini API key configuration in the admin panel.' 
        });
      } else if (status === 400) {
        return res.status(400).json({ 
          error: 'Invalid request. Please check your message and try again.' 
        });
      }
      
      const message = error.response?.data?.error?.message || 'Failed to get response from AI';
      return res.status(status).json({ error: message });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
