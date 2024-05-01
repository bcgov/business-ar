import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockParsedToken } from '~/tests/mocks/mockedKeycloak'
import { useKeycloak } from '~/composables/useKeycloak'

const mockLogin = vi.fn().mockImplementation(() => {})

mockNuxtImport('useI18n', () => {
  return () => (
    {
      locale: 'en-CA',
      locales: ref([
        {
          name: 'English',
          code: 'en-CA',
          iso: 'en-CA',
          dir: 'ltr',
          file: 'en-CA.ts'
        }
      ]),
      t: (key: string) => key
    }
  )
})

// const { mockUseNuxtApp } = vi.hoisted(() => {
//   return {
//     mockUseNuxtApp: vi.fn().mockImplementation(() => {
//       return {
//         $keycloak: 'test'
//       }
//     })
//   }
// })

// mockNuxtImport('useNuxtApp', () => {
//   return mockUseNuxtApp
// })

describe.skip('useKeycloak', () => {
  const keycloak = useKeycloak()
  // const testToken = 'qjduwe'
  // const testTokenRefresh = 'qjduwwewvwe'
  // const testTokenId = '12322frwr'
  // const mockLogout = vi.fn().mockImplementation(() => {})

  // beforeEach(() => {
  // vi.stubGlobal('useNuxtApp', () => ({
  //   $keycloak: {
  //     login: mockLogin,
  //     logout: vi.fn(),
  //     loadUserProfile: vi.fn(),
  //     authenticated: false,
  //     tokenParsed: mockParsedToken
  //   }
  // }))
  // })

  it('handles login', () => {
    keycloak.login()
    console.log(keycloak)

    // expect(mockLogin).toHaveBeenCalledOnce()
  })

  // it('returns kcUser object', () => {
  //   expect(keycloak.kcUser.value).toEqual({
  //     firstName: mockParsedToken.firstname,
  //     lastName: mockParsedToken.lastname,
  //     fullName: mockParsedToken.name,
  //     userName: mockParsedToken.username,
  //     email: mockParsedToken.email,
  //     keycloakGuid: mockParsedToken.sub,
  //     loginSource: mockParsedToken.loginSource,
  //     roles: mockParsedToken.realm_access.roles
  //   })
  // })

  // it.skip('handles logout', async () => {
  //   const logoutUrl = 'http://logout'
  //   // setup
  //   keycloak.syncSessionStorage()
  //   expect(mockLogout).toBeCalledTimes(0)
  //   // logout
  //   await keycloak.logout(logoutUrl)
  //   // check keycloak logout was called with redirec
  //   expect(mockLogout).toBeCalledTimes(1)
  //   expect(mockLogout).toBeCalledWith({ redirectUri: logoutUrl })
  // })
})
