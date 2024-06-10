import { describe, expect, it, beforeEach } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnualReportStore } from '#imports'
import { mockNewAccount, mockedArFilingResponse } from '~/tests/mocks/mockedData'

describe('Annual Report Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const busStore = useBusinessStore()
    const accountStore = useAccountStore()
    accountStore.currentAccount = mockNewAccount
    busStore.businessNano = {
      identifier: '123',
      legalName: 'Test inc',
      legalType: 'BC',
      taxId: null
    }
  })

  it('inits the store with empty values', () => {
    const arStore = useAnnualReportStore()

    expect(arStore.loading).toEqual(false)
    expect(arStore.arFiling).toEqual({})
  })

  it('creates ar filing, assigns store value and returns paymentToken and filingId', async () => {
    registerEndpoint('/business/123/filings', {
      method: 'POST',
      handler: () => (mockedArFilingResponse)
    })

    const arStore = useAnnualReportStore()
    // submit filing
    const { paymentToken, filingId } = await arStore.submitAnnualReportFiling({
      agmDate: new Date('2022-10-10'),
      votedForNoAGM: false,
      unanimousResolutionDate: null
    })

    // assert
    expect(arStore.arFiling).toEqual(mockedArFilingResponse)
    // assigns user accounts in the onResponse of the getUserAccounts
    expect(paymentToken).toEqual(mockedArFilingResponse.filing.header.paymentToken)
    expect(filingId).toEqual(mockedArFilingResponse.filing.header.id)
  })

  it('will add filing id to end of submitAnnualReport url if a filing currently exists', async () => {
    const arStore = useAnnualReportStore()

    registerEndpoint('/business/123/filings/1', { // current store filings id
      method: 'POST',
      handler: () => (mockedArFilingResponse)
    })

    arStore.arFiling = mockedArFilingResponse

    expect(Object.keys(arStore.arFiling).length).toBeGreaterThan(0)

    await arStore.submitAnnualReportFiling({
      agmDate: new Date('2022-10-10'),
      votedForNoAGM: false,
      unanimousResolutionDate: null
    })

    const { paymentToken, filingId } = await arStore.submitAnnualReportFiling({
      agmDate: new Date('2022-10-10'),
      votedForNoAGM: false,
      unanimousResolutionDate: null
    })

    // assert
    expect(arStore.arFiling).toEqual(mockedArFilingResponse)
    // assigns user accounts in the onResponse of the getUserAccounts
    expect(paymentToken).toEqual(mockedArFilingResponse.filing.header.paymentToken)
    expect(filingId).toEqual(mockedArFilingResponse.filing.header.id)
  })

  it('can reset the store values', () => {
    const arStore = useAnnualReportStore()
    arStore.arFiling = mockedArFilingResponse
    arStore.loading = false

    expect(Object.keys(arStore.arFiling).length).toBeGreaterThan(0)

    arStore.$reset()

    expect(Object.keys(arStore.arFiling).length).toBe(0)
  })
})
