export const mockedOrgs = {
  orgs: [
    {
      accessType: 'accessType1',
      branchName: 'branchName1',
      created: 'created1',
      createdBy: 'createdBy1',
      hasApiAccess: true,
      id: 1,
      isBusinessAccount: true,
      mailingAddress: [{ city: 'City1', country: 'Country1', postalCode: 'PostalCode1', region: 'Region1', street: 'Street1', streetAdditional: 'StreetAdditional1' }],
      modified: 'modified1',
      name: 'Name1',
      orgStatus: 'orgStatus1',
      orgType: 'OrgType1',
      statusCode: 'statusCode1',
      uuid: 'uuid1'
    },
    {
      accessType: 'accessType2',
      branchName: 'branchName2',
      created: 'created2',
      createdBy: 'createdBy2',
      hasApiAccess: true,
      id: 2,
      isBusinessAccount: true,
      mailingAddress: [{ city: 'City2', country: 'Country2', postalCode: 'PostalCode2', region: 'Region2', street: 'Street2', streetAdditional: 'StreetAdditional2' }],
      modified: 'modified2',
      name: 'Name2',
      orgStatus: 'orgStatus2',
      orgType: 'OrgType2',
      statusCode: 'statusCode2',
      uuid: 'uuid2'
    },
    {
      accessType: 'accessType3',
      branchName: 'branchName3',
      created: 'created3',
      createdBy: 'createdBy3',
      hasApiAccess: true,
      id: 3,
      isBusinessAccount: true,
      mailingAddress: [{ city: 'City3', country: 'Country3', postalCode: 'PostalCode3', region: 'Region3', street: 'Street3', streetAdditional: 'StreetAdditional3' }],
      modified: 'modified3',
      name: 'Name3',
      orgStatus: 'orgStatus3',
      orgType: 'OrgType3',
      statusCode: 'statusCode3',
      uuid: 'uuid3'
    }
  ]
}

export const mockNewAccount = {
  accessType: 'accessType3',
  branchName: 'branchName3',
  created: 'created3',
  createdBy: 'createdBy3',
  hasApiAccess: true,
  id: 3,
  isBusinessAccount: true,
  mailingAddress: [{ city: 'City3', country: 'Country3', postalCode: 'PostalCode3', region: 'Region3', street: 'Street3', streetAdditional: 'StreetAdditional3' }],
  modified: 'modified3',
  name: 'Mock New Account',
  orgStatus: 'orgStatus3',
  orgType: 'OrgType3',
  statusCode: 'statusCode3',
  uuid: 'uuid3'
}

export const mockedArFilingResponse: ArFilingResponse = {
  filing: {
    annualReport: {
      annualGeneralMeetingDate: '2024-04-30',
      annualReportDate: '2024-04-30',
      votedForNoAGM: false
    },
    header: {
      completionDate: null,
      filingDate: '2024-04-30',
      filingYear: 2024,
      id: 1,
      name: 'Annual Report',
      paymentStatus: 'PAID',
      paymentToken: 123456,
      status: 'Submitted',
      submitter: null
    }
  }
}

export const mockedBusinessNano: BusinessNano = {
  identifier: '123456789',
  legalName: 'Test Business',
  legalType: 'BC',
  taxId: null
}

export const mockedBusinessFull = {
  business: {
    businessNumber: '234653465',
    corpState: 'some state',
    corpStateClass: 'some class',
    email: 'some email',
    foundingDate: 'some date',
    goodStanding: true,
    identifier: '123456789',
    jurisdiction: 'BC',
    lastAgmDate: null,
    lastArDate: '2020-10-10',
    lastLedgerTimestamp: '',
    legalName: 'Test Business Inc',
    legalType: 'BC',
    nextARYear: 2021,
    status: 'some status'
  }
}
