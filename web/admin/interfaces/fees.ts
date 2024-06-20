export interface Tax {
  gst: number,
  pst: number
}

export interface FeeInfo {
  filingFees: number,
  filingType: string,
  filingTypeCode: string,
  futureEffectiveFees: number,
  priorityFees: number,
  processingFees: number,
  serviceFees: number,
  tax: Tax,
  total: number
}

export interface PayFeesWidgetItem extends FeeInfo {
  uiUuid: string,
  quantity?: number
}
