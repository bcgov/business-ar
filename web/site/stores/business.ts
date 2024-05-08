import type { BusinessFull, BusinessNano } from '~/interfaces/business'
export const useBusinessStore = defineStore('bar-sbc-business-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
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
    loading.value = false
  }

  // fetch full business details by identifier
  async function getBusinessDetails (identifier: string): Promise<void> {
    await $fetch<BusinessFull>(`${apiUrl}/business/${identifier}`, {
      onResponse ({ response }) {
        if (response.ok) {
          // set store values if response === 200
          // console.log(response._data)
          const bus: BusinessFull = response._data.business
          currentBusiness.value = bus
          nextArDate.value = addOneYear(bus.lastArDate)
          // throw error if business already filed an AR for the current year
          const currentYear = new Date().getFullYear()
          if (bus.nextARYear > currentYear) {
            throw new Error(`Business has already filed an Annual Report for ${currentYear}`)
          }
        }
      },
      onResponseError ({ response }) {
        // console error a message from the api or a default message
        const errorMsg = response._data.message ?? 'Error retrieving business details.'
        console.error(errorMsg)
      }
    })
  }

  // ping sbc pay to see if payment went through and return pay status details
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
          // console.log('put request: ', response._data)
          // set pay status var
          if (response.ok) {
            payStatus.value = response._data.filing.header.status
          }
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
      loading.value = false
    }
  }

  return {
    getBusinessByNanoId,
    getBusinessDetails,
    updatePaymentStatusForBusiness,
    loading,
    currentBusiness,
    nextArDate,
    payStatus
  }
},
{ persist: true } // persist store values in session storage
)
