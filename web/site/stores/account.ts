import { type Org } from '~/interfaces/org'
export const useSbcAccount = defineStore('sbc-account', () => {
  const { $keycloak } = useNuxtApp()
  const localePath = useLocalePath()

  const currentAccount = ref<Org>({} as Org)
  const userAccounts = ref<Org[]>([])

  // need to add user id to get correct users account
  async function getUserAccounts () {
    const token = $keycloak?.token
    // const apiURL = useRuntimeConfig().public.authApiURL
    return await $fetch('http://127.0.0.1:5000/v1/user/accounts', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      onResponse ({ response }) {
        if (response.ok) {
          userAccounts.value = response._data.orgs
        }
        console.log(response)
      },
      onResponseError ({ response }) {
        console.error(response._data.message)
      }
    })
  }

  function selectUserAccount (accountId: number) {
    for (const i in userAccounts.value) {
      if (userAccounts.value[i].id === accountId) {
        currentAccount.value = userAccounts.value[i]
      }
    }
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
}
//  { persist: true }
)
