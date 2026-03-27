import RegistrationTable from '@/components/admin/registration-table';
import { createClient } from '@/utils/supabase/server';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: registrations, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch registrations:', error);
  }

  const data = registrations ?? [];
  const total    = data.length;
  const pending  = data.filter(r => r.status === 'Pending').length;
  const approved = data.filter(r => r.status === 'Approved').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-congress-dark">Dashboard Overview</h2>
        <p className="text-gray-500 mt-2 font-sans">Manage participants and verify registrations.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Registrations</p>
            <p className="text-2xl font-bold text-congress-dark">{total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-congress-dark">{pending}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Approved</p>
            <p className="text-2xl font-bold text-congress-dark">{approved}</p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-serif text-xl font-bold text-congress-dark">Registrations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Click a row to expand full details</p>
          </div>
        </div>
        <div className="p-0">
          <RegistrationTable initialData={data} />
        </div>
      </div>
    </div>
  );
}
