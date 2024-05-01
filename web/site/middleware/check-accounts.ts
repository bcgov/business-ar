// redirect user to create account page if no accounts found
export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
    const localePath = useLocalePath()
    const account = useAccountStore()
    const accounts = await account.getUserAccounts()
    if (accounts?.orgs.length === 0 || accounts === undefined) {
      return navigateTo(localePath('/accounts/create-new'))
    }
  }
})
