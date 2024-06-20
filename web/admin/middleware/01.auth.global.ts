export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) { return }
  const { $keycloak } = useNuxtApp()
  const localePath = useLocalePath()
  if (to.meta.order !== 0 && !$keycloak.authenticated) {
    return navigateTo(localePath('/'))
  }
})
