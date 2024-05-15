import type { NewAccount } from '~/interfaces/account'
import { type Org } from '~/interfaces/org'
export const useAccountStore = defineStore('bar-sbc-account-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const token = $keycloak?.token
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl

  // store values
  const currentAccount = ref<Org>({} as Org)
  const userAccounts = ref<Org[]>([])

  // get signed in users accounts
  async function getUserAccounts (): Promise<{ orgs: Org[] } | undefined> {
    try {
      // fetch accounts using token
      return await $fetch<{ orgs: Org[]}>(apiUrl + '/user/accounts', {
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
          const errorMsg = response._data.message ?? 'Error retrieving users accounts.'
          console.error(errorMsg)
        }
      })
    } catch (e: any) {
      throw new Error(e)
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
  async function createNewAccount (data: NewAccount): Promise<void> {
    try {
      await $fetch(apiUrl + '/user/accounts', {
        method: 'POST',
        body: {
          name: data.accountName,
          contactPoint: {
            email: data.contact.email,
            phone: data.contact.phone,
            extension: data.contact.phoneExt
          }
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        onResponse ({ response }) {
          // console.log(response)
          if (response.ok) {
            // set userAccounts if response === 200, then navigate to AR filing page
            currentAccount.value = response._data
            userAccounts.value.push(response._data)
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

  async function checkAccountExists (name: string): Promise<{ limit: number, orgs: Org[], page: number, total: number} | undefined> {
    try {
      return await $fetch<{ limit: number, orgs: Org[], page: number, total: number}>(apiUrl + '/accounts', {
        query: {
          name
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch {
      // silently handle errors
    }
  }

  // create new account name based on a given string
  async function findAvailableAccountName (username: string): Promise<string> {
    let increment = 10
    while (true) {
      const data = await checkAccountExists(username + increment)
      if (data && data.orgs.length === 0) {
        return username + increment
      }
      increment += 10
      if (increment > 100) {
        console.error('Exceeded maximum number of attempts trying to prefill account name.')
        return ''
      }
    }
  }

  return {
    currentAccount,
    userAccounts,
    getUserAccounts,
    selectUserAccount,
    createNewAccount,
    checkAccountExists,
    findAvailableAccountName
  }
},
{ persist: true } // persist store values in session storage
)
