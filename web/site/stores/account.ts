import { type Org } from '~/interfaces/org'
export const useSbcAccount = defineStore('sbc-account', () => {
  const { $keycloak } = useNuxtApp()
  const token = $keycloak?.token
  const localePath = useLocalePath()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl + '/user/accounts'

  const currentAccount = ref<Org>({} as Org)
  const userAccounts = ref<Org[]>([])

  // need to add user id to get correct users account
  async function getUserAccounts () {
    return await $fetch(apiUrl, {
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

  // const data = {
  //   name: 'Test AR Account 2',
  //   accessType: 'REGULAR',
  //   typeCode: 'BASIC',
  //   productSubscriptions: [
  //     {
  //       productCode: 'BUSINESS'
  //     }
  //   ],
  //   mailingAddress: {
  //     city: 'Victoria',
  //     country: 'CA',
  //     region: 'BC',
  //     deliveryInstructions: 'test',
  //     postalCode: 'V8W 2C3',
  //     street: '200-1012 Douglas St',
  //     streetAdditional: ''
  //   },
  //   paymentInfo: {
  //     paymentMethod: 'DIRECT_PAY'
  //   }
  // }

  async function createNewAccount (accountData: any) {
    // await $fetch(apiUrl, {
    await $fetch('/api/accounts', {
      method: 'POST',
      body: {
        accountData
      },
      headers: {
        Authorization: `Bearer ${token}`
      },
      async onResponse ({ response }) {
        console.log(response._data)
        if (response.ok) {
          currentAccount.value = response._data
          await navigateTo(localePath('/annual-report'))
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
