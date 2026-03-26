'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitRegistration(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const receiptUrl = formData.get('receiptUrl') as string;

    if (!fullName || !email || !phone || !receiptUrl) {
      return { success: false, error: 'Lütfen tüm alanları doldurun ve dekont yükleyin.' };
    }

    // Insert record into database
    const { error: insertError } = await supabase
      .from('registrations')
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone,
          receipt_url: receiptUrl,
          status: 'Pending'
        }
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return { success: false, error: 'Kayıt veritabanına eklenirken bir hata oluştu.' };
    }

    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Registration submission error:', error);
    return { success: false, error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' };
  }
}
