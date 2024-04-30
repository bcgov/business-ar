import type { BusinessFull, BusinessNano } from '~/interfaces/business'
export const useBusinessStore = defineStore('sbc-business-store', () => {
  const localePath = useLocalePath()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl + '/business'
  const loading = ref<boolean>(true)
  const currentBusiness = ref<BusinessFull>({} as BusinessFull)

  // get basic business info by nano id
  async function getBusinessByNanoId (id: string) {
    loading.value = true
    try {
      // fetch by provided id
      await $fetch<BusinessNano>(`${apiUrl}/token/${id}`, {
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
      }, 1000)
    }
  }

  // fetch full business details by identifier
  async function getBusinessDetails (identifier: string) {
    try {
      await $fetch<BusinessFull>(`${apiUrl}/${identifier}`, {
        onResponse ({ response }) {
          if (response.ok) {
            // set currentBusiness if response === 200
            currentBusiness.value = response._data.business
          }
        },
        onResponseError ({ response }) {
          // console error a message form the api or a default message
          const errorMsg = response._data.message ?? 'Error retrieving business details.'
          console.error(errorMsg)
        }
      })
    } catch {
      // navigate to error page if error getting business by identifier
      await navigateTo(localePath('/missing-id'))
    }
  }

  return {
    getBusinessByNanoId,
    loading,
    currentBusiness
  }
},
{ persist: true }
)
