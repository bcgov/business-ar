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
