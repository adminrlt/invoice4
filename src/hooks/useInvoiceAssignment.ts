import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useInvoiceAssignment = (documentId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const assignInvoice = async (departmentId: string, employeeId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('invoice_assignments')
        .upsert({
          document_id: documentId,
          department_id: departmentId,
          employee_id: employeeId,
          status: 'pending',
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Invoice assigned successfully');
    } catch (error: any) {
      console.error('Assignment error:', error);
      toast.error('Failed to assign invoice');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignInvoice,
    isLoading
  };
};