import z from 'zod';
import { Logger } from '@nestjs/common';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(0).max(65535),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
});

export function validateEnv(config: Record<string, any>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const logger = new Logger('EnvValidation');
    logger.error(
      'Environment validation failed:',
      z.prettifyError(parsed.error),
    );
    throw new Error('Environment validation failed');
  }

  return parsed.data;
}

export type EnvVariable = z.infer<typeof envSchema>;
