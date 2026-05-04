'use client';

import { useFormStatus } from 'react-dom';
import { Save } from 'lucide-react';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-congress-red hover:bg-congress-dark text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving...
        </span>
      ) : (
        <>
          <Save size={20} />
          Save Settings
        </>
      )}
    </button>
  );
}
