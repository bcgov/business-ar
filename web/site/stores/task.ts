export const useTaskStore = defineStore('bar-sbc-tasks-store', () => {
  // config imports
  const { $keycloak } = useNuxtApp()
  const token = $keycloak?.token
  const config = useRuntimeConfig()
  const apiUrl = config.public.barApiUrl

  const busStore = useBusinessStore()

  // get signed in users accounts
  async function getTask () {
    try {
      // fetch accounts using token
      const response = await $fetch(`${apiUrl}/business/${busStore.businessNano.identifier}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        onResponseError ({ response }) {
        // console error a message form the api or a default message
          const errorMsg = response._data.message ?? 'Error retrieving business by nano id.'
          console.error(errorMsg)
        }
      })

      const taskValue = response.tasks[0].task
      const task = Object.getOwnPropertyNames(taskValue)[0]
      return { task, taskValue }
    } catch (e: any) {
      throw new Error(e)
    }
  }

  return {
    getTask
  }
},
{ persist: true } // persist store values in session storage
)
