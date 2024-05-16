// navigate to /accounts/choose-existing if no account present
export default defineNuxtRouteMiddleware(() => {
  const accountStore = useAccountStore()
  const localePath = useLocalePath()
  if (!accountStore.currentAccount.id) {
    return navigateTo(localePath('/accounts/choose-existing'))
  }
})
