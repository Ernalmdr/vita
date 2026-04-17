'use client';

import { useState } from 'react';
import { Eye, Globe, User, Search, Trash2 } from 'lucide-react';
import { updateRegistrationStatus, deleteRegistration } from '@/app/actions/registration';
import React from 'react';

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
  non_physician_role?: string | null;
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
  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [accomFilter, setAccomFilter] = useState('All');

  const filteredData = data.filter((reg) => {
    // Arama yaparken büyük/küçük harf duyarlılığını ortadan kaldırmak için hepsini küçük harfe çeviriyoruz
    const searchLower = searchTerm.toLowerCase();

    // İsim, e-posta, telefon, kimlik no veya okul içinde arama yapıyoruz
    const matchesSearch = 
      reg.full_name?.toLowerCase().includes(searchLower) ||
      reg.email?.toLowerCase().includes(searchLower) ||
      reg.phone?.toLowerCase().includes(searchLower) ||
      reg.personal_id?.toLowerCase().includes(searchLower) ||
      reg.school?.toLowerCase().includes(searchLower);

    // Filtreleri uyguluyoruz
    const matchesStatus = statusFilter === 'All' || reg.status === statusFilter;
    const matchesRole = roleFilter === 'All' || reg.role === roleFilter;
    const matchesAccom = accomFilter === 'All' || reg.accommodation === accomFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesAccom;
  });

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

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    setLoadingId(id);
    try {
      const result = await deleteRegistration(id);
      if (result.success) {
        setData(data.filter(item => item.id !== id));
      } else {
        alert(result.error || 'Silme işlemi başarısız oldu');
      }
    } catch (error) {
      console.error(error);
      alert('Silme sırasında bir hata oluştu');
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
    <div className="space-y-4">
      {/* Arama Kutusu ve Filtreler (Search & Filters) */}
      <div className="px-6 pt-4 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="İsim, e-posta, telefon, TC/Pasaport No veya okul ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-congress-dark focus:border-congress-dark sm:text-sm transition-colors"
          />
        </div>

        {/* Dropdown Filtreler */}
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-congress-dark text-gray-700 font-medium cursor-pointer"
          >
            <option value="All">Tüm Durumlar</option>
            <option value="Pending">Bekliyor</option>
            <option value="Approved">Onaylandı</option>
            <option value="Rejected">Reddedildi</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-congress-dark text-gray-700 font-medium cursor-pointer"
          >
            <option value="All">Tüm Roller</option>
            <option value="specialist">Specialist</option>
            <option value="physician">Physician</option>
            <option value="med_student">Med Student</option>
          </select>

          <select
            value={accomFilter}
            onChange={(e) => setAccomFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-congress-dark text-gray-700 font-medium cursor-pointer"
          >
            <option value="All">Tüm Seçimler</option>
            <option value="none">Konaklamasız</option>
            <option value="room1">1 Kişilik Oda</option>
            <option value="room2">2 Kişilik Oda</option>
            <option value="room3">3 Kişilik Oda</option>
          </select>
        </div>
      </div>

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
            {/* ÖNEMLİ: data.map yerine filteredData.map kullanıyoruz */}
            {filteredData.map((reg) => (
              <React.Fragment key={reg.id}>
                <tr
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
                    <div className="inline-flex items-center gap-2">
                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusUpdate(reg.id, e.target.value)}
                        disabled={loadingId === reg.id}
                        className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-congress-dark cursor-pointer font-medium text-gray-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      
                      <button
                        onClick={() => handleDelete(reg.id)}
                        disabled={loadingId === reg.id}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                        <div><span className="text-gray-400 block">Non-Physician Role</span><span className="font-medium">{reg.non_physician_role ?? '—'}</span></div>
                        <div>
                          <span className="text-gray-400 block">Roommate ID</span>
                          {/* Oda arkadaşı verisi yine TÜM data içinden aranıyor, böylece arama yapılsa bile eşleşme bozulmuyor */}
                          {reg.roommate_id ? (
                            <span className="block mt-1">
                              <span className="font-medium font-mono block mb-1">{reg.roommate_id}</span>
                              {data.find(r => r.personal_id === reg.roommate_id)?.full_name ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const roommate = data.find(r => r.personal_id === reg.roommate_id);
                                    if (roommate) {
                                      setExpandedId(roommate.id);
                                      // Optional: Add a smooth scroll effect to the expanded row if needed,
                                      // but normally React will just re-render and expand it anyway.
                                    }
                                  }}
                                  className="text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline text-left cursor-pointer focus:outline-none"
                                >
                                  <User size={12} />
                                  {data.find(r => r.personal_id === reg.roommate_id)?.full_name}
                                </button>
                              ) : (
                                <span className="text-amber-600 font-medium italic">
                                  (Sisteme henüz kayıtlı değil)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="font-medium font-mono">—</span>
                          )}
                        </div>
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
              </React.Fragment>
            ))}

            {/* ÖNEMLİ: data.length yerine filteredData.length kullanıyoruz */}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'Arama kriterlerinize uygun kayıt bulunamadı.' : 'No registrations found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}