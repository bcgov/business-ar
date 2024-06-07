import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
export const useTosStore = defineStore('bar-sbc-terms-of-service-store', () => {
  const busStore = useBusinessStore()
  const alertStore = useAlertStore()

  // store values
  const loading = ref<boolean>(false)
  const tos = ref<TOSGetResponse>({} as TOSGetResponse)

  async function getTermsOfUse () {
    try {
      tos.value = await useBarApi<TOSGetResponse>('/users/tos', {}, 'token')
      console.log('get tos: ', tos.value)
    } catch {

    }
  }

  async function submitTermsOfUse (event: FormSubmitEvent<any>, successCallback: Function) {
    console.log(event)
    try {
      console.log('submitting patch')
      const response = await useBarApi<TOSPatchResponse>(
        '/users/tos',
        {
          method: 'PATCH',
          body: {
            istermsaccepted: false,
            termsversion: tos.value.termsOfUseCurrentVersion
          }
        },
        'token'
      )

      if (response.isTermsOfUseAccepted) {
        console.log('accepted')
        console.log(response)
        successCallback()
      }
    } catch {

    }
  }

  function $reset () {
    loading.value = false
  }

  return {
    loading,
    tos,
    getTermsOfUse,
    submitTermsOfUse,
    $reset
  }
},
{ persist: true }
)
