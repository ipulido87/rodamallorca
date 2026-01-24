import { z } from 'zod'

const NotificationEmailSchema = z.object({
  orders: z.boolean().default(true),
  marketing: z.boolean().default(false),
  updates: z.boolean().default(true),
})

const NotificationPushSchema = z.object({
  orders: z.boolean().default(true),
  messages: z.boolean().default(true),
})

const NotificationsSchema = z.object({
  email: NotificationEmailSchema,
  push: NotificationPushSchema,
})

const PreferencesSchema = z.object({
  language: z.enum(['es', 'en', 'ca']).default('es'),
})

const PrivacySchema = z.object({
  profileVisible: z.boolean().default(true),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
})

export const UpdateUserSettingsSchema = z.object({
  notifications: NotificationsSchema.optional(),
  preferences: PreferencesSchema.optional(),
  privacy: PrivacySchema.optional(),
})

export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsSchema>
