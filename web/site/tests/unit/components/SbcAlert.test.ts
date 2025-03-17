import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { SbcAlert } from '#components'
import { AlertCategory } from '#imports'
import en from '~/locales/en-CA'

// All vi.mock calls need to be at the top, before any imports
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

vi.mock('~/composables/useBarApi', () => ({
  useBarApi: vi.fn().mockResolvedValue({})
}))

vi.mock('~/stores/tos', () => ({
  useTosStore: () => ({
    getTermsOfUse: vi.fn().mockResolvedValue({
      isTermsOfUseAccepted: true,
      termsOfUseCurrentVersion: '1'
    })
  })
}))

const pinia = createTestingPinia()

vi.mock('~/stores/alert.ts', async (originalImport) => {
  const mod = await originalImport() as any
  return {
    ...mod,
    useAlertStore: () => {
      return mod.useAlertStore(pinia)
    }
  }
})

describe('<SbcAlert />', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('mounts', async () => {
    const component = await renderSuspended(SbcAlert, {
      props: {
        showOnCategory: [AlertCategory.CREATE_ACCOUNT]
      }
    })
    expect(component).toBeTruthy()
  })

  it('renders the first alert from the array of alerts', async () => {
    useAlertStore().alerts = [
      { severity: 'error', category: AlertCategory.CREATE_ACCOUNT },
      { severity: 'error', category: AlertCategory.INACTIVE_CORP_STATE },
      { severity: 'error', category: AlertCategory.AR_SUBMIT_ERROR }
    ]
    await renderSuspended(SbcAlert, {
      props: {
        showOnCategory: [AlertCategory.CREATE_ACCOUNT, AlertCategory.INACTIVE_CORP_STATE, AlertCategory.AR_SUBMIT_ERROR]
      }
    })
    const alerts = screen.queryAllByTestId('sbc-alert')
    expect(alerts.length).toBe(1)
  })

  it('will only render matching category from props', async () => {
    useAlertStore().alerts = [
      { severity: 'error', category: AlertCategory.CREATE_ACCOUNT },
      { severity: 'error', category: AlertCategory.INACTIVE_CORP_STATE },
      { severity: 'error', category: AlertCategory.AR_SUBMIT_ERROR }
    ]
    await renderSuspended(SbcAlert, {
      props: {
        showOnCategory: [AlertCategory.INTERNAL_SERVER_ERROR]
      }
    })
    const alerts = screen.queryAllByTestId('sbc-alert')
    expect(alerts.length).toBe(0)
  })

  it('will render internal server error even if its not the first found alert', async () => {
    useAlertStore().alerts = [
      { severity: 'error', category: AlertCategory.CREATE_ACCOUNT },
      { severity: 'error', category: AlertCategory.INACTIVE_CORP_STATE },
      { severity: 'error', category: AlertCategory.AR_SUBMIT_ERROR },
      { severity: 'error', category: AlertCategory.INTERNAL_SERVER_ERROR }
    ]
    await renderSuspended(SbcAlert, {
      props: {
        showOnCategory: [AlertCategory.CREATE_ACCOUNT, AlertCategory.INACTIVE_CORP_STATE, AlertCategory.AR_SUBMIT_ERROR, AlertCategory.INTERNAL_SERVER_ERROR]
      }
    })
    const alerts = screen.queryAllByTestId('sbc-alert')
    expect(alerts.length).toBe(1)
  })

  it('will render text matching alert category in locales file', async () => {
    useAlertStore().alerts = [
      { severity: 'error', category: AlertCategory.CREATE_ACCOUNT },
      { severity: 'error', category: AlertCategory.INACTIVE_CORP_STATE },
      { severity: 'error', category: AlertCategory.AR_SUBMIT_ERROR },
      { severity: 'error', category: AlertCategory.INTERNAL_SERVER_ERROR }
    ]
    await renderSuspended(SbcAlert, {
      props: {
        showOnCategory: [AlertCategory.CREATE_ACCOUNT, AlertCategory.INACTIVE_CORP_STATE, AlertCategory.AR_SUBMIT_ERROR, AlertCategory.INTERNAL_SERVER_ERROR]
      }
    })
    const alert = screen.getByTestId('sbc-alert')
    // @ts-ignore // ignore description.loc.source
    expect(alert.innerHTML).toContain(en.alerts['internal-server-error'].description.loc.source)
  })
})
