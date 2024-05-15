import { describe, expect, it, beforeEach } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useBusinessStore } from '#imports'
import { mockedBusinessNano, mockedBusinessFull, mockedArFilingResponse } from '~/tests/mocks/mockedData'

registerEndpoint('/business/token/1', {
  method: 'GET',
  handler: () => (mockedBusinessNano)
})

registerEndpoint(`/business/${mockedBusinessNano.identifier}`, {
  method: 'GET',
  handler: () => ({ business: { ...mockedBusinessFull } })
})

registerEndpoint('/business/NaN/filings/12/payment', {
  method: 'PUT',
  handler: () => (mockedArFilingResponse)
})

describe('Business Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inits the store with empty values', () => {
    const busStore = useBusinessStore()

    expect(busStore.loading).toEqual(true)
    expect(busStore.currentBusiness).toEqual({})
    expect(busStore.nextArDate).toEqual('')
    expect(busStore.payStatus).toEqual(null)
  })

  it.skip('updates payment status', async () => {
    const busStore = useBusinessStore()

    await busStore.updatePaymentStatusForBusiness('12')

    // assert it assigns the response values
    expect(busStore.payStatus).toEqual('Submitted')
  })
})
