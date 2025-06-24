'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

export default function PdfViewerComponent({ pdfUrl }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfUrl) return;

    let active = true;
    let pdfBlobUrl = null;

    const fetchPDF = async () => {
      try {
        const res = await fetch(pdfUrl);
        if (!res.ok) throw new Error('Failed to fetch PDF');
        const blob = await res.blob();
        pdfBlobUrl = URL.createObjectURL(blob);
        if (active) setBlobUrl(pdfBlobUrl);
      } catch (err) {
        console.error(err);
        setError('Error loading PDF');
      }
    };

    fetchPDF();

    return () => {
      active = false;
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfUrl]);

  if (!pdfUrl) return <div>No PDF URL</div>;
  if (error) return <div className="text-red-600">❌ {error}</div>;
  if (!blobUrl) return <div>Loading preview...</div>;

  return (
    <div className="w-full h-auto overflow-hidden bg-white p-2 rounded shadow-sm">
      <Document
        key={blobUrl}
        file={blobUrl}
        onLoadError={(err) => {
          console.error('Load error:', err);
          setError('PDF failed to load');
        }}
      >
        <Page pageNumber={1} width={300} />
      </Document>
    </div>
  );
}
