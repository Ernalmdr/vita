import { getPopupSettings } from '@/app/actions/settings';
import { Settings, AlertCircle } from 'lucide-react';
import { SettingsForm } from './settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const popupSettings = await getPopupSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-bold text-congress-dark flex items-center gap-3">
          <Settings className="text-congress-red" size={32} />
          Site Settings
        </h2>
        <p className="text-gray-500 mt-2 font-sans">
          Manage homepage pop-ups and notifications here.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <AlertCircle className="text-congress-gold" size={24} />
          Homepage Pop-up Notification
        </h3>
        
        <SettingsForm initialSettings={popupSettings as any} />
      </div>
    </div>
  );
}
