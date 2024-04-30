export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl + '/user/accounts'
  return await $fetch(apiUrl, {
    method: 'POST',
    body: body.data,
    headers: {
      Authorization: `Bearer ${body.token}`
    }
  })
})
