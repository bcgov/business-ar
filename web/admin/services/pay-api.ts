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
  return await useFetchSbc<FeeInfo>(url, { query: queryParams })
}

const getFeeInfo = async (filingData: FilingData) => {
  return await getFeeInfoRefs(filingData)
}

export default {
  getFeeInfoRefs,
  getFeeInfo
}
