export function useErrorMessage (
  error: ApiError | null,
  fallbackTitle: string,
  fallbackDescription: string
) {
  const { t } = useI18n()

  if (error?.statusCode === 500) {
    return {
      title: t('alerts.internal-server-error.title'),
      description: t('alerts.internal-server-error.description')
    }
  }

  return {
    title: error?.data?.message || fallbackTitle,
    description: error?.data?.detail || fallbackDescription
  }
}
