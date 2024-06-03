import type { Business, BusinessFull, BusinessNano, BusinessTask, BusinessTaskName } from '~/interfaces/business'
export const useBusinessStore = defineStore('bar-sbc-business-store', () => {
  // config imports
  const arStore = useAnnualReportStore()
  const accountStore = useAccountStore()
  const alertStore = useAlertStore()

  // store values
  const loading = ref<boolean>(true)
  const currentBusiness = ref<BusinessFull>({} as BusinessFull)
  const fullDetails = ref<Business>({} as Business)
  const businessNano = ref<BusinessNano>({} as BusinessNano)
  const nextArDate = ref<string>('')
  const payStatus = ref<string | null>(null)
  const businessTask = ref<BusinessTaskName>('initial')

  // get basic business info by nano id
  async function getBusinessByNanoId (id: string): Promise<void> {
    try {
      const response = await useBarApi<BusinessNano>(`/business/token/${id}`)
      if (response) {
        businessNano.value = response
      }
    } catch (e) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.INVALID_TOKEN
      })
      throw e
    }
  }

  async function getFullBusinessDetails (): Promise<void> {
    try {
      const response = await useBarApi<Business>(`/business/${businessNano.value.identifier}`, {}, 'token')
      if (response) {
        fullDetails.value = response
      }
    } catch (e) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.BUSINESS_DETAILS
      })
      throw e
    }
  }

  function assignBusinessStoreValues (bus: BusinessFull) {
    currentBusiness.value = bus

    // throw an error if the nextArYear is invalid
    if (!bus.nextARYear || bus.nextARYear === -1) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.INVALID_NEXT_AR_YEAR
      })
      throw new Error(`${bus.legalName || 'This business'} is not eligible to file an Annual Report`)
    }

    // if no lastArDate, it means this is the companies first AR, so need to use founding date instead
    if (!bus.lastArDate) {
      nextArDate.value = addOneYear(bus.foundingDate)
    } else {
      nextArDate.value = addOneYear(bus.lastArDate)
    }

    // throw error if next ar date is in the future
    if (new Date(nextArDate.value) > new Date()) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.FUTURE_FILING
      })
      throw new Error(`Annual Report not due until ${nextArDate.value}`)
    }
  }

  // ping sbc pay to see if payment went through and return pay status details
  async function updatePaymentStatusForBusiness (filingId: string | number): Promise<void> {
    const response = await useBarApi<ArFilingResponse>(
      `/business/${businessNano.value.identifier}/filings/${filingId}/payment`,
      { method: 'PUT' },
      'token',
      'Error updating business payment status.'
    )

    if (response) {
      payStatus.value = response.filing.header.status
    }
  }

  async function getBusinessTask (): Promise<{ task: string | null, taskValue: BusinessTodoTask | BusinessFilingTask | null }> {
    try {
      const response = await useBarApi<BusinessTask>(
        `/business/${businessNano.value.identifier}/tasks`,
        {},
        'token',
        'Error retrieving business tasks.'
      )

      await getFullBusinessDetails()
      assignBusinessStoreValues(fullDetails.value.business)

      // handle case where theres no tasks available (filings complete up to date)
      if (response.tasks.length === 0) {
        businessTask.value = 'none'
        return { task: null, taskValue: null }
      }

      const taskValue = response.tasks[0].task // assign task value
      const taskName = Object.getOwnPropertyNames(taskValue)[0] // assign task name
      businessTask.value = taskName as 'filing' | 'todo' // set store value

      // assign business store values using response from task endpoint, saves having to make another call to get business details
      if ('filing' in taskValue) {
        await accountStore.getAndSetAccount(taskValue.filing.header.paymentAccount)
        // throw error if user does not own account of the in progress filing
        if (!accountStore.userAccounts.some(account => account.id === parseInt(taskValue.filing.header.paymentAccount))) {
          alertStore.addAlert({
            severity: 'error',
            category: AlertCategory.ACCOUNT_ACCESS
          })
          throw new Error('Access Denied: Your account does not have permission to complete this task.')
        }
        // assignBusinessStoreValues(taskValue.filing.business)
        arStore.arFiling = { filing: { header: taskValue.filing.header, annualReport: taskValue.filing.annualReport } }
        payStatus.value = taskValue.filing.header.status
      }
      return { task: taskName, taskValue }
    } catch (e) {
      // add general error alert if the error is not access denied
      if (!(e instanceof Error && e.message.includes('Access Denied'))) {
        alertStore.addAlert({
          severity: 'error',
          category: AlertCategory.BUSINESS_DETAILS
        })
      }
      throw e
    }
  }

  function $reset () {
    loading.value = true
    currentBusiness.value = {} as BusinessFull
    businessNano.value = {} as BusinessNano
    nextArDate.value = ''
    payStatus.value = null
    fullDetails.value = {} as Business
    businessTask.value = 'initial'
  }

  return {
    getBusinessByNanoId,
    updatePaymentStatusForBusiness,
    getBusinessTask,
    assignBusinessStoreValues,
    getFullBusinessDetails,
    $reset,
    loading,
    currentBusiness,
    businessNano,
    nextArDate,
    payStatus,
    fullDetails,
    businessTask
  }
},
{ persist: true } // persist store values in session storage
)
