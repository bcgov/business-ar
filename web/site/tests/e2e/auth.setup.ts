import { test as setup, expect } from '@playwright/test'
import dotenv from 'dotenv'
// load default env
// eslint-disable-next-line import/no-named-as-default-member
dotenv.config()
const authFile = 'tests/e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:3000/en-CA?nanoid=TIG9kz_ykKVo0FMQAH76o')
  await page.getByRole('button', { name: 'Login with BC Services Card' }).click()
  await page.getByLabel('Log in with Test with').click()
  await page.getByLabel('Email or username').click()
  await page.getByLabel('Email or username').fill(process.env.PLAYWRIGHT_TEST_USERNAME!)
  await page.getByLabel('Password').click()
  await page.getByLabel('Password').fill(process.env.PLAYWRIGHT_TEST_PASSWORD!)
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.reload() // keycloak redirect not working for some reason after login, refreshing the page works though
  expect(page.url()).toContain('accounts/choose-existing')

  const h1 = await page.textContent('h1')
  expect(h1).toBe('Existing Account Found')

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
