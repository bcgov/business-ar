const mobileNavRef = ref(false)

// handle navigation items and functionality
export function useSbcNav () {
  const localePath = useLocalePath()
  const { t } = useI18n()
  const router = useRouter()

  const mainLinks = computed(() => {
    return [
      {
        icon: 'i-mdi-home',
        label: t('btn.sbcConnect'),
        to: localePath('/')
      }
    ]
  })

  function openMobileNav () {
    mobileNavRef.value = true
  }

  async function closeMobileNav () {
    await router.isReady()
    await nextTick()
    mobileNavRef.value = false
  }

  return {
    mainLinks,
    mobileNavRef,
    openMobileNav,
    closeMobileNav
  }
}
