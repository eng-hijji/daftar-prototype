'use client'
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return

    void (async () => {
      const response = await fetch('/precache-manifest.json', { cache: 'no-store' })
      if (!response.ok) throw new Error(`Offline asset manifest request failed: ${response.status}`)

      const manifest: { buildId?: string } = await response.json()
      if (!manifest.buildId) throw new Error('Offline asset manifest has no build ID.')

      const workerUrl = `/sw.js?build=${encodeURIComponent(manifest.buildId)}`
      await navigator.serviceWorker.register(workerUrl)
    })().catch((error: unknown) => {
      console.error('Service worker registration failed:', error)
    })
  }, [])
  return null
}
