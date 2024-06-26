import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockedBusinessNano, mockedTodoTask, mockBusiness, mockedOrgs, mockedFilingTask } from '../../mocks/mockedData'
import lang from '../../../locales/en-CA'
import { CommonPageElements } from '../utils/testCommonPageElements'
import { dateToString, addOneYear } from '../../../utils/date'

test.describe('Home Page', () => {
  test.describe('Unauthenticated', () => {
    // validate a11y after every test
    test.afterEach(async ({ page }, testInfo) => {
      const a11yResults = await new AxeBuilder({ page })
        .exclude(['#locale-select-dropdown']) // headless ui dropdown fails the axe check
        .disableRules(['heading-order']) // disable heading order rule because the nuxt content card has an h3
        .analyze()
      expect(a11yResults.violations).toEqual([])

      // generate unique filename with describe block text
      const describeText = testInfo.titlePath.slice(1).map(title => title.toLowerCase().replace(/\s+/g, '-')).join('/')
      const filename = `test-results/${describeText}.png`
      await page.screenshot({ fullPage: true, path: filename })
    })
    test('Valid Nano ID', async ({ page }) => {
      await page.route('**/business/token/123', async (route) => { // mock 200 response with nanoid GET
        await route.fulfill({ json: mockedBusinessNano })
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page with mocked token response
      await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

      // assert common page elements
      const commonEls = new CommonPageElements(page)
      await commonEls.assertCommonPageElements()

      // assert h1 text
      const h1 = await page.textContent('h1')
      expect(h1?.trim()).toBe(lang.page.home.h1)
      expect(h1).toBeTruthy()

      // assert business details card
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).toBeVisible()
      const expectedDetails = [
        'Business Name',
        mockedBusinessNano.legalName,
        'Incorporation Number',
        mockedBusinessNano.identifier,
        'Business Number',
          `${mockedBusinessNano.taxId!.slice(0, 9)} ${mockedBusinessNano.taxId!.slice(9)}`
      ]
      expectedDetails.forEach((detail) => {
        expect(busDetails).toContainText(detail!)
      })

      // assert nuxt content correctly rendered
      const nuxtContentInitial = page.getByTestId('content-data-initial')
      expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
      expect(nuxtContentInitial).not.toBeEmpty()

      // assert login button
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).toBeEnabled()
      expect(loginButton).toBeVisible()
    })

    test('Invalid Nano ID', async ({ page }) => {
      await page.route('**/business/token/123', async (route) => {
        await route.fulfill({ status: 400 }) // mock 400 response with nanoid GET
      })
      await page.goto('/en-CA?nanoid=123') // navigate to home page
      await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

      // assert common page elements
      const commonEls = new CommonPageElements(page)
      await commonEls.assertCommonPageElements()

      // assert h1 text
      const h1 = await page.textContent('h1')
      expect(h1?.trim()).toBe(lang.page.home.h1)
      expect(h1).toBeTruthy()

      // assert business details card
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).not.toBeVisible()

      // assert nuxt content correctly rendered
      const nuxtContentInitial = page.getByTestId('content-data-initial')
      expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
      expect(nuxtContentInitial).not.toBeEmpty()

      // assert login button
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      const alert = page.getByTestId('sbc-alert')
      expect(alert).toBeVisible()
      expect(alert).toBeInViewport()
      expect(alert).toContainText(lang.alerts['invalid-token'].title)
      expect(alert).toContainText(lang.alerts['invalid-token'].description)
    })

    test('Missing Nano ID', async ({ page }) => {
      await page.goto('/en-CA?nanoid=') // navigate to home page with missing token
      await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

      // assert common page elements
      const commonEls = new CommonPageElements(page)
      await commonEls.assertCommonPageElements()

      // assert h1 text
      const h1 = await page.textContent('h1')
      expect(h1?.trim()).toBe(lang.page.home.h1)
      expect(h1).toBeTruthy()

      // assert business details card
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).not.toBeVisible()

      // assert nuxt content correctly rendered
      const nuxtContentInitial = page.getByTestId('content-data-initial')
      expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
      expect(nuxtContentInitial).not.toBeEmpty()

      // assert login button
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      const alert = page.getByTestId('sbc-alert')
      expect(alert).toBeVisible()
      expect(alert).toBeInViewport()
      expect(alert).toContainText(lang.alerts['missing-token'].title)
      expect(alert).toContainText(lang.alerts['missing-token'].description)
    })
  })

  test.describe('Authenticated', () => {
    test.use({ storageState: 'tests/e2e/.auth/user.json' }) // use auth.json auth state

    // test a11y and take screenshot after each test
    test.afterEach(async ({ page }, testInfo) => {
      // all authenticated pages should show the account options button
      const accountOptionsButton = page.getByRole('button', { name: lang.btn.accountOptions }).first()
      expect(accountOptionsButton).toBeTruthy()
      expect(accountOptionsButton).toBeEnabled()

      const a11yResults = await new AxeBuilder({ page })
        .exclude('#locale-select-dropdown') // headless ui dropdown fails the axe check
        .exclude('#account-options-dropdown')
        .disableRules(['heading-order']) // disable heading order rule because the nuxt content card has an h3
        .analyze()
      expect(a11yResults.violations).toEqual([])

      // generate unique filename with describe block text
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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert page url
        expect(page.url()).toContain('/accounts/choose-existing')
      })

      test('With No Accounts - should be redirected to accounts-create-new', async ({ page }) => {
        await page.route('**/user/accounts', async (route) => { // mock 200 response with accounts GET
          await route.fulfill({ json: [] })
        })
        await page.goto('/en-CA?nanoid=123') // navigate to home page with mocked responses

        await expect(page.getByText(lang.page.createAccount.h1, { exact: true })).toBeVisible() // wait for page to be rendered

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

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

      // assert common page elements
      const commonEls = new CommonPageElements(page)
      await commonEls.assertCommonPageElements()

      // assert h1 text
      const h1 = await page.textContent('h1')
      expect(h1?.trim()).toBe(lang.page.home.h1)
      expect(h1).toBeTruthy()

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).not.toBeVisible()

      // assert INITIAL nuxt content not rendered
      const nuxtContentInitial = page.getByTestId('content-data-initial')
      expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
      expect(nuxtContentInitial).not.toBeEmpty()
      expect(nuxtContentInitial).not.toBeVisible()

      // assert ERROR nuxt content correctly rendered
      const nuxtContentError = page.getByTestId('content-data-error')
      expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
      expect(nuxtContentError).not.toBeEmpty()
      expect(nuxtContentError).toBeVisible()

      // assert login button not visible
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      const alert = page.getByTestId('sbc-alert')
      expect(alert).toBeVisible()
      expect(alert).toBeInViewport()
      expect(alert).toContainText(lang.alerts['invalid-token'].title)
      expect(alert).toContainText(lang.alerts['invalid-token'].description)
    })

    test('Missing Nano ID', async ({ page }) => {
      await page.goto('/en-CA?nanoid=') // navigate to home page
      await expect(page.getByText(lang.page.home.h1, { exact: true })).toBeVisible() // wait for page to be rendered

      // assert common page elements
      const commonEls = new CommonPageElements(page)
      await commonEls.assertCommonPageElements()

      // assert h1 text
      const h1 = await page.textContent('h1')
      expect(h1?.trim()).toBe(lang.page.home.h1)
      expect(h1).toBeTruthy()

      // assert business details card not rendered
      const busDetails = page.getByTestId('bus-details-card')
      expect(busDetails).not.toBeVisible()

      // assert INITIAL nuxt content not rendered
      const nuxtContentInitial = page.getByTestId('content-data-initial')
      expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
      expect(nuxtContentInitial).not.toBeEmpty()
      expect(nuxtContentInitial).not.toBeVisible()

      // assert ERROR nuxt content correctly rendered
      const nuxtContentError = page.getByTestId('content-data-error')
      expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
      expect(nuxtContentError).not.toBeEmpty()
      expect(nuxtContentError).toBeVisible()

      // assert login button not rendered
      const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
      expect(loginButton).not.toBeVisible()

      // assert alert text
      const alert = page.getByTestId('sbc-alert')
      expect(alert).toBeVisible()
      expect(alert).toBeInViewport()
      expect(alert).toContainText(lang.alerts['business-details'].title) // TODO: update this once the alert is fixed
      expect(alert).toContainText(lang.alerts['business-details'].description)
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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert h1 text
        const h1 = await page.textContent('h1')
        expect(h1?.trim()).toBe(lang.page.annualReport.h1.replace('{year}', baseTask.business.nextARYear.toString()))
        expect(h1).toBeTruthy()

        // assert alert text
        const alert = page.getByTestId('sbc-alert')
        expect(alert).toBeVisible()
        await expect(alert).toBeInViewport({ timeout: 3000 })
        expect(alert).toContainText(lang.alerts['payment-error'].title)
        expect(alert).toContainText(lang.alerts['payment-error'].description)

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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert h1 text
        const h1 = await page.textContent('h1')
        expect(h1?.trim()).toBe(lang.page.home.h1)
        expect(h1).toBeTruthy()

        // assert business details card not rendered
        const busDetails = page.getByTestId('bus-details-card')
        expect(busDetails).toBeVisible()

        // assert INITIAL nuxt content not rendered
        const nuxtContentInitial = page.getByTestId('content-data-initial')
        expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentInitial).not.toBeEmpty()
        expect(nuxtContentInitial).not.toBeVisible()

        // assert ERROR nuxt content correctly rendered
        const nuxtContentError = page.getByTestId('content-data-error')
        expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentError).not.toBeEmpty()
        expect(nuxtContentError).not.toBeVisible()

        // assert login button not rendered
        const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
        expect(loginButton).not.toBeVisible()

        // assert alert text
        const alert = page.getByTestId('sbc-alert')
        expect(alert).toBeVisible()
        await expect(alert).toBeInViewport({ timeout: 3000 })
        expect(alert).toContainText(lang.alerts['filing-in-progress'].title)
        expect(alert).toContainText(lang.alerts['filing-in-progress'].description)
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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert h1 text
        const h1 = await page.textContent('h1')
        expect(h1?.trim()).toBe(lang.page.home.h1)
        expect(h1).toBeTruthy()

        // assert business details card not rendered
        const busDetails = page.getByTestId('bus-details-card')
        expect(busDetails).toBeVisible()

        // assert INITIAL nuxt content not rendered
        const nuxtContentInitial = page.getByTestId('content-data-initial')
        expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentInitial).not.toBeEmpty()
        expect(nuxtContentInitial).not.toBeVisible()

        // assert ERROR nuxt content correctly rendered
        const nuxtContentError = page.getByTestId('content-data-error')
        expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentError).not.toBeEmpty()
        expect(nuxtContentError).toBeVisible()

        // assert login button not rendered
        const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
        expect(loginButton).not.toBeVisible()

        // assert alert text
        const alert = page.getByTestId('sbc-alert')
        expect(alert).toBeVisible()
        await expect(alert).toBeInViewport({ timeout: 3000 })
        expect(alert).toContainText(lang.alerts['account-access'].title)
        expect(alert).toContainText(lang.alerts['account-access'].description)
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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert h1 text
        const h1 = await page.textContent('h1')
        expect(h1?.trim()).toBe(lang.page.home.h1)
        expect(h1).toBeTruthy()

        // assert business details card not rendered
        const busDetails = page.getByTestId('bus-details-card')
        expect(busDetails).not.toBeVisible()

        // assert INITIAL nuxt content not rendered
        const nuxtContentInitial = page.getByTestId('content-data-initial')
        expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentInitial).not.toBeEmpty()
        expect(nuxtContentInitial).not.toBeVisible()

        // assert ERROR nuxt content correctly rendered
        const nuxtContentError = page.getByTestId('content-data-error')
        expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentError).not.toBeEmpty()
        expect(nuxtContentError).toBeVisible()

        // assert login button not rendered
        const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
        expect(loginButton).not.toBeVisible()

        // assert alert text
        const alert = page.getByTestId('sbc-alert')
        expect(alert).toBeVisible()
        await expect(alert).toBeInViewport({ timeout: 3000 })
        expect(alert).toContainText(lang.alerts['inactive-corp-state'].title)
        expect(alert).toContainText(lang.alerts['inactive-corp-state'].description)
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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert h1 text
        const h1 = await page.textContent('h1')
        expect(h1?.trim()).toBe(lang.page.home.h1)
        expect(h1).toBeTruthy()

        // assert business details card not rendered
        const busDetails = page.getByTestId('bus-details-card')
        expect(busDetails).toBeVisible()

        // assert INITIAL nuxt content not rendered
        const nuxtContentInitial = page.getByTestId('content-data-initial')
        expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentInitial).not.toBeEmpty()
        expect(nuxtContentInitial).not.toBeVisible()

        // assert ERROR nuxt content correctly rendered
        const nuxtContentError = page.getByTestId('content-data-error')
        expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentError).not.toBeEmpty()
        expect(nuxtContentError).toBeVisible()

        // assert login button not rendered
        const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
        expect(loginButton).not.toBeVisible()

        // assert alert text
        const alert = page.getByTestId('sbc-alert')
        expect(alert).toBeVisible()
        await expect(alert).toBeInViewport({ timeout: 3000 })
        expect(alert).toContainText(lang.alerts['future-effective-filings'].title)
        expect(alert).toContainText(lang.alerts['future-effective-filings'].description)
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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert h1 text
        const h1 = await page.textContent('h1')
        expect(h1?.trim()).toBe(lang.page.home.h1)
        expect(h1).toBeTruthy()

        // assert business details card not rendered
        const busDetails = page.getByTestId('bus-details-card')
        expect(busDetails).toBeVisible()

        // assert INITIAL nuxt content not rendered
        const nuxtContentInitial = page.getByTestId('content-data-initial')
        expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentInitial).not.toBeEmpty()
        expect(nuxtContentInitial).not.toBeVisible()

        // assert ERROR nuxt content correctly rendered
        const nuxtContentError = page.getByTestId('content-data-error')
        expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentError).not.toBeEmpty()
        expect(nuxtContentError).toBeVisible()

        // assert login button not rendered
        const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
        expect(loginButton).not.toBeVisible()

        // assert alert text
        const alert = page.getByTestId('sbc-alert')
        expect(alert).toBeVisible()
        await expect(alert).toBeInViewport({ timeout: 3000 })
        expect(alert).toContainText(lang.alerts['invalid-next-ar-year'].title)
        expect(alert).toContainText(lang.alerts['invalid-next-ar-year'].description)
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

        // assert common page elements
        const commonEls = new CommonPageElements(page)
        await commonEls.assertCommonPageElements()

        // assert h1 text
        const h1 = await page.textContent('h1')
        expect(h1?.trim()).toBe(lang.page.home.h1)
        expect(h1).toBeTruthy()

        // assert business details card not rendered
        const busDetails = page.getByTestId('bus-details-card')
        expect(busDetails).toBeVisible()

        // assert INITIAL nuxt content not rendered
        const nuxtContentInitial = page.getByTestId('content-data-initial')
        expect(nuxtContentInitial).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentInitial).not.toBeEmpty()
        expect(nuxtContentInitial).not.toBeVisible()

        // assert ERROR nuxt content correctly rendered
        const nuxtContentError = page.getByTestId('content-data-error')
        expect(nuxtContentError).not.toContainText('You should use slots with <ContentRenderer>') // this means the content wasnt rendered correctly
        expect(nuxtContentError).not.toBeEmpty()
        expect(nuxtContentError).toBeVisible()

        // assert login button not rendered
        const loginButton = page.getByRole('button', { name: lang.btn.loginBCSC })
        expect(loginButton).not.toBeVisible()

        // assert alert text
        const alert = page.getByTestId('sbc-alert')
        expect(alert).toBeVisible()
        await expect(alert).toBeInViewport({ timeout: 3000 })
        expect(alert).toContainText(lang.alerts['future-filing'].title)
        expect(alert).toContainText(lang.alerts['future-filing'].description.replace('{date}', futureDate))
      })
    })
  })
})
