// return nuxt content file based off current route and locale
export async function useQueryContentByRoute () {
  const routeWithoutLocale = useRouteWithoutLocale()
  const { locale } = useI18n()

  return await queryContent()
    .where({ _locale: locale.value, _extension: { $eq: 'md' }, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
}
