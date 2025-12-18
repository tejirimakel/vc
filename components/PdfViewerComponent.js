'use client'

import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

export default function PdfViewerComponent({ pdfUrl }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [error, setError] = useState(null)
  const [containerWidth, setContainerWidth] = useState(335)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const resize = () => setContainerWidth(containerRef.current.offsetWidth)
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    if (!pdfUrl) return

    let active = true
    let localBlobUrl = null

    const load = async () => {
      try {
        const proxiedUrl = `/api/pdf?url=${encodeURIComponent(pdfUrl)}`
        const res = await fetch(proxiedUrl)
        if (!res.ok) throw new Error('PDF fetch failed')

        const blob = await res.blob()
        localBlobUrl = URL.createObjectURL(blob)

        if (active) setBlobUrl(localBlobUrl)
      } catch (err) {
        console.error(err)
        setError('Unable to load PDF')
      }
    }

    load()

    return () => {
      active = false
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl)
    }
  }, [pdfUrl])

  if (!pdfUrl) return <p>No PDF available</p>
  if (error) return <p className="text-red-600">❌ {error}</p>
  if (!blobUrl) return <p>Loading PDF…</p>

  return (
    <div ref={containerRef} className="w-full bg-white p-2 rounded-lg shadow">
      <Document
        file={blobUrl}
        onLoadError={(err) => {
          console.error(err)
          setError('PDF render error')
        }}
      >
        <Page pageNumber={1} width={containerWidth} />
      </Document>
    </div>
  )
}
