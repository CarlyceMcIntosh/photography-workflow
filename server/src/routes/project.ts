import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { CreateProjectSchema, UpdateProjectSchema } from '../schemas/project.js';

import { supabase } from '../lib/supabase.js';

const router = Router();

// Apply auth middleware to ALL routes in this file
router.use(requireAuth);

// GET /projects - List all projects for authenticated user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;  // requireAuth guarantees user exists

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
        details: validation.error.issues 
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

// GET /projects/:id - Get single project by ID
router.get('/:id', async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
  
      // Query project by ID AND created_by_user_id
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('created_by_user_id', userId)
        .single();
  
      if (error || !project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      res.json({ project });
    } catch (error) {
      console.error('Error in GET /projects/:id:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
// PATCH /projects/:id - Update project
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Validate request body
    const validation = UpdateProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues
      });
    }

    // First verify that the project exists and the user owns it
    const { data: existing, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('created_by_user_id', userId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update the project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update(validation.data)
      .eq('id', id)
      .eq('created_by_user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error updating project:', updateError);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Error in PATCH /projects/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  

export default router;