export interface BusinessFull {
  taxId: string
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
      ARFilingYear: number
      name: string
      status: string
    }
  }
}

export interface BusinessTask {
  tasks: Array<{ task: BusinessTodoTask | BusinessFilingTask }>
}

export type BusinessTaskName = 'filing' | 'todo' | 'none' | 'initial'

export interface Address {
  actions: any[]
  addressCity: string
  addressCountry: string
  addressId: number
  addressRegion: string
  deliveryInstructions: string
  postalCode: string
  streetAddress: string
  streetAddressAdditional: string
}

export interface Office {
  deliveryAddress: Address
  mailingAddress: Address
}

interface Officer {
  firstName: string
  lastName: string
  middleInitial: string
  orgName: string
}

interface Role {
  appointmentDate: string
  cessationDate: string | null
  roleType: string
}

export interface Party {
  actions: any[]
  appointmentDate: string
  cessationDate: string | null
  deliveryAddress: Address
  endEventId: string
  id: number
  mailingAddress: Address
  officer: Officer
  roles: Role[]
  startEventId: string
  title: string
}

export interface Business {
  business: BusinessFull
  offices: {
    recordsOffice: Office
    registeredOffice: Office
  }
  parties: Party[]
}
