'use client';

import { useState } from 'react';
import { Check, X, ExternalLink, Eye } from 'lucide-react';
import { updateRegistrationStatus } from '@/app/actions/registration';

type Registration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  receiptUrl: string;
  status: string;
  createdAt: Date;
};

export default function RegistrationTable({ initialData }: { initialData: Registration[] }) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const result = await updateRegistrationStatus(id, newStatus);
      if (result.success) {
        setData(data.map(item => item.id === id ? { ...item, status: newStatus } : item));
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">Approved</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50/50 text-gray-600 font-sans border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium">Contact</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 font-medium">Receipt</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-sans text-gray-700">
          {data.map((reg) => (
            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-semibold text-congress-dark">{reg.fullName}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{reg.id.substring(0, 8)}...</p>
              </td>
              <td className="px-6 py-4">
                <p>{reg.email}</p>
                <p className="text-gray-500 mt-0.5 text-xs">{reg.phone}</p>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(reg.status)}
              </td>
              <td className="px-6 py-4 text-gray-500">
                {new Date(reg.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </td>
              <td className="px-6 py-4">
                <a 
                  href={reg.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-congress-red hover:text-congress-gold font-medium transition-colors"
                >
                  <Eye size={16} />
                  <span>View</span>
                </a>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {reg.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(reg.id, 'Approved')}
                      disabled={loadingId === reg.id}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(reg.id, 'Rejected')}
                      disabled={loadingId === reg.id}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                {reg.status !== 'Pending' && (
                  <span className="text-gray-400 italic text-xs">Handled</span>
                )}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                No registrations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
