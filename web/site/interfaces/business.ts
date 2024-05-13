export interface BusinessFull {
  businessNumber: string
  corpState: string
  corpStateClass: string
  email: string | null
  foundingDate: string
  goodStanding: boolean | null
  identifier: string
  jurisdiction: string
  lastAgmDate: string | null
  lastArDate: string
  lastLedgerTimestamp: string
  legalName: string
  legalType: string
  nextARYear: number
  status: string
}

export interface BusinessNano {
  identifier: string
  legalName: string
  legalType: string
  taxId: string | null
}

export interface BusinessFilingTask {
  filing: {
    annualReport: {
      annualGeneralMeetingDate: string
      annualReportDate: string
      votedForNoAGM: boolean
    }
    business: BusinessFull
    header: {
      certifiedBy: string | null
      colinIds: string[] | number[]
      completionDate: string | null
      date: string
      filingDateTime: string
      filingYear: number
      id: number
      name: string
      paymentAccount: string
      paymentStatus: string | null
      paymentToken: number
      status: string
      submitter: string | null
    }
  }
}

export interface BusinessTodoTask {
  todo: {
    business: BusinessFull
    header: {
      ARFilingYear: number;
      name: string;
      status: string;
    }
  }
}

export interface BusinessTask {
  tasks: Array<{ task: BusinessTodoTask | BusinessFilingTask }>
}
