export const useBusinessStore = defineStore('bar-sbc-business-store', () => {
  // config imports
  const arStore = useAnnualReportStore()
  const accountStore = useAccountStore()
  const alertStore = useAlertStore()

  // store values
  const nanoID = ref<string | null>(null)
  const loading = ref<boolean>(true)
  const currentBusiness = ref<BusinessFull>({} as BusinessFull)
  const fullDetails = ref<Business>({} as Business)
  const businessNano = ref<BusinessNano>({} as BusinessNano)
  const payStatus = ref<string | null>(null)

  // date values
  const nextArYear = ref<number | null>(null)
  const nextArDate = ref<Date | null>(null)
  const lastArDate = ref<Date | null>(null)
  const foundingDate = ref<Date | null>(null)

  // get basic business info by nano id
  async function getBusinessByNanoId (id: string): Promise<void> {
    try {
      const response = await useBarApi<BusinessNano>(`/business/token/${id}`)
      if (response) {
        businessNano.value = response
        nanoID.value = id
        foundingDate.value = isoDateStringToLocalDate(response.foundingDate)
        lastArDate.value = response.lastARDate ? dateStringToDate(response.lastARDate) : foundingDate.value
        nextArYear.value = response.nextARYear || null

        if (response.nextARYear) {
          nextArDate.value = new Date(response.nextARYear, lastArDate.value!.getUTCMonth(), lastArDate.value!.getUTCDate())
        } else {
          nextArDate.value = null
        }
        // throw error if next ar date is in the future
        if (!nextArYear.value || nextArYear.value! > new Date().getFullYear()) {
          alertStore.addAlert({
            severity: 'error',
            category: AlertCategory.FUTURE_FILING
          })
          throw new Error(`Annual Report not due until ${nextArDate.value}`)
        }
      }
    } catch (e) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.INVALID_TOKEN
      })
      throw e
    }
  }

  // TODO: investigate business details in network tab, specifically being able to see business details when there is an in progress filing and the user does not own the account associated with that filing
  async function getFullBusinessDetails (): Promise<void> {
    try {
      const response = await useBarApi<Business>(`/business/${businessNano.value.identifier}`, {}, 'token')
      if (response) {
        fullDetails.value = response
        foundingDate.value = isoDateStringToLocalDate(response.business.foundingDate)
        lastArDate.value = response.business.lastArDate ? isoDateStringToLocalDate(response.business.lastArDate) : foundingDate.value
        nextArYear.value = response.business.nextARYear || null

        if (nextArYear.value) {
          nextArDate.value = new Date(nextArYear.value, lastArDate.value!.getMonth(), lastArDate.value!.getDate())
        } else {
          nextArDate.value = null
        }
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

    // throw error if business not in ACT corpState
    if (bus.corpState !== 'ACT') {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.INACTIVE_CORP_STATE
      })
      throw new Error(`${bus.legalName || 'This business'} is not in an active state.`)
    }

    // throw error if business has future effective filings
    if (bus.hasFutureEffectiveFilings) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.FUTURE_EFFECTIVE_FILINGS
      })
      throw new Error(`${bus.legalName || 'This business'} has future effective filings.`)
    }

    // throw an error if the nextArYear is invalid
    if (!bus.nextARYear || bus.nextARYear === -1) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.INVALID_NEXT_AR_YEAR
      })
      throw new Error(`${bus.legalName || 'This business'} is not eligible to file an Annual Report`)
    }

    // throw error if next ar date is in the future
    if (!nextArYear.value || nextArYear.value! > new Date().getFullYear()) {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.FUTURE_FILING
      })
      throw new Error(`Annual Report not due until ${nextArDate.value}`)
    }
  }

  // Returns the available report dates or an empty date array for the current business
  function getArDueDates (): Date[] {
    const reportDates: Date[] = []
    if (!lastArDate.value || !nextArYear.value) {
      return reportDates
    }

    try {
      const referenceDate = lastArDate.value ? new Date(lastArDate.value) : new Date(foundingDate.value!)
      const currYear = new Date().getFullYear()
      const dueMonth = referenceDate.getUTCMonth()
      const dueDay = referenceDate.getUTCDate()

      // Starts from the next AR year and computes all due dates up to the current year.
      for (let year = nextArYear.value; year <= currYear; year++) {
        const reportDueDate = new Date(year, dueMonth, dueDay)
        reportDates.push(reportDueDate)
      }
      return reportDates
    } catch (e) {
      return reportDates
    }
  }

  // ping sbc pay to see if payment went through and return pay status details
  async function updatePaymentStatusForBusiness (filingId: string | number): Promise<void> {
    const response = await useBarApi<ArFiling>(
      `/business/${businessNano.value.identifier}/filings/${filingId}/payment`,
      { method: 'PUT' },
      'token',
      'Error updating business payment status.'
    )

    if (response) {
      payStatus.value = response.filing.header.status
      arStore.arFiling = response
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
        return { task: null, taskValue: null }
      }

      const taskValue = response.tasks[0].task // assign task value
      const taskName = Object.getOwnPropertyNames(taskValue)[0] // assign task name

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
        arStore.arFiling = { filing: { header: taskValue.filing.header, annualReport: taskValue.filing.annualReport, documents: taskValue.filing.documents } }
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
    fullDetails.value = {} as Business
    nanoID.value = null
    nextArYear.value = null
    nextArDate.value = null
    lastArDate.value = null
    foundingDate.value = null
    payStatus.value = null
  }

  return {
    getBusinessByNanoId,
    updatePaymentStatusForBusiness,
    getBusinessTask,
    assignBusinessStoreValues,
    getFullBusinessDetails,
    getArDueDates,
    $reset,
    loading,
    currentBusiness,
    businessNano,
    nextArDate,
    payStatus,
    fullDetails,
    nextArYear,
    lastArDate,
    nanoID,
    foundingDate
  }
},
{ persist: true } // persist store values in session storage
)
