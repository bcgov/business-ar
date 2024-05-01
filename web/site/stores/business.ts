import type { BusinessFull, BusinessNano } from '~/interfaces/business'
export const useBusinessStore = defineStore('sbc-business-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const accountStore = useAccountStore()
  const localePath = useLocalePath()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl

  // store values
  const loading = ref<boolean>(true)
  const currentBusiness = ref<BusinessFull>({} as BusinessFull)
  const nextArDate = ref<string>('')

  // get basic business info by nano id
  async function getBusinessByNanoId (id: string): Promise<void> {
    loading.value = true
    try {
      // fetch by provided id
      await $fetch<BusinessNano>(`${apiUrl}/business/token/${id}`, {
        async onResponse ({ response }) {
          if (response.ok) {
            // get full business details by the returned identifier
            await getBusinessDetails(response._data.identifier)
          }
        },
        onResponseError ({ response }) {
          // console error a message form the api or a default message
          const errorMsg = response._data.message ?? 'Error retrieving business by nano id.'
          console.error(errorMsg)
        }
      })
    } catch {
      // navigate to error page if error getting business by nano id
      await navigateTo(localePath('/missing-id'))
    } finally {
      setTimeout(() => {
        loading.value = false
      }, 500)
    }
  }

  // fetch full business details by identifier
  async function getBusinessDetails (identifier: string): Promise<void> {
    try {
      await $fetch<BusinessFull>(`${apiUrl}/business/${identifier}`, {
        onResponse ({ response }) {
          if (response.ok) {
            // set store values if response === 200
            currentBusiness.value = response._data.business
            nextArDate.value = addOneYear(response._data.business.lastArDate)
          }
        },
        onResponseError ({ response }) {
          // console error a message from the api or a default message
          const errorMsg = response._data.message ?? 'Error retrieving business details.'
          console.error(errorMsg)
        }
      })
    } catch {
      // navigate to error page if error getting business by identifier
      await navigateTo(localePath('/missing-id'))
    }
  }

  // affiliate business with account
  async function affiliateBusinessWithAccount () {
    try {
      return await $fetch(`${apiUrl}/user/accounts/${accountStore.currentAccount.id}/affiliate`, {
        method: 'POST',
        body: {
          businessIdentifier: currentBusiness.value.jurisdiction + currentBusiness.value.identifier
        },
        headers: {
          Authorization: `Bearer ${$keycloak.token}`
        },
        onResponseError ({ response }) {
          console.log(response)
          // console error a message from the api or a default message
          const errorMsg = response._data.message ?? 'Error retrieving business details.'
          console.error(errorMsg)
        }
      })
    } catch {
      // do something if account affiliation fails
    }
  }

  return {
    getBusinessByNanoId,
    affiliateBusinessWithAccount,
    loading,
    currentBusiness,
    nextArDate
  }
},
{ persist: true } // persist store values in session storage
)
