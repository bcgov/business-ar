import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
// return nuxt content file based off current route and locale
// example: route.path: '/en-CA' will return the content file matching '/en-CA/index.md'
// this currently only works with having 1 md file per route
export async function useQueryContentByRoute (): Promise<ParsedContent> {
  const routeWithoutLocale = useRouteWithoutLocale()
  const { locale } = useI18n()

  return await queryContent()
    .where({ _locale: locale.value, _extension: { $eq: 'md' }, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
}
