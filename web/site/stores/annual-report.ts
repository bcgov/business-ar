import type { ARFiling, ArFilingResponse } from '~/interfaces/ar-filing'
export const useAnnualReportStore = defineStore('bar-sbc-annual-report-store', () => {
  const busStore = useBusinessStore()
  const alertStore = useAlertStore()

  // store values
  const loading = ref<boolean>(false)
  const arFiling = ref<ArFilingResponse>({} as ArFilingResponse)

  async function submitAnnualReportFiling (arData: ARFiling): Promise<{ paymentToken: number, filingId: number, payStatus: string }> {
    try {
      let apiSuffix = `/business/${busStore.businessNano.identifier}/filings`
      // add filing id to end of url if filing exists in the store
      if (Object.keys(arFiling.value).length !== 0) {
        apiSuffix += `/${arFiling.value.filing.header.id}`
      }

      const response = await useBarApi<ArFilingResponse>(
        apiSuffix,
        {
          method: 'POST',
          body: {
            filing: {
              header: {
                filingYear: busStore.currentBusiness.nextARYear
              },
              annualReport: {
                annualGeneralMeetingDate: arData.agmDate,
                annualReportDate: busStore.nextArDate,
                votedForNoAGM: arData.votedForNoAGM,
                unanimousResolutionDate: arData.unanimousResolutionDate
              }
            }
          }
        },
        'all'
      )

      if (response) {
        arFiling.value = response
      }

      const paymentToken = response.filing.header.paymentToken
      const filingId = response.filing.header.id
      const payStatus = response.filing.header.status

      return { paymentToken, filingId, payStatus }
    } catch (e) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.AR_SUBMIT_ERROR
      })
      throw e
    }
  }

  function $reset () {
    loading.value = false
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
