import { describe, expect, it, beforeEach } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useAccountStore } from '#imports'
import { mockedOrgs, mockNewAccount } from '~/tests/mocks/mockedData'

registerEndpoint('/user/accounts', {
  method: 'GET',
  handler: () => (
    mockedOrgs
  )
})

registerEndpoint('/accounts', {
  method: 'GET',
  handler: () => (
    mockedOrgs
  )
})

registerEndpoint('/user/accounts', {
  method: 'POST',
  handler: () => (mockNewAccount)
})

describe('Account Store Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inits the store with empty values', () => {
    const accountStore = useAccountStore()

    expect(accountStore.currentAccount).toEqual({})
    expect(accountStore.userAccounts).toEqual([])
  })

  it('fetches and assigns userAccounts', async () => {
    const accountStore = useAccountStore()
    // get user accounts
    const accounts = await accountStore.getUserAccounts()

    // assert
    expect(accounts?.orgs.length).toEqual(3)
    // assigns user accounts in the onResponse of the getUserAccounts
    expect(accountStore.userAccounts.length).toEqual(3)
  })

  it('can set the current account value', () => {
    const accountStore = useAccountStore()
    // assign user accounts
    accountStore.userAccounts = mockedOrgs.orgs

    // set current account
    accountStore.selectUserAccount(1)
    expect(accountStore.currentAccount.name).toEqual('Name1')
    accountStore.selectUserAccount(2)
    expect(accountStore.currentAccount.name).toEqual('Name2')
  })

  it('can create and set the current account', async () => {
    const accountStore = useAccountStore()
    const newAccount = {
      accountName: 'Mock New Account',
      contact: {
        phone: '1234567890',
        email: 'test@email.com',
        phoneExt: undefined
      }
    }

    // create new account, it assigns the store current account to returned new account in the response
    await accountStore.createNewAccount(newAccount)
    expect(accountStore.currentAccount.name).toEqual(mockNewAccount.name)
  })

  // skipping for now cause this doesnt change any store values
  it.skip('can check if an account name is already taken', async () => {
    const accountStore = useAccountStore()

    await accountStore.checkAccountExists('some name')
  })

  describe.skip('findAvailableAccountName', () => {
    it('should return a string with the given username and an increment of 10 when no orgs exist with that name', async () => {
    })
  })
})
