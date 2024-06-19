export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) { return }
  const { $keycloak } = useNuxtApp()
  const localePath = useLocalePath()
  const alertStore = useAlertStore()
  if (to.meta.order !== 0 && !$keycloak.tokenParsed?.roles.includes('staff')) {
    alertStore.addAlert({
      severity: 'error',
      category: AlertCategory.REQUIRES_STAFF_USER
    })
    return navigateTo(localePath('/'))
  }
})
