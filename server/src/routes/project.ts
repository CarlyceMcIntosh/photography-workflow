import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { CreateProjectSchema } from '../schemas/project.js';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Apply auth middleware to ALL routes in this file
router.use(requireAuth);

// GET /projects - List all projects for authenticated user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;  // Safe: requireAuth guarantees user exists

    // Query projects where user is the creator
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('created_by_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    res.json({ projects });
  } catch (error) {
    console.error('Error in GET /projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /projects - Create new project
router.post('/', async (req: AuthRequest, res) => {
  try {
    // 1. Validate request body with Zod
    const validation = CreateProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const userId = req.user!.id;
    const projectData = validation.data;

    // 2. Insert into database
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        created_by_user_id: userId,
        name: projectData.name,
        session_date: projectData.session_date,
        session_location: projectData.session_location,
        selection_limit: projectData.selection_limit,
        selection_deadline: projectData.selection_deadline,
        workflow_state: 'DRAFT',  // Always starts in DRAFT
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating project:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    res.status(201).json({ project });
  } catch (error) {
    console.error('Error in POST /projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;