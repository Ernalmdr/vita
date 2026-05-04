'use client';

import { useActionState, useEffect } from 'react';
import { updatePopupSettings } from '@/app/actions/settings';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { SubmitButton } from './submit-button';

interface PopupSettings {
  enabled: boolean;
  title: string;
  content: string;
}

export function SettingsForm({ initialSettings }: { initialSettings: PopupSettings }) {
  const [state, formAction] = useActionState(updatePopupSettings, { success: false, error: null });

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Kaydedilemedi (Not Saved)</h4>
            <p className="text-sm">{state.error}</p>
            <p className="text-xs mt-1 text-red-600">
              Not: Eğer 'relation "settings" does not exist' hatası alıyorsanız, lütfen Supabase SQL Editor'den settings tablosunu oluşturduğunuzdan emin olun.
            </p>
          </div>
        </div>
      )}
      
      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle className="shrink-0" size={20} />
          <p className="font-medium">Ayarlar başarıyla kaydedildi! (Settings saved successfully!)</p>
        </div>
      )}

      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <input 
          type="checkbox" 
          id="enabled" 
          name="enabled" 
          defaultChecked={initialSettings?.enabled}
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
          defaultValue={initialSettings?.title}
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
          defaultValue={initialSettings?.content}
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
  );
}
