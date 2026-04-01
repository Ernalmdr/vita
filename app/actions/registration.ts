'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendStatusEmail } from '@/utils/send-email'; // Eklediğimiz e-posta fonksiyonu

export async function updateRegistrationStatus(id: string, newStatus: string) {
  try {
    if (!['Approved', 'Rejected', 'Pending'].includes(newStatus)) {
      return { success: false, error: 'Invalid status' };
    }

    const supabase = await createClient();

    // 1. Veritabanında durumu güncelliyoruz ve
    // .select().single() sayesinde güncellenen kullanıcının verilerini (email, full_name vb.) çekiyoruz
    const { data, error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', id)
      .select('email, full_name') // Sadece ihtiyacımız olan alanları istiyoruz
      .single();

    if (error) {
      console.error('Status update error:', error);
      return { success: false, error: 'Failed to update status in database' };
    }

    // 2. Güncelleme başarılıysa ve kullanıcı verisi geldiyse ve Pending değilse e-postayı gönderiyoruz
    if (data && data.email && data.full_name && newStatus !== 'Pending') {
      try {
        await sendStatusEmail(data.email, data.full_name, newStatus);
      } catch (emailError) {
        // Mail gönderimi başarısız olsa bile veritabanı güncellendiği için 
        // işlemi tamamen iptal etmiyoruz, sadece logluyoruz.
        console.error('E-posta gönderme işleminde hata yaşandı:', emailError);
      }
    }

    // 3. Tabloyu yeniliyoruz (Admin paneline yansıması için)
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating registration status:', error);
    return { success: false, error: 'Failed to update status in database' };
  }
}

export async function deleteRegistration(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('Error deleting registration:', err);
    return { success: false, error: 'Failed to delete registration' };
  }
}