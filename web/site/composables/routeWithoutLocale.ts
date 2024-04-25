// return reactive route path without locale prefix
export function useRouteWithoutLocale (): Ref<string> {
  const route = useRoute()
  const localeRegex = /^\/[a-zA-Z]{2}-[a-zA-Z]{2}\//

  // strip the locale prefix from the route path
  function getRouteWithoutLocale (path: string): string {
    const match = path.match(localeRegex)
    if (match) {
      return path.replace(match[0], '/') // Replace locale prefix with '/'
    }
    return path
  }

  const routeWithoutLocale = ref(getRouteWithoutLocale(route.path))

  watch(
    () => route.path,
    (newPath) => {
      routeWithoutLocale.value = getRouteWithoutLocale(newPath)
    }
  )

  return routeWithoutLocale
}
