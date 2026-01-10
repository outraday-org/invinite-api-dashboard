import { queryOptions, useQuery } from '@tanstack/react-query'

import {
  getCompanyDetails,
  getFilings,
  getFinancialStatement,
  searchCompanies,
} from './server-functions'

export const companySearchOptions = (query: string) =>
  queryOptions({
    queryKey: ['company', 'search', query],
    queryFn: () => searchCompanies({ data: { query } }),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })

export const companyDetailsOptions = (identifier: string) =>
  queryOptions({
    queryKey: ['company', 'details', identifier],
    queryFn: () => getCompanyDetails({ data: { identifier } }),
    enabled: identifier.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })

type StatementQuery = {
  identifier: string
  kind: 'standardized' | 'as-reported'
  statement: 'income-statement' | 'balance-sheet' | 'cash-flow-statement' | 'snapshot'
  view: 'base' | 'detailed' | 'presentation'
  fiscal_period_type: 'quarterly' | 'annual' | 'ytd' | 'ttm'
  sort?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export const financialStatementOptions = (input: StatementQuery) =>
  queryOptions({
    queryKey: [
      'financial',
      input.kind,
      input.statement,
      input.view,
      input.identifier,
      input.fiscal_period_type,
      input.sort ?? 'desc',
      input.limit ?? 8,
      input.offset ?? 0,
    ],
    queryFn: () => getFinancialStatement({ data: input }),
    enabled: input.identifier.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })

type FilingsQuery = {
  identifier: string
  form_type?: string
  sort?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export const filingsOptions = (input: FilingsQuery) =>
  queryOptions({
    queryKey: [
      'filings',
      input.identifier,
      input.form_type ?? 'all',
      input.sort ?? 'desc',
      input.limit ?? 40,
      input.offset ?? 0,
    ],
    queryFn: () => getFilings({ data: input }),
    enabled: input.identifier.trim().length > 0,
    staleTime: 10 * 60 * 1000,
  })

export const useCompanySearch = (query: string) => useQuery(companySearchOptions(query))

export const useCompanyDetails = (identifier: string) =>
  useQuery(companyDetailsOptions(identifier))

export const useFinancialStatement = (input: StatementQuery) =>
  useQuery(financialStatementOptions(input))

export const useFilings = (input: FilingsQuery) => useQuery(filingsOptions(input))
