export const useQueryContentByRoute = async () => {
  const { locale } = useI18n()
  const routeWithoutLocale = useRouteWithoutLocale()

  return await queryContent()
    .where({ _locale: locale.value, _extension: { $eq: 'md' }, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
}
