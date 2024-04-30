// redirect user to create account page if no accounts found
export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
  // console.log('in middleware')
  // const keycloak = useKeycloak()
    const localePath = useLocalePath()
    // if (!keycloak.isAuthenticated()) {
    //   return navigateTo('/')
    // }
    const account = useSbcAccount()
    await account.getUserAccounts()
    // console.log('num accounts: ', account.userAccounts.length)
    if (account.userAccounts.length === 0) {
      return navigateTo(localePath('/accounts/create-new'))
    }
  }
})
