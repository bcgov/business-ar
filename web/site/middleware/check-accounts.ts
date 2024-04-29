// redirect user to create account page if no accounts found
export default defineNuxtRouteMiddleware(async () => {
  // console.log('in middleware')
  const localePath = useLocalePath()
  const account = useSbcAccount()
  const userAccounts = await account.getUserAccounts()
  // console.log('num accounts: ', userAccounts.length)
  if (userAccounts.length === 0) {
    return navigateTo(localePath('/create-account'))
  }
})
