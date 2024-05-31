export const useAlertStore = defineStore('bar-sbc-alert-store', () => {
  const alerts = ref<Alert[]>([])

  function $reset () {
    alerts.value = []
  }

  function addAlert (alert: Alert) {
    alerts.value.push(alert)
  }

  return {
    alerts,
    addAlert,
    $reset
  }
},
{ persist: true }
)
