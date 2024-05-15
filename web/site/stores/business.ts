import type { BusinessFull, BusinessNano, BusinessTask } from '~/interfaces/business'
export const useBusinessStore = defineStore('bar-sbc-business-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl
  const arStore = useAnnualReportStore()
  const accountStore = useAccountStore()

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

  function assignBusinessStoreValues (bus: BusinessFull) {
    currentBusiness.value = bus

    // throw an error if the nextArYear is invalid
    if (!bus.nextARYear || bus.nextARYear === -1) {
      throw new Error(`${bus.legalName || 'This business'} is not eligible to file an Annual Report`)
    }

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

  // ping sbc pay to see if payment went through and return pay status details
  async function updatePaymentStatusForBusiness (filingId: string | number): Promise<void> {
    await $fetch<ArFilingResponse>(`${apiUrl}/business/${businessNano.value.identifier}/filings/${filingId}/payment`, {
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
  }

  async function getBusinessTask (): Promise<{ task: string; taskValue: BusinessTodoTask | BusinessFilingTask }> {
    const response = await $fetch<BusinessTask>(`${apiUrl}/business/${businessNano.value.identifier}/tasks`, {
      headers: {
        Authorization: `Bearer ${$keycloak.token}`
      },
      onResponseError ({ response }) {
        // console error a message form the api or a default message
        const errorMsg = response._data.message ?? 'Error retrieving business tasks.'
        console.error(errorMsg)
      }
    })

    const taskValue = response.tasks[0].task
    const task = Object.getOwnPropertyNames(taskValue)[0]

    // assign business store values using response from task endpoint, saves having to make another call to get business details
    if ('filing' in taskValue) {
      assignBusinessStoreValues(taskValue.filing.business)
      arStore.arFiling = { filing: { header: taskValue.filing.header, annualReport: taskValue.filing.annualReport } }
      await accountStore.getAndSetAccount(taskValue.filing.header.paymentAccount)
      payStatus.value = taskValue.filing.header.status
    } else if ('todo' in taskValue) {
      assignBusinessStoreValues(taskValue.todo.business)
    }

    return { task, taskValue }
  }

  function $reset () {
    loading.value = true
    currentBusiness.value = {} as BusinessFull
    businessNano.value = {} as BusinessNano
    nextArDate.value = ''
    payStatus.value = null
  }

  return {
    getBusinessByNanoId,
    updatePaymentStatusForBusiness,
    getBusinessTask,
    $reset,
    loading,
    currentBusiness,
    businessNano,
    nextArDate,
    payStatus
  }
},
{ persist: true } // persist store values in session storage
)
