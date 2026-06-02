import { z } from 'zod';

const createProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required!'),
    description: z.string().min(1, 'Description is required!'),
    deadline: z.coerce.date().refine(
      (val) => val >= new Date(new Date().setHours(0, 0, 0, 0)),
      { message: 'Please select a valid deadline.' }
    ),
    status: z.enum(['active', 'completed', 'on_hold']).default('active'),
    members: z.array(z.string()).optional().default([]),
  }),
});

const updateProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    deadline: z.coerce.date().refine(
      (val) => val >= new Date(new Date().setHours(0, 0, 0, 0)),
      { message: 'Please select a valid deadline.' }
    ).optional(),
    status: z.enum(['active', 'completed', 'on_hold']).optional(),
    members: z.array(z.string()).optional(),
  }),
});

export const ProjectValidation = {
  createProjectValidationSchema,
  updateProjectValidationSchema,
};
