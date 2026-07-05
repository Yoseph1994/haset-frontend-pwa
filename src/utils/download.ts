/**
 * Trigger a browser download for an in-memory blob. Works on web and PWA; in
 * the Capacitor webview it opens the PDF in the in-app viewer. (A full native
 * "save to device" via @capacitor/filesystem can be layered on later.)
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
