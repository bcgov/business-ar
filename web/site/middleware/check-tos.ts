export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) { return }
  const { $keycloak } = useNuxtApp()
  const test = await $fetch('https://auth-api-dev.apps.silver.devops.gov.bc.ca/api/v1/documents/termsofuse', { headers: { Authorization: `Bearer ${$keycloak.token}` } })
  console.log(test)
})
