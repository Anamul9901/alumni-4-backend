import { z } from 'zod';

const createTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required!'),
    description: z.string().min(1, 'Description is required!'),
    project: z.string().min(1, 'Project ID is required!'),
    assignedMember: z.string().nullable().optional(),
    dueDate: z.coerce.date().refine(
      (val) => val >= new Date(new Date().setHours(0, 0, 0, 0)),
      { message: 'Please select a valid deadline.' }
    ),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
    attachments: z.array(z.string()).optional().default([]),
  }),
});

const updateTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    project: z.string().optional(),
    assignedMember: z.string().nullable().optional(),
    dueDate: z.coerce.date().refine(
      (val) => val >= new Date(new Date().setHours(0, 0, 0, 0)),
      { message: 'Please select a valid deadline.' }
    ).optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
    status: z.enum(['todo', 'in_progress', 'completed']).optional(),
    attachments: z.array(z.string()).optional(),
  }),
});

export const TaskValidation = {
  createTaskValidationSchema,
  updateTaskValidationSchema,
};
