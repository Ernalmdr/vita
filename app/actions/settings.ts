'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPopupSettings() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'homepage_popup')
    .single();

  if (error || !data) {
    return {
      enabled: false,
      title: 'Önemli Duyuru / Important Notice',
      content: 'Buraya duyuru metni gelecek / Announcement text goes here',
    };
  }

  return data.value;
}

export async function updatePopupSettings(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    
    const enabled = formData.get('enabled') === 'on';
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    const popupData = {
      enabled,
      title,
      content,
    };

    const { error } = await supabase
      .from('settings')
      .upsert({ 
        key: 'homepage_popup', 
        value: popupData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.error('Error updating popup settings:', error);
      return { success: false, error: 'Veritabanı hatası: ' + error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/settings');
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Beklenmeyen bir hata oluştu: ' + error.message };
  }
}
