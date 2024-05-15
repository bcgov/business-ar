import { describe, expect, it, beforeEach } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useAnnualReportStore } from '#imports'
import { mockedArFilingResponse } from '~/tests/mocks/mockedData'

describe('Annual Report Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inits the store with empty values', () => {
    const arStore = useAnnualReportStore()

    expect(arStore.loading).toEqual(true)
    expect(arStore.arFiling).toEqual({})
  })

  it('creates ar filing, assigns store value and returns paymentToken and filingId', async () => {
    registerEndpoint('/business/NaN/filings', {
      method: 'POST',
      handler: () => (mockedArFilingResponse)
    })

    const arStore = useAnnualReportStore()
    // submit filing
    const { paymentToken, filingId } = await arStore.submitAnnualReportFiling({
      agmDate: new Date('2022-10-10'),
      votedForNoAGM: false
    })

    // assert
    expect(arStore.arFiling).toEqual(mockedArFilingResponse)
    // assigns user accounts in the onResponse of the getUserAccounts
    expect(paymentToken).toEqual(mockedArFilingResponse.filing.header.paymentToken)
    expect(filingId).toEqual(mockedArFilingResponse.filing.header.id)
  })
})
