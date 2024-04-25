import Axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import { defineStore } from 'pinia'
import { type Account } from '~/interfaces/account'
import { ErrorCategory } from '~/enums/error-category'
import { ErrorI } from '~/interfaces/error-i'
import { type KCUser } from '~/interfaces/kc-user'
import { addAxiosInterceptors } from '~/utils/axios'

/** Manages bcros account data */
export const useBcrosAccount = defineStore('bcros/account', () => {
  // keycloak info
  const keycloak = useBcrosKeycloak()
  // selected user account
  const currentAccount: Ref<Account> = ref({} as Account)
  const currentAccountName = computed((): string => currentAccount.value?.label || '')
  // user info
  const user = computed(() => keycloak.kcUser)
  const userAccounts: Ref<Account[]> = ref([])
  const userFirstName: Ref<string> = ref(user.value?.firstName || '-')
  const userLastName: Ref<string> = ref(user.value?.lastName || '')
  const userFullName = computed(() => `${userFirstName.value} ${userLastName.value}`)
  // errors
  const errors: Ref<ErrorI[]> = ref([])
  // api request variables
  const axios = addAxiosInterceptors(Axios.create())
  const apiURL = useRuntimeConfig().public.authApiURL

  /** Get user information from AUTH */
  async function getAuthUserProfile (identifier: string) {
    return await axios.get<KCUser | void>(`${apiURL}/users/${identifier}`)
      .then((response) => {
        const data = response?.data
        if (!data) { throw new Error('Invalid AUTH API response') }
        return data
      })
      .catch((error) => {
        console.warn('Error fetching user info.')
        errors.value.push({
          statusCode: error?.response?.status || StatusCodes.INTERNAL_SERVER_ERROR,
          message: error?.response?.data?.message,
          category: ErrorCategoryE.USER_INFO
        })
      })
  }

  /** Update user information in AUTH with current token info */
  async function updateAuthUserInfo () {
    return await axios.post<KCUser | void>(`${apiURL}/users`, { isLogin: true })
      .then(response => response.data)
      .catch((error) => {
        // not too worried if this errs -- log for ops
        console.error('Error updating Auth with login attempt', error)
      })
  }

  /** Set user name information */
  async function setUserName () {
    if (user.value?.loginSource === LoginSource.BCEID) {
      // get from auth
      const authUserInfo = await getAuthUserProfile('@me')
      if (authUserInfo) {
        userFirstName.value = authUserInfo.firstName
        userLastName.value = authUserInfo.lastName
      }
      return
    }
    userFirstName.value = user.value?.firstName || '-'
    userLastName.value = user.value?.lastName || ''
  }

  /** Get the user's account list */
  async function getUserAccounts (keycloakGuid: string) {
    const apiURL = useRuntimeConfig().public.authApiURL
    return await axios.get<UserSettings[]>(`${apiURL}/users/${keycloakGuid}/settings`)
      .then((response) => {
        const data = response?.data
        if (!data) { throw new Error('Invalid AUTH API response') }
        return data.filter(userSettings => (userSettings.type === UserSettingsType.ACCOUNT)) as Account[]
      })
      .catch((error) => {
        console.warn('Error fetching user settings / account list.')
        errors.value.push({
          statusCode: error?.response?.status || StatusCodes.INTERNAL_SERVER_ERROR,
          message: error?.response?.data?.message,
          category: ErrorCategory.ACCOUNT_LIST
        })
      })
  }

  /** Set the user account list and current account */
  async function setAccountInfo (currentAccountId?: string) {
    if (!currentAccountId) {
      // try getting id from existing session storage
      currentAccountId = JSON.parse(sessionStorage.getItem(SessionStorageKey.CURRENT_ACCOUNT) || '{}').id
    }
    if (user.value?.keycloakGuid) {
      userAccounts.value = await getUserAccounts(user.value?.keycloakGuid) || []
      if (userAccounts && userAccounts.value.length > 0) {
        currentAccount.value = userAccounts.value[0]
        if (currentAccountId) {
          // if previous current account id selection information available set this as current account
          currentAccount.value = userAccounts.value.find(account => account.id === currentAccountId) || {} as AccountI
        }
        sessionStorage.setItem(SessionStorageKeyE.CURRENT_ACCOUNT, JSON.stringify(currentAccount.value))
      }
    }
  }

  /** Switch the current account to the given account ID if it exists in the user's account list */
  function switchCurrentAccount (accountId: string) {
    for (const i in userAccounts.value) {
      if (userAccounts.value[i].id === accountId) {
        currentAccount.value = userAccounts.value[i]
      }
    }
    sessionStorage.setItem(SessionStorageKeyE.CURRENT_ACCOUNT, JSON.stringify(currentAccount.value))
  }

  return {
    currentAccount,
    currentAccountName,
    userAccounts,
    userFullName,
    errors,
    updateAuthUserInfo,
    setUserName,
    setAccountInfo,
    switchCurrentAccount
  }
})
