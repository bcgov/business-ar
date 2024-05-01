export const useAnnualReportStore = defineStore('sbc-annual-report-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const accountStore = useAccountStore()
  const localePath = useLocalePath()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl
  const busStore = useBusinessStore()

  // store values
  const loading = ref<boolean>(true)

  async function submitAnnualReportFiling (agmDate: string | null) {
    try {
      return await $fetch(apiUrl + `/business/${busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier}/filings`, {
        method: 'POST',
        body: {
          filing: {
            header: {
              filingYear: busStore.currentBusiness.nextARYear
            },
            annualReport: {
              annualGeneralMeetingDate: agmDate,
              annualReportDate: busStore.nextArDate
            }
          }
        },
        headers: {
          Authorization: `Bearer ${$keycloak.token}`,
          'Account-Id': `${accountStore.currentAccount.id}`
        },
        onResponse ({ response }) {
          console.log('response: ', response)
        }
      })
    } catch {
      // do something if creating the filing fails
    }
  }

  return {
    loading,
    submitAnnualReportFiling
  }
}
// { persist: true } // persist store values in session storage
)
