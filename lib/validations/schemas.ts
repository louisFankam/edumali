import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide").max(254),
  password: z.string().min(8, "Mot de passe invalide").max(128),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
