import { type Org } from '~/interfaces/org'
export const useAccountStore = defineStore('sbc-account-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const token = $keycloak?.token
  const localePath = useLocalePath()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl + '/user/accounts'

  // store values
  const currentAccount = ref<Org>({} as Org)
  const userAccounts = ref<Org[]>([])

  // get signed in users accounts
  async function getUserAccounts (): Promise<{ orgs: Org[] } | undefined> {
    try {
      // fetch accounts using token
      return await $fetch<{ orgs: Org[]}>(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        onResponse ({ response }) {
          if (response.ok) {
            // set userAccounts if response === 200
            userAccounts.value = response._data.orgs
          }
        },
        onResponseError ({ response }) {
          // console error a message from the api or a default message
          const errorMsg = response._data.message ?? 'Error retrieving business details.'
          console.error(errorMsg)
        }
      })
    } catch {
      // navigate to create a new account if fetching accounts fails
      await navigateTo(localePath('/accounts/create-new'))
    }
  }

  // assign existing account as users current account
  function selectUserAccount (accountId: number): void {
    for (const i in userAccounts.value) {
      if (userAccounts.value[i].id === accountId) {
        currentAccount.value = userAccounts.value[i]
      }
    }
  }

  // create new account
  async function createNewAccount (accountData: any): Promise<void> {
    await $fetch(apiUrl, {
      method: 'POST',
      body: {
        name: 'Test Account 789'
      },
      headers: {
        Authorization: `Bearer ${token}`
      },
      async onResponse ({ response }) {
        if (response.ok) {
          // set userAccounts if response === 200, then navigate to AR filing page
          currentAccount.value = response._data
          await navigateTo(localePath('/annual-report'))
        }
      }
    })
  }

  return {
    currentAccount,
    userAccounts,
    getUserAccounts,
    selectUserAccount,
    createNewAccount
  }
},
{ persist: true } // persist store values in session storage
)
