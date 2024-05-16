export const useLoadingStore = defineStore('bar-sbc-loading-store', () => {
  const pageLoading = ref<boolean>(false)

  function $reset () {
    pageLoading.value = false
  }

  return {
    pageLoading,
    $reset
  }
},
{ persist: true }
)
