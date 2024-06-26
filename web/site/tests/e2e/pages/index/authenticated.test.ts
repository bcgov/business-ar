import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockedBusinessNano, mockedTodoTask, mockBusiness, mockedOrgs, mockedFilingTask } from '../../../mocks/mockedData'
import lang from '../../../../locales/en-CA'
import { assertCommonElements, assertH1Text, assertNuxtContent, assertAlertText } from '../../helpers'
import { dateToString, addOneYear } from '../../../../utils/date'

test.describe('Authenticated', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' }) // use auth.json auth state

  test.afterEach(async ({ page }, testInfo) => {
    // all authenticated pages should show the account options button
    const accountOptionsButton = page.getByRole('button', { name: lang.btn.accountOptions }).first()
    expect(accountOptionsButton).toBeTruthy()
    expect(accountOptionsButton).toBeEnabled()

    // assert common page elements
    assertCommonElements(page)

    // validate a11y after every test
    const a11yResults = await new AxeBuilder({ page })
      .exclude('#locale-select-dropdown') // headless ui dropdown fails the axe check
      .exclude('#account-options-dropdown')
      .disableRules(['heading-order']) // disable heading order rule because the nuxt content card has an h3
      .analyze()
    expect(a11yResults.violations).toEqual([])

    // generate unique filename with describe block text and take screenshot after each test
    const describeText = testInfo.titlePath.slice(1).map(title => title.toLowerCase().replace(/\s+/g, '-')).join('/')
    const filename = `test-results/${describeText}.png`
    await page.screenshot({ fullPage: true, path: filename })
  })

  test.describe('Valid Nano ID', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/business/token/123', async (route) => { // mock 200 response with nanoid GET
        await route.fulfill({ json: mockedBusinessNano })
      })
      await page.route('**/business/*/tasks', async (route) => { // mock 200 response with business task GET
        await route.fulfill({ json: mockedTodoTask })
      })
      await page.route('**/business/*', async (route) => { // mock 200 response with business details GET
        await route.fulfill({ json: mockBusiness })
      })
    })

    test('With Accounts - should be redirected to accounts-choose-existing', async ({ page }) => {
      await page.route('**/user/accounts', async (route) => { // mock 200 response with accounts GET
        await route.fulfill({ json: mockedOrgs })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page with mocked responses

      await expect(page.getByText(lang.page.existingAccount.h1, { exact: true })).toBeVisible() // wait for page to be rendered

      // assert page url
      expect(page.url()).toContain('/accounts/choose-existing')
    })

    test('With No Accounts - should be redirected to accounts-create-new', async ({ page }) => {
      await page.route('**/user/accounts', async (route) => { // mock 200 response with accounts GET
        await route.fulfill({ json: [] })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page with mocked responses

      await expect(page.getByText(lang.page.createAccount.h1, { exact: true })).toBeVisible() // wait for page to be rendered

      // assert page url
      expect(page.url()).toContain('/accounts/create-new')
    })
  })

  test('Invalid Nano ID', async ({ page }) => {
    await page.route('**/business/token/123', async (route) => {
      await route.fulfill({ status: 400 }) // mock 400 response with nanoid GET
    })
    await page.goto('/en-CA?nanoid=123') // navigate to home page
    await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

    // assert h1 text
    await assertH1Text(page, lang.page.home.h1)

    // assert business details card not rendered
    const busDetails = page.getByTestId('bus-details-card')
    expect(busDetails).not.toBeVisible()

    // assert INITIAL nuxt content not rendered
    await assertNuxtContent(page, 'initial', false)

    // assert ERROR nuxt content correctly rendered
    await assertNuxtContent(page, 'error', true)

    // assert login button not visible
    const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
    expect(loginButton).not.toBeVisible()

    // assert alert text
    await assertAlertText(page, lang.alerts['invalid-token'].title, lang.alerts['invalid-token'].description)
  })

  test('Missing Nano ID', async ({ page }) => {
    await page.goto('/en-CA?nanoid=') // navigate to home page
    await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

    // assert h1 text
    await assertH1Text(page, lang.page.home.h1)

    // assert business details card not rendered
    const busDetails = page.getByTestId('bus-details-card')
    expect(busDetails).not.toBeVisible()

    // assert INITIAL nuxt content not rendered
    await assertNuxtContent(page, 'initial', false)

    // assert ERROR nuxt content correctly rendered
    await assertNuxtContent(page, 'error', true)

    // assert login button not rendered
    const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
    expect(loginButton).not.toBeVisible()

    // assert alert text
    await assertAlertText(page, lang.alerts['business-details'].title, lang.alerts['business-details'].description) // TODO: update this once the alert is fixed
  })

  test.describe('Business Has Active Filing', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/business/token/123', async (route) => { // mock 200 response with nanoid GET
        await route.fulfill({ json: mockedBusinessNano })
      })
      await page.route('**/business/*', async (route) => { // mock 200 response with business details GET
        await route.fulfill({ json: mockBusiness })
      })
    })

    test('Filing In Draft - should be redirected to annual-report', async ({ page }) => {
      const baseTask = mockedFilingTask.tasks[0].task.filing
      await page.route('**/business/*/tasks', async (route) => { // mock 200 response with business task GET
        await route.fulfill({
          json: {
            tasks: [{
              task: {
                filing: {
                  business: baseTask.business,
                  annualReport: baseTask.annualReport,
                  header: {
                    ...baseTask.header,
                    paymentAccount: 1,
                    status: 'PENDING'
                  }
                }
              }
            }]
          }
        })
      })
      await page.route('**/user/accounts', async (route) => { // mock 200 response with business task GET
        await route.fulfill({ json: mockedOrgs })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page
      await page.waitForURL('**/annual-report') // wait for redirect

      // assert alert text
      await assertAlertText(page, lang.alerts['payment-error'].title, lang.alerts['payment-error'].description)

      // assert page url
      expect(page.url()).toContain('/annual-report')
    })

    test('Filing In PAID Status', async ({ page }) => {
      const baseTask = mockedFilingTask.tasks[0].task.filing
      await page.route('**/business/*/tasks', async (route) => { // mock 200 response with business task GET
        await route.fulfill({
          json: {
            tasks: [{
              task: {
                filing: {
                  business: baseTask.business,
                  annualReport: baseTask.annualReport,
                  header: {
                    ...baseTask.header,
                    paymentAccount: 1,
                    status: 'PAID'
                  }
                }
              }
            }]
          }
        })
      })
      await page.route('**/user/accounts', async (route) => { // mock 200 response with business task GET
        await route.fulfill({ json: mockedOrgs })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page

      // assert h1 text
      await assertH1Text(page, lang.page.home.h1)

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).toBeVisible()

      // assert INITIAL nuxt content not rendered
      await assertNuxtContent(page, 'initial', false)

      // assert ERROR nuxt content not rendered
      await assertNuxtContent(page, 'error', false)

      // assert login button not rendered
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      await assertAlertText(page, lang.alerts['filing-in-progress'].title, lang.alerts['filing-in-progress'].description)
    })

    test('User Does not Own Account', async ({ page }) => {
      const baseTask = mockedFilingTask.tasks[0].task.filing
      await page.route('**/business/*/tasks', async (route) => { // mock 200 response with business task GET
        await route.fulfill({
          json: {
            tasks: [{
              task: {
                filing: {
                  business: baseTask.business,
                  annualReport: baseTask.annualReport,
                  header: {
                    ...baseTask.header,
                    paymentAccount: 999,
                    status: 'PAID'
                  }
                }
              }
            }]
          }
        })
      })
      await page.route('**/user/accounts', async (route) => { // mock 200 response with business task GET
        await route.fulfill({ json: mockedOrgs })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page

      // assert h1 text
      await assertH1Text(page, lang.page.home.h1)

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).toBeVisible()

      // assert INITIAL nuxt content not rendered
      await assertNuxtContent(page, 'initial', false)

      // assert ERROR nuxt content correctly rendered
      await assertNuxtContent(page, 'error', true)

      // assert login button not rendered
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      await assertAlertText(page, lang.alerts['account-access'].title, lang.alerts['account-access'].description)
    })
  })

  test.describe('Error or Alert States', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/business/token/123', async (route) => { // mock 200 response with nanoid GET
        await route.fulfill({ json: mockedBusinessNano })
      })
      await page.route('**/business/*/tasks', async (route) => { // mock 200 response with business task GET
        await route.fulfill({ json: mockedTodoTask })
      })
    })

    test('Business Has Inactive State', async ({ page }) => {
      await page.route('**/business/*', async (route) => { // mock 200 response with business details GET
        await route.fulfill({
          json: {
            ...mockBusiness,
            business: {
              ...mockBusiness.business,
              corpState: 'HIS'
            }
          }
        })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page

      // assert h1 text
      await assertH1Text(page, lang.page.home.h1)

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).not.toBeVisible()

      // assert INITIAL nuxt content not rendered
      await assertNuxtContent(page, 'initial', false)

      // assert ERROR nuxt content correctly rendered
      await assertNuxtContent(page, 'error', true)

      // assert login button not rendered
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      await assertAlertText(page, lang.alerts['inactive-corp-state'].title, lang.alerts['inactive-corp-state'].description)
    })

    test('Business Has Future Effective Filings', async ({ page }) => {
      await page.route('**/business/*', async (route) => { // mock 200 response with business details GET
        await route.fulfill({
          json: {
            ...mockBusiness,
            business: {
              ...mockBusiness.business,
              hasFutureEffectiveFilings: true
            }
          }
        })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page

      // assert h1 text
      await assertH1Text(page, lang.page.home.h1)

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).toBeVisible()

      // assert INITIAL nuxt content not rendered
      await assertNuxtContent(page, 'initial', false)

      // assert ERROR nuxt content correctly rendered
      await assertNuxtContent(page, 'error', true)

      // assert login button not rendered
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      await assertAlertText(page, lang.alerts['future-effective-filings'].title, lang.alerts['future-effective-filings'].description)
    })

    test('Business Has Invalid Next AR Year', async ({ page }) => {
      await page.route('**/business/*', async (route) => { // mock 200 response with business details GET
        await route.fulfill({
          json: {
            ...mockBusiness,
            business: {
              ...mockBusiness.business,
              nextARYear: -1
            }
          }
        })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page

      // assert h1 text
      await assertH1Text(page, lang.page.home.h1)

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).toBeVisible()

      // assert INITIAL nuxt content not rendered
      await assertNuxtContent(page, 'initial', false)

      // assert ERROR nuxt content correctly rendered
      await assertNuxtContent(page, 'error', true)

      // assert login button not rendered
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      await assertAlertText(page, lang.alerts['invalid-next-ar-year'].title, lang.alerts['invalid-next-ar-year'].description)
    })

    test('Business Next AR Date is in the Future', async ({ page }) => {
      const currentDate = new Date()
      const lastArDate = dateToString(currentDate, 'YYYY-MM-DD')
      const futureDate = addOneYear(lastArDate)

      await page.route('**/business/*', async (route) => { // mock 200 response with business details GET
        await route.fulfill({
          json: {
            ...mockBusiness,
            business: {
              ...mockBusiness.business,
              lastArDate
            }
          }
        })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page

      // assert h1 text
      await assertH1Text(page, lang.page.home.h1)

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).toBeVisible()

      // assert INITIAL nuxt content not rendered
      await assertNuxtContent(page, 'initial', false)

      // assert ERROR nuxt content correctly rendered
      await assertNuxtContent(page, 'error', true)

      // assert login button not rendered
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      await assertAlertText(page, lang.alerts['future-filing'].title, lang.alerts['future-filing'].description.replace('{date}', futureDate))
    })
  })
})
