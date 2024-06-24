export async function handleDocumentDownload (file: { name: string, url: string }, identifier: string) {
  const { $keycloak } = useNuxtApp()
  const alertStore = useAlertStore()
  let blobUrl: string | undefined
  let tempAnchor: HTMLAnchorElement | undefined
  try {
    let filename: string
    const year = new Date().getFullYear()
    if (file.name === 'Receipt') {
      filename = `BC_Annual_Report_${identifier}_${year}_Receipt.pdf`
    } else {
      filename = `BC_Annual_Report_${identifier}_${year}.pdf`
    }

    const response = await $fetch(file.url, { responseType: 'blob', headers: { Authorization: `Bearer ${$keycloak.token}` } })
    const blobObj = response as unknown as Blob
    blobUrl = window.URL.createObjectURL(blobObj)
    tempAnchor = document.createElement('a')
    // create temporary <a> tag with download url
    tempAnchor.style.display = 'none'
    tempAnchor.href = blobUrl
    tempAnchor.download = filename

    // Safari thinks _blank anchor are pop ups. We only want to set _blank
    // target if the browser does not support the HTML5 download attribute.
    // This allows you to download files in desktop safari if pop up blocking
    // is enabled.
    if (typeof tempAnchor.download === 'undefined') {
      tempAnchor.setAttribute('target', '_blank')
    }
    document.body.appendChild(tempAnchor)
    tempAnchor.click() // invoke download on temp anchor
  } catch {
    alertStore.addAlert({
      severity: 'error',
      category: AlertCategory.DOCUMENT_DOWNLOAD
    })
  } finally {
    setTimeout(() => {
      // cleanup blob url and temp anchor
      if (tempAnchor) {
        document.body.removeChild(tempAnchor)
      }
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl)
      }
    }, 200)
  }
}
