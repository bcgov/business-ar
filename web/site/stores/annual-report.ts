export const useAnnualReportStore = defineStore('sbc-annual-report-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const accountStore = useAccountStore()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl
  const busStore = useBusinessStore()

  // store values
  const loading = ref<boolean>(true)
  const arFiling = ref<ArFilingResponse>({} as ArFilingResponse)

  interface ARFiling {
    agmDate: Date | null,
    votedForNoAGM: boolean
  }

  async function submitAnnualReportFiling (agmData: ARFiling): Promise<{ paymentToken: number, filingId: number }> {
    try {
      const response = await $fetch<ArFilingResponse>(apiUrl + `/business/${busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier}/filings`, {
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
          arFiling.value = response._data
          console.log(arFiling.value)
        },
        onResponseError ({ response }) {
          // console error a message from the api or a default message
          const errorMsg = response._data.message ?? 'Error submitting annual report filing.'
          console.error(errorMsg)
        }
      })

      if (response === undefined) {
        throw new Error('Could not file annual report.')
      }

      const paymentToken = response.filing.header.paymentToken
      const filingId = response.filing.header.id

      return { paymentToken, filingId }
    } catch (error) {
      console.error('An error occurred:', error)
      throw error
    }
  }

  return {
    loading,
    arFiling,
    submitAnnualReportFiling
  }
},
{ persist: true }
)
