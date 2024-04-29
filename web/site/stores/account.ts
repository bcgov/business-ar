export const useSbcAccount = defineStore('sbc-account', () => {
  // const user = useCurrentUser()
  const localePath = useLocalePath()

  const currentAccount = ref({})
  const userAccounts = ref([])

  // need to add user id to get correct users account
  async function getUserAccounts () {
    // const apiURL = useRuntimeConfig().public.authApiURL
    return await $fetch('/api/accounts', {
      onResponse ({ response }) {
        if (response.ok) {
          userAccounts.value = response._data
        }
        console.log(response)
      },
      onResponseError ({ response }) {
        console.error(response._data.message)
      }
    })
    // return await axios.get<UserSettingsI[]>(`${apiURL}/users/${keycloakGuid}/settings`)
    //   .then((response) => {
    //     const data = response?.data
    //     if (!data) { throw new Error('Invalid AUTH API response') }
    //     return data.filter(userSettings => (userSettings.type === UserSettingsTypeE.ACCOUNT)) as AccountI[]
    //   })
    //   .catch((error) => {
    //     console.warn('Error fetching user settings / account list.')
    //     errors.value.push({
    //       statusCode: error?.response?.status || StatusCodes.INTERNAL_SERVER_ERROR,
    //       message: error?.response?.data?.message,
    //       category: ErrorCategoryE.ACCOUNT_LIST
    //     })
    //   })
  }

  function selectUserAccount (accountId: string) {
    for (const i in userAccounts.value) {
      if (userAccounts.value[i].id === accountId) {
        currentAccount.value = userAccounts.value[i]
      }
    }
    // sessionStorage.setItem(SessionStorageKeyE.CURRENT_ACCOUNT, JSON.stringify(currentAccount.value))
  }

  async function createNewAccount (accountData: any) {
    await $fetch('/api/accounts', {
      method: 'post',
      body: accountData,
      async onResponse ({ response }) {
        console.log(response._data)
        if (response.ok) {
          currentAccount.value = response._data
          await navigateTo(localePath('/file-annual-report'))
        }
      }
    })
  }

  watch(currentAccount, () => {
    console.log('current user account: ', currentAccount.value)
  })

  return {
    currentAccount,
    userAccounts,
    getUserAccounts,
    selectUserAccount,
    createNewAccount
  }
}, { persist: true })
