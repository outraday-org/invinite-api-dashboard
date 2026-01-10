import { createServerFn } from '@tanstack/react-start'

import { api } from './client.server'

type StatementKind = 'standardized' | 'as-reported'
type StatementType = 'income-statement' | 'balance-sheet' | 'cash-flow-statement' | 'snapshot'
type StatementView = 'base' | 'detailed' | 'presentation'

type FiscalPeriodType = 'quarterly' | 'annual' | 'ytd' | 'ttm'
type SortDirection = 'asc' | 'desc'

const buildStatementPath = (
  kind: StatementKind,
  statement: StatementType,
  view: StatementView,
) => {
  const suffix = view === 'base' ? '' : `/${view}`
  return `/v1/${kind}/${statement}${suffix}` as const
}

export const searchCompanies = createServerFn({ method: 'GET' }).handler(
  async ({ data }: { data: { query: string; limit?: number; offset?: number } }) => {
    const { query, limit = 10, offset = 0 } = data
    const { data: res, error } = await api.GET('/v1/company/search', {
      params: { query: { query, limit, offset } },
    })
    if (error) throw error
    return res
  },
)

export const getCompanyDetails = createServerFn({ method: 'GET' }).handler(
  async ({ data }: { data: { identifier: string } }) => {
    const { identifier } = data
    const { data: res, error } = await api.GET('/v1/company/details', {
      params: { query: { identifier } },
    })
    if (error) throw error
    return res
  },
)

export const getFinancialStatement = createServerFn({ method: 'GET' }).handler(
  async ({
    data,
  }: {
    data: {
      identifier: string
      kind: StatementKind
      statement: StatementType
      view: StatementView
      fiscal_period_type: FiscalPeriodType
      sort?: SortDirection
      limit?: number
      offset?: number
    }
  }) => {
    const {
      identifier,
      kind,
      statement,
      view,
      fiscal_period_type,
      sort = 'desc',
      limit = 8,
      offset = 0,
    } = data

    const path = buildStatementPath(kind, statement, view)
    const { data: res, error } = await api.GET(path, {
      params: {
        query: {
          identifier,
          fiscal_period_type,
          sort,
          limit,
          offset,
        },
      },
    })
    if (error) throw error
    return res
  },
)

export const getFilings = createServerFn({ method: 'GET' }).handler(
  async ({
    data,
  }: {
    data: {
      identifier: string
      form_type?: string
      sort?: SortDirection
      limit?: number
      offset?: number
    }
  }) => {
    const { identifier, form_type, sort = 'desc', limit = 40, offset = 0 } = data
    const { data: res, error } = await api.GET('/v1/sec-filings/filings', {
      params: {
        query: {
          identifier,
          form_type,
          sort,
          limit,
          offset,
        },
      },
    })
    if (error) throw error
    return res
  },
)
