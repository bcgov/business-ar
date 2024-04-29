export interface FilingData {
  filingDescription?: string
  filingTypeCode: string
  entityType: string
  waiveFees: boolean
  priority: boolean
  futureEffective: boolean
}

export interface PayFeesApiQueryParams {
  waiveFees?: boolean
  priority?: boolean
  futureEffective?: boolean
}
