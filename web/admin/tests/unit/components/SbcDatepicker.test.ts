import { vi, describe, expect, it } from 'vitest'
import { renderSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
// import { fireEvent, screen } from '@testing-library/vue'
import { SbcDatePicker } from '#components'
import { enI18n } from '~/tests/mocks/i18n'

const setLocaleMock = vi.fn()

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
        },
        {
          name: 'French',
          code: 'fr-CA',
          iso: 'fr-CA',
          dir: 'ltr',
          file: 'fr-CA.ts'
        }
      ]),
      t: (key: string) => key,
      setLocale: setLocaleMock
    }
  )
})

describe('<SbcDatePicker/>', () => {
  it('mounts', async () => {
    const component = await renderSuspended(SbcDatePicker, {
      global: {
        plugins: [enI18n]
      }
    })

    expect(component).toBeTruthy()
  })
})
