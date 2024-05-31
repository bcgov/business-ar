export const useAlertStore = defineStore('bar-sbc-alert-store', () => {
  const alerts = ref<Alert[]>([])

  function $reset () {
    alerts.value = []
  }

  return {
    alerts,
    $reset
  }
},
{ persist: true }
)
