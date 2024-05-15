import Keycloak from 'keycloak-js'
import { vi } from 'vitest'

const mockParsedToken = {
  firstname: 'First',
  lastname: 'Last',
  fullName: 'First Last',
  keycloakGuid: '123456',
  name: 'First Last',
  username: 'Username',
  email: 'test@email.com',
  sub: '123456',
  loginSource: 'BCSC',
  realm_access: { roles: ['role1', 'role2'] }
}
// export const mockedLogin = vi.fn()

export const mockedKeycloak: Partial<Keycloak> = {
  init: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  authenticated: true,
  tokenParsed: mockParsedToken
}
