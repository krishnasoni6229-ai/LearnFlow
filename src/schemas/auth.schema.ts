import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').toLowerCase(),
  email: z.string().email('Please enter a valid email').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterForm = z.infer<typeof registerSchema>;

// End of schemas
