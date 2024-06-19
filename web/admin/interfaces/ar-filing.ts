export interface ArFilingResponse {
  filing: {
    annualReport: {
      annualGeneralMeetingDate: string | null
      annualReportDate: string
      votedForNoAGM: boolean
      unanimousResolutionDate: string | null
    },
    header: {
      completionDate: null | string
      filingDateTime: string
      filingYear: number
      id: number
      name: string
      paymentAccount: string
      paymentStatus: null | string
      paymentToken: number
      status: string
      submitter: null | string
    }
  }
}

export interface ARFiling {
  agmDate: string | null,
  votedForNoAGM: boolean,
  unanimousResolutionDate: string | null
}
