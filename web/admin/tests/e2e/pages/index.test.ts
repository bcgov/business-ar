import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('home page', () => {
  // validate a11y after every test
  test.afterEach(async ({ page }) => {
    const a11yResults = await new AxeBuilder({ page })
      .exclude('#locale-select-dropdown') // headless ui dropdown fails the axe check
      .analyze()

    expect(a11yResults.violations).toEqual([])
  })

  test.describe('With valid nano id', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en-CA?nanoid=TIG9kz_ykKVo0FMQAH76o')
    })

    test.describe('page contents', () => {
      // every page should have these elements
      test('common', async ({ page }) => {
        const logo = page.getByAltText('Government of British Columbia Logo')
        const localeDropdown = page.getByTestId('locale-select-dropdown')
        const header = page.getByTestId('sbc-main-header')
        const footer = page.getByTestId('sbc-main-footer')
        const footerLinks = footer.locator('a')
        expect(logo).toBeTruthy()
        expect(header).toBeInViewport()
        expect(footer).toBeInViewport()
        expect(footer).toContainText('A BC Online Application')
        expect(footerLinks).toHaveCount(5)
        await expect(localeDropdown).toBeInViewport()
        await expect(localeDropdown).toBeEnabled()
      })

      // only homepage should have these elements
      test('specific', async ({ page }) => {
        const h1 = await page.textContent('h1')
        const busDetails = page.getByTestId('bus-details-card')
        const nuxtContent = page.getByTestId('content-data')
        const loginButton = page.getByRole('button', { name: 'Login with BC Services Card' })
        const expectedDetails = [
          'Business Name',
          'CLIMATE LAW CORPORATION',
          'Incorporation Number',
          'BC0814603',
          'Business Number',
          '123'
        ]

        expect(h1).toBe('File your BC Annual Report')
        expectedDetails.forEach((detail) => {
          expect(busDetails).toContainText(detail)
        })
        // this means the content wasnt rendered correctly
        expect(nuxtContent).not.toContainText('You should use slots with <ContentRenderer>')
        expect(nuxtContent).not.toBeEmpty()
        expect(loginButton).toBeEnabled()
      })
    })
  })

  test.describe('Without valid nano id', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en-CA?nanoid=TIG9kz_ykK')
    })

    test.describe('page contents', () => {
      // every page should have these elements
      test('common', async ({ page }) => {
        await page.waitForURL('**/missing-id')
        const logo = page.getByAltText('Government of British Columbia Logo')
        const localeDropdown = page.getByTestId('locale-select-dropdown')
        const header = page.getByTestId('sbc-main-header')
        const footer = page.getByTestId('sbc-main-footer')
        const footerLinks = footer.locator('a')
        expect(logo).toBeTruthy()
        expect(header).toBeInViewport()
        expect(footer).toBeInViewport()
        expect(footer).toContainText('A BC Online Application')
        expect(footerLinks).toHaveCount(5)
        await expect(localeDropdown).toBeInViewport()
        await expect(localeDropdown).toBeEnabled()
      })

      // shouldve been redirected to missing id page
      test('specific', async ({ page }) => {
        await page.waitForURL('**/missing-id')
        const h1 = await page.textContent('h1')
        const nuxtContent = page.getByTestId('content-data-missing-id')

        expect(h1).toBe('Authorization Required')
        // this means the content wasnt rendered correctly
        expect(nuxtContent).not.toContainText('You should use slots with <ContentRenderer>')
        expect(nuxtContent).not.toBeEmpty()
      })
    })
  })
})
