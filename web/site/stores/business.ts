import type { Business } from '~/interfaces/business'
// import { type Org } from '~/interfaces/org'
export const useBusinessStore = defineStore('sbc-business-store', () => {
  // const { $keycloak } = useNuxtApp()
  // const token = $keycloak?.token
  // const localePath = useLocalePath()
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl + '/business'
  const loading = ref(true)
  const currentBusiness = ref<Business>({} as Business)

  const corpNumber = computed(() => {
    if (currentBusiness.value.identifier !== '') {
      return currentBusiness.value.jurisdiction + currentBusiness.value.identifier
    } else {
      return ''
    }
  })

  // const currentAccount = ref<Org>({} as Org)
  // const userAccounts = ref<Org[]>([])

  async function getBusinessByNanoId (id: string) {
    loading.value = true
    try {
      await $fetch(`${apiUrl}/token/${id}`, {
        async onResponse ({ response }) {
          if (response.ok) {
            // console.log('nano id: ', response._data)
            await getBusinessDetails(response._data.identifier)
          }
        },
        onResponseError ({ response }) {
          console.log('failed to get business by nano id')
        }
      }).then(() => {
        setTimeout(() => {
          console.log('in set timeout')
          loading.value = false
        }, 1000)
      })
    } catch (error) {
      console.error('error: ', error)
    }
  }

  async function getBusinessDetails (identifier: string) {
    await $fetch<Business>(`${apiUrl}/${identifier}`, {
      onResponse ({ response }) {
        if (response.ok) {
          currentBusiness.value = response._data.business
          // console.log(response)
        }
      },
      onResponseError ({ response }) {
        console.error(response._data.message)
      }
    })
    console.log('business: ', currentBusiness.value)
  }

  return {
    // currentAccount,
    // userAccounts,
    // getUserAccounts,
    getBusinessByNanoId,
    loading,
    currentBusiness,
    corpNumber
  }
},
{ persist: true }
)
