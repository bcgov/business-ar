import type { FeeData, FeeInfo, FeeType, PayFeesApiQueryParams } from '~/interfaces/fees'
import type { ConnectPayAccount } from '~/interfaces/connect-pay-account'
import type { ConnectPaymentMethod, ConnectFeeItem } from '~/interfaces/connect-payment'

function constructFeeInfoURL (filingData: FeeData): string {
  const runtimeConfig = useRuntimeConfig()
  const payApiURL = runtimeConfig.public.payApiURL
  return `${payApiURL}/fees/${filingData.entityType}/${filingData.filingTypeCode}`
}

function getPayFeesApiQueryParams (filingData: FeeData): PayFeesApiQueryParams {
  return {
    waiveFees: filingData.waiveFees || undefined,
    futureEffective: filingData.futureEffective || undefined,
    priority: filingData.priority || undefined
  }
}

function fetchFee (filingData: FeeData): Promise<FeeInfo> | undefined {
  try {
    const { $keycloak } = useNuxtApp()
    const accountStore = useAccountStore()
    const url = constructFeeInfoURL(filingData)
    const queryParams = getPayFeesApiQueryParams(filingData)
    return $fetch<FeeInfo>(url, {
      query: queryParams,
      headers: {
        Authorization: `Bearer ${$keycloak.token}`,
        'Account-Id': accountStore.currentAccount.id.toString()
      }
    })
  } catch (e) {
    console.error('Error fetching fee:', e)
    throw e
  }
}

const feeType: FeeType = {
  BCANN: {
    entityType: 'BC',
    filingTypeCode: 'BCANN',
    futureEffective: false,
    priority: false,
    waiveFees: false
  }
}

function getAccount (accountId: string): Promise<ConnectPayAccount> {
  const runtimeConfig = useRuntimeConfig()
  const payApiURL = runtimeConfig.public.payApiURL
  const { $keycloak } = useNuxtApp()
  const accountStore = useAccountStore()
  return $fetch<ConnectPayAccount>(`${payApiURL}/accounts/${accountId}`, {
    headers: {
      Authorization: `Bearer ${$keycloak.token}`,
      'Account-Id': accountStore.currentAccount.id.toString()
    }
  })
}

async function createPayment (paymentRequest: {
  method: ConnectPaymentMethod
  fees: ConnectFeeItem[]
  applicationId?: string
}) {
  return await $fetch('/api/payments', {
    method: 'POST',
    body: {
      paymentMethod: paymentRequest.method,
      feeItems: paymentRequest.fees,
      applicationId: paymentRequest.applicationId
    }
  })
}

export default {
  constructFeeInfoURL,
  getPayFeesApiQueryParams,
  fetchFee,
  feeType,
  getAccount,
  createPayment
}
