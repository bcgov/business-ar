import { type FeeInfo } from '~/interfaces/fees'
import type { FilingData, PayFeesApiQueryParams } from '~/interfaces/filing-data'

const constructFeeInfoURL = (filingData: FilingData) => {
  const runtimeConfig = useRuntimeConfig()
  const payApiURL = runtimeConfig.public.payApiURL
  return `${payApiURL}/fees/${filingData.entityType}/${filingData.filingTypeCode}`
}

const getPayFeesApiQueryParams = (filingData: FilingData): PayFeesApiQueryParams => {
  return {
    waiveFees: filingData.waiveFees || undefined,
    futureEffective: filingData.futureEffective || undefined,
    priority: filingData.priority || undefined
  }
}

const getFeeInfoRefs = async (filingData: FilingData) => {
  const url = constructFeeInfoURL(filingData)
  const queryParams = getPayFeesApiQueryParams(filingData)
  const { data, error } = await useFetchSbc<FeeInfo>(url, { query: queryParams })

  return { data, error }
}

const getFeeInfo = async (filingData: FilingData) => {
  const { data, error } = await getFeeInfoRefs(filingData)

  return { data: data.value, error: error.value }
}

export default {
  getFeeInfoRefs,
  getFeeInfo
}
