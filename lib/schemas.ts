import { z } from 'zod'

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const ModerationSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text is too long')
})

export const BatchModerationSchema = z.object({
  texts: z.array(z.string().min(1).max(5000)).max(1000, 'Max 1000 texts allowed'),
  columnIndex: z.number().optional().default(0)
})

export const ThresholdSchema = z.object({
  label: z.string().min(1),
  value: z.number().min(0).max(1)
})

export const UpdateThresholdsSchema = z.object({
  thresholds: z.record(z.number().min(0).max(1))
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type SignInInput = z.infer<typeof SignInSchema>
export type ModerationInput = z.infer<typeof ModerationSchema>
export type BatchModerationInput = z.infer<typeof BatchModerationSchema>
export type ThresholdInput = z.infer<typeof ThresholdSchema>
export type UpdateThresholdsInput = z.infer<typeof UpdateThresholdsSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
