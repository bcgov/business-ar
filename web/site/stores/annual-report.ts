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

  async function submitAnnualReportFiling (agmDate: string | null): Promise<number> {
    try {
      const response = await $fetch<ArFilingResponse>(apiUrl + `/business/${busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier}/filings`, {
        method: 'POST',
        body: {
          filing: {
            header: {
              filingYear: busStore.currentBusiness.nextARYear
            },
            annualReport: {
              annualGeneralMeetingDate: agmDate,
              annualReportDate: busStore.nextArDate,
              votedForNoAGM: false
            }
          }
        },
        headers: {
          Authorization: `Bearer ${$keycloak.token}`,
          'Account-Id': `${accountStore.currentAccount.id}`
        },
        onResponse ({ response }) {
          arFiling.value = response._data
        },
        onResponseError ({ response }) {
          // console error a message from the api or a default message
          const errorMsg = response._data.message ?? 'Error submitting annual report filing.'
          console.error(errorMsg)
        }
      })

      // console.log(response)
      if (response === undefined) {
        throw new Error('Could not file annual report.')
      }

      return response.filing.header.paymentToken
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
