import type { DropdownItem } from '#ui/types'

// handle navigation items and functionality
export function useSbcNav () {
  const localePath = useLocalePath()
  const { t } = useI18n()
  const keycloak = useKeycloak()

  const mainLinks = computed<DropdownItem[]>(() => {
    return [
      {
        icon: 'i-mdi-home',
        label: t('btn.sbcConnect'),
        to: localePath('/')
      }
    ]
  })

  const loggedInUserOptions = computed<DropdownItem[][]>(() => {
    return [
      [
        {
          label: 'Account',
          slot: 'account',
          disabled: true
        },
        {
          label: t('btn.logout'),
          icon: 'i-mdi-logout',
          click: () => keycloak.logout()
        }
      ]
    ]
  })

  // const loggedOutUserOptions = computed<DropdownItem[][]>(() => {
  //   return [
  //     [
  //       {
  //         label: 'Log in',
  //         to: localePath('/sbc/auth/login'),
  //         icon: 'i-mdi-login'
  //       },
  //       {
  //         label: 'Create Account',
  //         icon: 'i-mdi-account-plus'
  //       }
  //     ]
  //   ]
  // })

  return {
    mainLinks,
    loggedInUserOptions
    // loggedOutUserOptions,
  }
}
