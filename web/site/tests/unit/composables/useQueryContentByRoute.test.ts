import { describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useQueryContentByRoute } from '~/composables/useQueryContentByRoute'

mockNuxtImport('useRoute', () => {
  return () => (
    {
      path: '/en-CA'
    }
  )
})

mockNuxtImport('useI18n', () => {
  return () => (
    {
      locale: 'en-CA'
    }
  )
})

// need to find out how to test queryContent() from nuxt content
describe.skip('useQueryContentByRoute', () => {
  it('queries the content file matching the current route and locale', async () => {
    const content = await useQueryContentByRoute()
    expect(content).toBeDefined()
  })
})
