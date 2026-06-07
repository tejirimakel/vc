import { pdfjs } from 'react-pdf';

let configured = false;

export function configurePdfWorker() {
  if (configured) return;
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
  configured = true;
}
