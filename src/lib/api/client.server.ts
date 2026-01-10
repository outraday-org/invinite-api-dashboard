import createClient from 'openapi-fetch'

import type { paths } from './schema'
import { env } from '../env'

export const api = createClient<paths>({
  baseUrl: env.INVINITE_API_URL,
  headers: {
    Authorization: `Bearer ${env.INVINITE_API_KEY}`,
  },
})
