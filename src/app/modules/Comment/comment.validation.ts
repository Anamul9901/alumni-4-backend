import { z } from 'zod';

const createCommentValidationSchema = z.object({
  body: z.object({
    task: z.string().min(1, 'Task ID is required!'),
    comment: z.string().min(1, 'Comment text is required!'),
  }),
});

const updateCommentValidationSchema = z.object({
  body: z.object({
    comment: z.string().min(1, 'Comment text is required!'),
  }),
});

export const CommentValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
};
