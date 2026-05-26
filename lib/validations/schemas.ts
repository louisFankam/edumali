import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Nom d'utilisateur requis").max(254),
  password: z.string().min(1, "Mot de passe requis").max(128),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
