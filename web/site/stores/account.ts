import type { NewAccount } from '~/interfaces/account'
import { type Org } from '~/interfaces/org'
export const useAccountStore = defineStore('bar-sbc-account-store', () => {
  // store values
  const currentAccount = ref<Org>({} as Org)
  const userAccounts = ref<Org[]>([])
  const keycloak = useKeycloak()

  // get signed in users accounts
  async function getUserAccounts (): Promise<{ orgs: Org[] }> {
    try {
      // only update if user doesnt have role, not currently working so need to make call in index page initPage function still
      // if (!$keycloak.tokenParsed?.roles.includes('public_user')) {
      //   await useBarApi('/users', { method: 'POST' }, 'token')
      await keycloak.getToken(true) // force refresh
      // }

      const response = await useBarApi<{ orgs: Org[] }>(
        '/user/accounts',
        {},
        'token',
        'Error retrieving user accounts.'
      )

      userAccounts.value = response.orgs

      return response
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
      // only update if user doesnt have role, not currently working so need to make call in index page initPage function still
      // if (!$keycloak.tokenParsed?.roles.includes('public_user')) {
      //   await useBarApi('/users', { method: 'POST' }, 'token')
      await keycloak.getToken(true) // force refresh
      // }

      const response = await useBarApi<Org>(
        '/user/accounts',
        {
          method: 'POST',
          body: {
            name: data.accountName,
            contactPoint: {
              email: data.contact.email,
              phone: data.contact.phone,
              extension: data.contact.phoneExt
            }
          }
        },
        'token',
        'An error occurred while creating a new account.'
      )

      currentAccount.value = response
      userAccounts.value.push(response)
    } catch (e: any) {
      throw new Error(e)
    }
  }

  async function isAccountNameAvailable (name: string): Promise<boolean> {
    try {
      const response = await useBarApi<{ limit: number, orgs: Org[], page: number, total: number}>(
        '/accounts',
        {
          query: {
            name
          }
        },
        'token',
        'Unable to verify account name availability at this time.'
      )

      if (response && response.orgs.length > 0) {
        return false
      } else {
        return true
      }
    } catch {
      return false
    }
  }

  // create new account name based on a given string
  async function findAvailableAccountName (username: string): Promise<string> {
    let increment = 10
    while (true) {
      const accountAvailable = await isAccountNameAvailable(username + increment)
      if (accountAvailable) {
        return username + increment
      }
      increment += 10
      if (increment > 100) {
        console.error('Exceeded maximum number of attempts trying to prefill account name.')
        return ''
      }
    }
  }

  async function getAndSetAccount (id: string): Promise<void> {
    await getUserAccounts()
    selectUserAccount(parseInt(id))
  }

  function $reset () {
    currentAccount.value = {} as Org
    userAccounts.value = []
  }

  // add roles to new sign in so user has roles in sbc auth
  async function updateUserProfile ():Promise<void> {
    try {
      await useBarApi(
        '/users',
        { method: 'POST' },
        'token',
        'An error occured while trying to update the user roles.'
      )
    } catch (e: any) {
      throw new Error(e)
    }
  }

  return {
    currentAccount,
    userAccounts,
    getUserAccounts,
    selectUserAccount,
    createNewAccount,
    isAccountNameAvailable,
    findAvailableAccountName,
    getAndSetAccount,
    updateUserProfile,
    $reset
  }
},
{ persist: true } // persist store values in session storage
)
