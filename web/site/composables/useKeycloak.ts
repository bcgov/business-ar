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

  function isAuthenticated () {
    return $keycloak.authenticated
  }

  const kcUser = computed((): KCUser => {
    if ($keycloak && $keycloak.tokenParsed) {
      return {
        firstName: $keycloak.tokenParsed.firstname,
        lastName: $keycloak.tokenParsed.lastname,
        fullName: $keycloak.tokenParsed.name,
        userName: $keycloak.tokenParsed.username,
        email: $keycloak.tokenParsed.email,
        keycloakGuid: $keycloak.tokenParsed.sub || '',
        loginSource: $keycloak.tokenParsed.loginSource,
        roles: $keycloak.tokenParsed.realm_access?.roles || []
      }
    }
    return {} as KCUser
  })

  return {
    login,
    logout,
    getUserProfile,
    isAuthenticated,
    kcUser
  }
}
