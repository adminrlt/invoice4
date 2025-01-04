import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { useFileAccess } from '../../hooks/useFileAccess';

interface PdfViewerProps {
  url: string;
  onClose: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { getFileUrl } = useFileAccess();

  useEffect(() => {
    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fileUrl = await getFileUrl(url);
        if (!fileUrl) {
          throw new Error('Failed to get file URL');
        }
        setPdfUrl(fileUrl);
      } catch (err: any) {
        console.error('PDF viewer error:', err);
        setError(err.message || 'Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    };

    initViewer();
  }, [url, getFileUrl]);

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    try {
      // Get a fresh URL with download option
      const downloadUrl = await getFileUrl(url, { download: true });
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = url.split('/').pop() || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">PDF Preview</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Open in new tab"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-100 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 p-4">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-center">{error}</p>
            </div>
          )}

          {pdfUrl && !error && (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full rounded-b-lg"
              title="PDF Preview"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load PDF viewer');
                setIsLoading(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};