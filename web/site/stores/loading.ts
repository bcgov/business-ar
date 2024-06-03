export const useLoadingStore = defineStore('bar-sbc-loading-store', () => {
  const pageLoading = ref<boolean>(true)

  function $reset () {
    pageLoading.value = true
  }

  return {
    pageLoading,
    $reset
  }
},
{ persist: true }
)
