export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) { return }
  const localePath = useLocalePath()
  const tosStore = useTosStore()
  const alertStore = useAlertStore()
  try {
    // all protected routes that arent tos
    if (to.meta.order !== 0 && !to.meta.isTos) {
      const tos = await tosStore.getTermsOfUse()

      // check if tos accepted, if not navigate to tos page
      if (!tos?.isTermsOfUseAccepted) {
        return navigateTo(localePath('/tos'))
      }
    }
    // if tos page, load tos (required to get tos from api call)
    if (to.meta.isTos) {
      await tosStore.getTermsOfUse()
    }
  } catch {
    // navigate home if any errors in tos get and add alert
    console.error('Error retrieving Terms of Use, navigating home.')
    alertStore.addAlert({
      severity: 'error',
      category: AlertCategory.INTERNAL_SERVER_ERROR
    })
    return navigateTo(localePath('/'))
  }
})
