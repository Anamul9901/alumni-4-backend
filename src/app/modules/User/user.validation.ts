import { z } from 'zod';

const signUpValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required!'),
    email: z.string().min(1, 'Email is required!').email(),
    role: z.enum(['admin', 'project_manager', 'team_member']).default('team_member'),
    password: z
      .string({ message: 'Password must be a string' })
      .max(20, { message: 'Password can not be more than 20 characters' }),
    isDeleted: z.boolean().optional().default(false),
  }),
});

const updateUserValidationSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(['admin', 'project_manager', 'team_member']).optional(),
    })
    .optional(),
});

const logInValidationSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required!'),
    password: z.string().min(1, 'Password is required!'),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required!'),
    oldPassword: z.string().min(1, 'Previous password is required!'),
    newPassword: z.string().min(1, 'New password is required!'),
  }),
});

export const UserValidation = {
  signUpValidationSchema,
  logInValidationSchema,
  changePasswordValidationSchema,
  updateUserValidationSchema,
};
