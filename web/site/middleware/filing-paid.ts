// navigate home if pay status === 'PAID'
export default defineNuxtRouteMiddleware(() => {
  const busStore = useBusinessStore()
  const localePath = useLocalePath()
  if (busStore.payStatus === 'PAID') {
    return navigateTo(localePath('/'))
  }
})
