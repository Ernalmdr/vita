import RegistrationTable from '@/components/admin/registration-table';
import { FileText, CheckCircle, Clock } from 'lucide-react';

// Mock data to simulate Prisma fetch
// In a real application, you would fetch from DB:
// import prisma from '@/lib/prisma';
// const registrations = await prisma.registration.findMany({ orderBy: { createdAt: 'desc' } });
const mockRegistrations = [
  {
    id: '1',
    fullName: 'Dr. John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    receiptUrl: 'https://example.com/receipt1.pdf',
    status: 'Pending',
    createdAt: new Date('2026-03-25T10:00:00Z'),
  },
  {
    id: '2',
    fullName: 'Dr. Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 987 654 321',
    receiptUrl: 'https://example.com/receipt2.pdf',
    status: 'Approved',
    createdAt: new Date('2026-03-24T14:30:00Z'),
  },
  {
    id: '3',
    fullName: 'Prof. Michael Brown',
    email: 'mbrown@university.edu',
    phone: '+44 123 456 789',
    receiptUrl: 'https://example.com/receipt3.pdf',
    status: 'Rejected',
    createdAt: new Date('2026-03-23T09:15:00Z'),
  }
];

export default async function AdminDashboard() {
  // Mocking the database fetch
  const registrations = mockRegistrations;
  
  const total = registrations.length;
  const pending = registrations.filter(r => r.status === 'Pending').length;
  const approved = registrations.filter(r => r.status === 'Approved').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-congress-dark">Dashboard Overview</h2>
        <p className="text-gray-500 mt-2 font-sans">Manage participants and verify payment receipts.</p>
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
          <h3 className="font-serif text-xl font-bold text-congress-dark">Recent Registrations</h3>
        </div>
        <div className="p-0">
          <RegistrationTable initialData={registrations} />
        </div>
      </div>
    </div>
  );
}
