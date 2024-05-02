import type { BusinessFull, BusinessNano } from '~/interfaces/business'
export const useBusinessStore = defineStore('sbc-business-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const accountStore = useAccountStore()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl

  // store values
  const loading = ref<boolean>(true)
  const currentBusiness = ref<BusinessFull>({} as BusinessFull)
  const nextArDate = ref<string>('')
  const payStatus = ref<string | null>(null)

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
    } catch (e: any) {
      throw new Error(e)
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
    } catch (e: any) {
      throw new Error(e)
    }
  }

  // affiliate business with account
  async function affiliateBusinessWithAccount (): Promise<void> {
    try {
      await $fetch(`${apiUrl}/user/accounts/${accountStore.currentAccount.id}/affiliate`, {
        method: 'POST',
        body: {
          businessIdentifier: currentBusiness.value.jurisdiction + currentBusiness.value.identifier
        },
        headers: {
          Authorization: `Bearer ${$keycloak.token}`
        },
        onResponseError ({ response }) {
          // console error a message from the api or a default message
          const errorMsg = response._data.message ?? 'Error retrieving business details.'
          console.error(errorMsg)
        }
      })
    } catch {
      // handle error silently
    }
  }

  async function updatePaymentStatusForBusiness (filingId: string | number): Promise<void> {
    const identifier = currentBusiness.value.jurisdiction + currentBusiness.value.identifier
    loading.value = true
    try {
      const response = await $fetch<ArFilingResponse>(`${apiUrl}/business/${identifier}/filings/${filingId}/payment`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${$keycloak.token}`
        },
        onResponse ({ response }) {
          if (response.ok) {
            payStatus.value = response._data.filing.header.paymentStatus
          }
          // console.log('res: ', response)
        },
        onResponseError ({ response }) {
          // console error a message from the api or a default message
          const errorMsg = response._data.message ?? 'Error updating business payment status.'
          console.error(errorMsg)
        }
      })

      if (response === undefined) {
        throw new Error('Could not update payment status.')
      }
    } catch (error) {
      console.error('An error occurred:', error)
      throw error
    } finally {
      setTimeout(() => {
        loading.value = false
      }, 500)
    }
  }

  return {
    getBusinessByNanoId,
    affiliateBusinessWithAccount,
    updatePaymentStatusForBusiness,
    loading,
    currentBusiness,
    nextArDate,
    payStatus
  }
},
{ persist: true } // persist store values in session storage
)
