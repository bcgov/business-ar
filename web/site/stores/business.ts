import type { BusinessFull, BusinessNano } from '~/interfaces/business'
export const useBusinessStore = defineStore('bar-sbc-business-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl

  // store values
  const loading = ref<boolean>(true)
  const currentBusiness = ref<BusinessFull>({} as BusinessFull)
  const businessNano = ref<BusinessNano>({} as BusinessNano)
  const nextArDate = ref<string>('')
  const payStatus = ref<string | null>(null)

  // get basic business info by nano id
  async function getBusinessByNanoId (id: string): Promise<void> {
    loading.value = true
    // fetch by provided id
    await $fetch<BusinessNano>(`${apiUrl}/business/token/${id}`, {
      onResponse ({ response }) {
        if (response.ok) {
          businessNano.value = response._data
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
  function getBusinessDetails (identifier: string): Promise<BusinessFull> {
    return $fetch<BusinessFull>(`${apiUrl}/business/${identifier}`, {
      headers: {
        Authorization: `Bearer ${$keycloak.token}`
      },
      onResponse ({ response }) {
        if (response.ok) {
          // set store values if response === 200
          // console.log(response._data)
          const bus: BusinessFull = response._data.business
          currentBusiness.value = bus

          // throw error if business already filed an AR for the current year
          const currentYear = new Date().getFullYear()
          if (bus.lastArDate && new Date(bus.lastArDate).getFullYear() === currentYear) {
            throw new Error(`Business has already filed an Annual Report for ${currentYear}`)
          }

          // if no lastArDate, it means this is the companies first AR, so need to use founding date instead
          if (!bus.lastArDate) {
            nextArDate.value = addOneYear(bus.foundingDate)
          } else {
            nextArDate.value = addOneYear(bus.lastArDate)
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
      await $fetch<ArFilingResponse>(`${apiUrl}/business/${identifier}/filings/${filingId}/payment`, {
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
    } catch (error) {
      // do something if error from put request
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
    businessNano,
    nextArDate,
    payStatus
  }
},
{ persist: true } // persist store values in session storage
)
