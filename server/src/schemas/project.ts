//Purpose: Define the schemas for the project endpoints

import { z } from 'zod';

// Define all valid workflow states (must match database ENUM)
export const WorkflowState = z.enum([
  'DRAFT',
  'BOOKED',
  'PREPARATION',
  'SESSION_SCHEDULED',
  'PROOFS_IN_PREPARATION',
  'PROOFING',
  'SELECTION_SUBMITTED',
  'RETOUCHING',
  'DELIVERED',
]);

// Schema for creating a new project
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  session_date: z.string().datetime().optional(),
  session_location: z.string().max(500).optional(),
  selection_limit: z.number().int().min(1).optional(),
  selection_deadline: z.string().datetime().optional(),
});

// Schema for updating an existing project
//all fields are optional (it only updates what is provided)
export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  session_date: z.string().datetime().optional(),
  session_location: z.string().max(500).optional(),
  selection_limit: z.number().int().min(1).optional(),
  selection_deadline: z.string().datetime().optional(),
})


// Infer TypeScript type from schema
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;