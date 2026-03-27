'use client';

import { useState } from 'react';
import { Check, X, Eye, Globe, User } from 'lucide-react';
import { updateRegistrationStatus } from '@/app/actions/registration';

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  school?: string | null;
  personal_id?: string | null;
  birth_date?: string | null;
  origin?: string | null;
  role?: string | null;
  accommodation?: string | null;
  room_size?: number | null;
  roommate_id?: string | null;
  price?: number | null;
  currency?: string | null;
  country?: string | null;
  passport_photo_url?: string | null;
  receipt_url?: string | null;
  status: string;
  created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  specialist: 'Specialist',
  physician: 'Physician',
  med_student: 'Med Student',
};

const ACCOM_LABELS: Record<string, string> = {
  none: 'No accommodation',
  room1: '1-person room',
  room2: '2-person room',
  room3: '3-person room',
};

export default function RegistrationTable({ initialData }: { initialData: Registration[] }) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <th className="px-6 py-4 font-medium">Participant</th>
            <th className="px-6 py-4 font-medium">Type / Role</th>
            <th className="px-6 py-4 font-medium">Accommodation</th>
            <th className="px-6 py-4 font-medium">Fee</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-sans text-gray-700">
          {data.map((reg) => (
            <>
              <tr
                key={reg.id}
                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-congress-dark">{reg.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{reg.email}</p>
                  <p className="text-xs text-gray-400">{reg.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    {reg.origin === 'international' ? (
                      <Globe size={12} className="text-blue-500" />
                    ) : (
                      <User size={12} className="text-gray-500" />
                    )}
                    <span className={`text-xs font-semibold ${reg.origin === 'international' ? 'text-blue-600' : 'text-gray-600'}`}>
                      {reg.origin === 'international' ? 'International' : 'Local'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{ROLE_LABELS[reg.role ?? ''] ?? reg.role ?? '—'}</span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {ACCOM_LABELS[reg.accommodation ?? ''] ?? '—'}
                  {reg.room_size && reg.accommodation !== 'none' && (
                    <p className="text-gray-400">{reg.room_size}-person</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  {reg.price ? (
                    <span className="font-bold text-congress-dark">
                      {reg.currency === 'EUR' ? '€' : '₺'}{reg.price}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">{getStatusBadge(reg.status)}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                  {reg.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(reg.id, 'Approved')}
                        disabled={loadingId === reg.id}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                      >
                        <Check size={14} /><span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(reg.id, 'Rejected')}
                        disabled={loadingId === reg.id}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                      >
                        <X size={14} /><span>Reject</span>
                      </button>
                    </>
                  )}
                  {reg.status !== 'Pending' && (
                    <span className="text-gray-400 italic text-xs">Handled</span>
                  )}
                </td>
              </tr>

              {/* Expanded detail row */}
              {expandedId === reg.id && (
                <tr key={`${reg.id}-detail`} className="bg-gray-50 border-b border-gray-100">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div><span className="text-gray-400 block">School</span><span className="font-medium">{reg.school ?? '—'}</span></div>
                      <div><span className="text-gray-400 block">Personal ID</span><span className="font-medium font-mono">{reg.personal_id ?? '—'}</span></div>
                      <div><span className="text-gray-400 block">Date of Birth</span><span className="font-medium">{reg.birth_date ?? '—'}</span></div>
                      <div><span className="text-gray-400 block">Roommate ID</span><span className="font-medium font-mono">{reg.roommate_id ?? '—'}</span></div>
                      {reg.origin === 'international' && (
                        <>
                          <div><span className="text-gray-400 block">Country</span><span className="font-medium">{reg.country ?? '—'}</span></div>
                          <div><span className="text-gray-400 block">Passport Photo</span>
                            {reg.passport_photo_url
                              ? <a href={reg.passport_photo_url} target="_blank" rel="noopener noreferrer" className="text-congress-red hover:underline inline-flex items-center gap-1"><Eye size={12} /> View</a>
                              : <span className="font-medium">—</span>}
                          </div>
                        </>
                      )}
                      <div><span className="text-gray-400 block">Payment Receipt</span>
                        {reg.receipt_url
                          ? <a href={reg.receipt_url} target="_blank" rel="noopener noreferrer" className="text-congress-red hover:underline inline-flex items-center gap-1"><Eye size={12} /> View</a>
                          : <span className="font-medium text-amber-600">Not uploaded</span>}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                No registrations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
