export interface ArFilingResponse {
  filing: {
    annualReport: {
      annualGeneralMeetingDate: string | null
      annualReportDate: string
      votedForNoAGM: boolean
    },
    header: {
      completionDate: null | string
      filingDate: string
      filingYear: number
      id: number
      name: string
      paymentStatus: null | string
      paymentToken: number
      status: string
      submitter: null | string
    }
  }
}

export interface ARFiling {
  agmDate: Date | null,
  votedForNoAGM: boolean
}
