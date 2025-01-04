import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight, UserPlus, FileSearch, ClipboardList, Loader } from 'lucide-react';
import { formatDate } from '../../../utils/date';
import { useFileAccess } from '../../../hooks/useFileAccess';
import { useInvoiceData } from '../../../hooks/useInvoiceData';
import { useInvoiceAssignment } from '../../../hooks/useInvoiceAssignment';
import { useWorkflowInfo } from '../../../hooks/useWorkflowInfo';
import { InvoiceDetails } from './InvoiceDetails';
import { ProcessingStatus } from './ProcessingStatus';
import { WorkflowDrawer } from './WorkflowDrawer';
import { PdfViewer } from '../../pdf/PdfViewer';
import { AssignmentModal } from './AssignmentModal';
import type { Invoice } from '../../../types';

interface InvoiceListItemProps {
  invoice: Invoice;
  caseNumber: string;
  documentId: string;
}

export const InvoiceListItem: React.FC<InvoiceListItemProps> = ({ 
  invoice, 
  caseNumber,
  documentId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showWorkflowDrawer, setShowWorkflowDrawer] = useState(false);
  
  const { openFile, getFileUrl, isLoading: isFileLoading } = useFileAccess();
  const { processInvoice, isLoading: isProcessing } = useInvoiceData(documentId, caseNumber);
  const { assignInvoice } = useInvoiceAssignment(documentId);
  const { workflowInfo, isLoading: isWorkflowLoading } = useWorkflowInfo(documentId);

  const handleOpenFile = async () => {
    try {
      const url = await getFileUrl(invoice.fileUrl);
      if (url) {
        setShowPdfViewer(true);
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleExtractData = async () => {
    await processInvoice(invoice.fileUrl, invoice.pageNumber);
  };

  const handleAssign = async (departmentId: string, employeeId: string) => {
    await assignInvoice(departmentId, employeeId);
    setShowAssignModal(false);
  };

  const handleWorkflowClick = () => {
    setShowWorkflowDrawer(true);
  };

  const getWorkflowButtonStyle = () => {
    if (isWorkflowLoading) return 'text-gray-400';
    return 'text-gray-400 hover:text-indigo-600';
  };

  return (
    <li className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
        <div 
          className="flex items-center flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          <div className="ml-3 text-left">
            <p className="text-sm font-medium text-gray-900">
              {invoice.invoiceNumber || `Page ${invoice.pageNumber}`}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ProcessingStatus 
            status={invoice.status || 'pending'} 
            errorMessage={invoice.error_message}
          />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleWorkflowClick}
              className={`p-1 ${getWorkflowButtonStyle()}`}
              title="View workflow"
              disabled={isWorkflowLoading}
            >
              {isWorkflowLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="p-1 text-gray-400 hover:text-indigo-600"
              title="Assign invoice"
            >
              <UserPlus className="h-4 w-4" />
            </button>
            <button
              onClick={handleExtractData}
              disabled={isProcessing}
              className={`p-1 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-600'}`}
              title="Extract invoice data"
            >
              <FileSearch className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenFile}
              disabled={isFileLoading}
              className={`p-1 ${isFileLoading ? 'opacity-50 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
              title="View PDF"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <InvoiceDetails {...invoice} />
        </div>
      )}

      {showPdfViewer && (
        <PdfViewer
          url={invoice.fileUrl}
          onClose={() => setShowPdfViewer(false)}
        />
      )}

      {showAssignModal && (
        <AssignmentModal
          invoiceId={documentId}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
        />
      )}

      {workflowInfo && showWorkflowDrawer && (
        <WorkflowDrawer
          isOpen={showWorkflowDrawer}
          onClose={() => setShowWorkflowDrawer(false)}
          workflowInfo={workflowInfo}
        />
      )}
    </li>
  );
};