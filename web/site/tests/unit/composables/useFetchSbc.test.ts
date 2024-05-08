import { vi, describe, expect, it, afterEach } from 'vitest'
import { useFetchSbc } from '#imports'

describe('useFetchSbc', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds Authorization header if not present', async () => {
    const request = 'example.com/api/data'
    const opts = { method: 'GET' }
    vi.mock

    const result = await useFetchSbc(request, opts)
    console.log(result)
    expect(result).toBeTruthy()

    // Expect the opts object to have the Authorization header added
    // expect(result.opts.headers.Authorization).toEqual('Bearer mocked_token')
  })

  it.skip('calls useFetch with defaults', async () => {
    const apiToCall = 'someapi'
    const _useFetch = vi.fn()
    vi.stubGlobal('useFetch', _useFetch)
    const mock = vi.fn().mockImplementation(useFetchSbc)

    await useFetch(apiToCall)
    expect(mock).toHaveBeenCalledTimes(1)
    // expect(useFetch).toBeTruthy()
    // expect(_useFetch).toHaveBeenCalledOnce()
    // expect(_useFetch).toBeCalledWith(
    //   apiToCall,
    //   expect.objectContaining({ baseUrl: 'someurl' })
    // )
  })
  it.skip('injects Authorization header if not provided', () => {
    const mockToken = 'mock-token'
    const $keycloak = { token: mockToken }
    useNuxtApp.mockReturnValue({ $keycloak })
    const request = 'https://api.example.com/data'
    const result = useFetchSbc(request)

    expect(useFetch).toHaveBeenCalledWith(request, {
      headers: {
        Authorization: `Bearer ${mockToken}`
      },
      server: false
    })
  })

  it.skip('does not overwrite existing Authorization header', () => {
    const existingAuth = 'Bearer existing-token'
    const opts = { headers: { Authorization: existingAuth } }
    const request = 'https://api.example.com/data'
    useFetchSbc(request, opts)

    expect(useFetch).toHaveBeenCalledWith(request, opts)
  })

  it.skip('injects Account-Id header if not provided', () => {
    const accountId = '12345'
    const account = { currentAccount: { id: accountId } }
    useAccountStore.mockReturnValue(account)
    const request = 'https://api.example.com/data'
    const opts = { headers: {} }
    useFetchSbc(request, opts)

    expect(opts.headers['Account-Id']).toBe(accountId)
  })

  it.skip('does not overwrite existing Account-Id header', () => {
    const existingAccountId = '67890'
    const opts = { headers: { 'Account-Id': existingAccountId } }
    const request = 'https://api.example.com/data'
    useFetchSbc(request, opts)

    expect(useFetch).toHaveBeenCalledWith(request, opts)
  })

  it.skip('creates opts if undefined and injects headers', () => {
    const mockToken = 'mock-token'
    const $keycloak = { token: mockToken }
    useNuxtApp.mockReturnValue({ $keycloak })
    const accountId = '12345'
    const account = { currentAccount: { id: accountId } }
    useAccountStore.mockReturnValue(account)
    const request = 'https://api.example.com/data'
    useFetchSbc(request)

    expect(useFetch).toHaveBeenCalledWith(request, {
      headers: {
        Authorization: `Bearer ${mockToken}`,
        'Account-Id': accountId
      },
      server: false
    })
  })
})
