import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    INVINITE_API_KEY: z.string().min(1, 'Set INVINITE_API_KEY in the environment'),
    INVINITE_API_URL: z.string().url().default('https://api.invinite.com'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
