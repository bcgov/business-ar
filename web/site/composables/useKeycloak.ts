export const useKeycloak = () => {
  const { $keycloak } = useNuxtApp()
  const localePath = useLocalePath()

  function login () {
    return $keycloak.login({ idpHint: 'bcsc' })
  }

  function logout () {
    return $keycloak.logout({ redirectUri: useRelativeRoute(localePath('/')) })
  }

  async function getUserProfile () {
    if ($keycloak && $keycloak.authenticated) {
      return await $keycloak.loadUserProfile()
    } else {
      return null
    }
  }

  const authenticated = computed(() => {
    if (process.client) {
      return $keycloak.authenticated
    } else {
      return false
    }
  })

  return {
    login,
    logout,
    getUserProfile,
    authenticated
  }
}
