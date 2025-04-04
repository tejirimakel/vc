"use client";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function PdfViewerComponent({ pdfUrl }) {
  const defaultLayout = defaultLayoutPlugin();

  return (
    <div className="w-full h-[50vh] sm:h-[60vh] border rounded-2xl shadow-md">
      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} plugins={[defaultLayout]} />
      </Worker>
    </div>
  );
}
