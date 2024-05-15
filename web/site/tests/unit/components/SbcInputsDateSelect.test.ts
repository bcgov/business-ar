import { vi, describe, expect, it } from 'vitest'
import { renderSuspended, mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { SbcInputsDateSelect } from '#components'
import { enI18n } from '~/tests/mocks/i18n'
import { dateToString } from '#imports'

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

describe('<SbcInputsDateSelect />', () => {
  it('mounts', async () => {
    const component = await renderSuspended(SbcInputsDateSelect, {
      global: {
        plugins: [enI18n]
      }
    })

    expect(component).toBeTruthy()
  })

  it('renders correctly with initial date, open datepicker and emits selection event', async () => {
    const initialDate = new Date('2022-04-26')
    const component = await mountSuspended(SbcInputsDateSelect, {
      props: { initialDate }
    })

    expect(component.find('[data-cy="date-select"]').exists()).toBe(true)
    expect(component.findComponent({ ref: 'dateSelectPickerRef' }).exists()).toBe(false)

    // Test if initial date is displayed correctly
    expect(component.find('input').element.value).toBe(dateToString(initialDate, 'YYYY-MM-DD'))

    // datepicker should open when clicking the input
    await component.find('input').trigger('click')
    expect(component.html()).toContain('data-testid="date-picker"')

    // expect(component.html()).toMatchInlineSnapshot('div')
    // should emit a selected date when clicking on the datepicker
    await component.find('div[id=2022-04-10]').trigger('click')
    expect(component.emitted()).toHaveProperty('selection')

    // test date input was updated correctly
    expect(component.find('input').element.value).toBe(dateToString(new Date('2022-04-11'), 'YYYY-MM-DD'))
  })
})
