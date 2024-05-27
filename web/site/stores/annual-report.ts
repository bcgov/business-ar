import type { ARFiling } from '~/interfaces/ar-filing'
export const useAnnualReportStore = defineStore('bar-sbc-annual-report-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const accountStore = useAccountStore()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl
  const busStore = useBusinessStore()

  // store values
  const loading = ref<boolean>(true)
  const arFiling = ref<ArFilingResponse>({} as ArFilingResponse)

  async function submitAnnualReportFiling (agmData: ARFiling): Promise<{ paymentToken: number, filingId: number, payStatus: string }> {
    let apiSuffix = `/business/${busStore.businessNano.identifier}/filings`
    // add filing id to end of url if filing exists in the store
    if (Object.keys(arFiling.value).length !== 0) {
      apiSuffix += `/${arFiling.value.filing.header.id}`
    }

    const response = await $fetch<ArFilingResponse>(apiUrl + apiSuffix, {
      method: 'POST',
      body: {
        filing: {
          header: {
            filingYear: busStore.currentBusiness.nextARYear
          },
          annualReport: {
            annualGeneralMeetingDate: agmData.agmDate,
            annualReportDate: busStore.nextArDate,
            votedForNoAGM: agmData.votedForNoAGM
          }
        }
      },
      headers: {
        Authorization: `Bearer ${$keycloak.token}`,
        'Account-Id': `${accountStore.currentAccount.id}`
      },
      onResponse ({ response }) {
        if (response.ok) {
          // console.log(response)
          arFiling.value = response._data
        }
        // console.log(arFiling.value)
      },
      onResponseError ({ response }) {
        // console error a message from the api or a default message
        const errorMsg = response._data.message ?? 'Error submitting annual report filing.'
        console.error(errorMsg)
      }
    })

    const paymentToken = response.filing.header.paymentToken
    const filingId = response.filing.header.id
    const payStatus = response.filing.header.status

    return { paymentToken, filingId, payStatus }
  }

  function $reset () {
    loading.value = true
    arFiling.value = {} as ArFilingResponse
  }

  return {
    loading,
    arFiling,
    submitAnnualReportFiling,
    $reset
  }
},
{ persist: true }
)
