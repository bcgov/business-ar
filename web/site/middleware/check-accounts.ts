// redirect user to create account page if no accounts found
export default defineNuxtRouteMiddleware(async () => {
  // console.log('in middleware')
  const localePath = useLocalePath()
  const account = useSbcAccount()
  await account.getUserAccounts()
  // console.log('num accounts: ', account.userAccounts.length)
  if (account.userAccounts.length === 0) {
    return navigateTo(localePath('/accounts/create-new'))
  }
})
