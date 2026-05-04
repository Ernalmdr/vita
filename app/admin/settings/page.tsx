import { getPopupSettings, updatePopupSettings } from '@/app/actions/settings';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { SubmitButton } from './submit-button';

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
        
        <form action={updatePopupSettings} className="space-y-6">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <input 
              type="checkbox" 
              id="enabled" 
              name="enabled" 
              defaultChecked={popupSettings?.enabled}
              className="w-5 h-5 accent-congress-red"
            />
            <label htmlFor="enabled" className="font-medium text-gray-800 cursor-pointer">
              Enable Pop-up on Homepage
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block font-medium text-gray-700">
              Pop-up Title
            </label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              defaultValue={popupSettings?.title}
              required
              placeholder="e.g. Important Announcement"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-congress-red/30 focus:border-congress-red outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block font-medium text-gray-700">
              Pop-up Content (Text)
            </label>
            <textarea 
              id="content" 
              name="content" 
              defaultValue={popupSettings?.content}
              required
              rows={5}
              placeholder="Enter the notification details here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-congress-red/30 focus:border-congress-red outline-none transition-all resize-y"
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be displayed to all users visiting the homepage until they close it.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
