import { describe, expect, it, beforeEach } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { usePayFeesWidget } from '#imports'
import {
  mockFeeInfo,
  mockFilingData
} from '~/tests/mocks/mockedData'

describe('Business Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inits the store with empty values', () => {
    const feeStore = usePayFeesWidget()

    expect(feeStore.errors).toEqual([])
    expect(feeStore.fees).toEqual([])
    expect(feeStore.folioNumber).toBe('')
    expect(feeStore.feeInfo).toEqual([])
  })

  it('adds a new fee to the store', () => {
    const feeStore = usePayFeesWidget()

    feeStore.addFee(mockFeeInfo)

    expect(feeStore.fees.length).toBe(1)
    expect(feeStore.fees[0]).toEqual(expect.objectContaining(mockFeeInfo))
  })

  it('adds an existing fee to the store and increases its count', () => {
    const feeStore = usePayFeesWidget()

    feeStore.addFeeOrIncreaseCount(mockFeeInfo)
    feeStore.addFeeOrIncreaseCount(mockFeeInfo)

    expect(feeStore.fees.length).toBe(1)
    expect(feeStore.fees[0].quantity).toBe(2)
  })

  it('removes a fee from the store', () => {
    const feeStore = usePayFeesWidget()

    feeStore.addFee(mockFeeInfo)
    feeStore.removeFee(mockFeeInfo)

    expect(feeStore.fees.length).toBe(0)
  })

  it('removes an existing fee from the store and decreases its count', () => {
    const feeStore = usePayFeesWidget()

    feeStore.addFeeOrIncreaseCount(mockFeeInfo)
    feeStore.removeFeeOrDecreaseCount(mockFeeInfo)

    expect(feeStore.fees.length).toBe(0)
  })

  it('loads fee types and charges into the store', async () => {
    const store = usePayFeesWidget()
    registerEndpoint('/fees/Example Entity Type/FTC001?priority=true', () => mockFeeInfo)

    await store.loadFeeTypesAndCharges('123456', [mockFilingData])

    expect(store.feeInfo.length).toBe(1)
  })

  it('gets fee information from the store', async () => {
    const store = usePayFeesWidget()
    registerEndpoint('/fees/Example Entity Type/FTC001?priority=true', () => mockFeeInfo)

    await store.loadFeeTypesAndCharges('123456', [mockFilingData])

    const feeInfo = await store.getFeeInfo(mockFilingData)

    expect(feeInfo).toEqual(expect.objectContaining(mockFeeInfo))
  })

  it('resets the store to its initial state', () => {
    const feeStore = usePayFeesWidget()

    feeStore.addFee(mockFeeInfo)
    feeStore.folioNumber = '123456'
    feeStore.errors.push({ message: 'Test Error', statusCode: 400, category: ErrorCategory.FEE_INFO })

    feeStore.$reset()

    expect(feeStore.errors).toEqual([])
    expect(feeStore.fees).toEqual([])
    expect(feeStore.folioNumber).toBe('')
    expect(feeStore.feeInfo).toEqual([])
  })
})
