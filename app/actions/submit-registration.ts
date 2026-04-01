'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitRegistration(formData: FormData) {
  try {
    const supabase = await createClient();

    // Core identity
    const fullName        = formData.get('fullName') as string;
    const email           = formData.get('email') as string;
    const phone           = formData.get('phone') as string;
    const school          = formData.get('school') as string;
    const personalId      = formData.get('personalId') as string;
    const birthDate       = formData.get('birthDate') as string;

    // Registration type
    const origin          = formData.get('origin') as string;        // 'local' | 'international'
    const role            = formData.get('role') as string;          // 'specialist' | 'physician' | 'med_student'
    const accommodation   = formData.get('accommodation') as string; // 'none' | 'room1' | 'room2' | 'room3'
    const roomSize        = formData.get('roomSize') as string;
    const roommateId      = formData.get('roommateId') as string;

    // Pricing
    const price           = formData.get('price') as string;
    const currency        = formData.get('currency') as string;

    // International-only
    const passportPhotoUrl = formData.get('passportPhotoUrl') as string;
    const passportNumber   = formData.get('passportNumber') as string;
    const country          = formData.get('country') as string;

    // Payment receipt
    const receiptUrl       = formData.get('receiptUrl') as string;

    // Basic validation
    if (!fullName || !email || !phone || !origin || !role) {
      return { success: false, error: origin === 'local'
        ? 'Lütfen tüm zorunlu alanları doldurun.'
        : 'Please fill in all required fields.' };
    }

    const { error: insertError } = await supabase
      .from('registrations')
      .insert([{
        full_name:          fullName,
        email:              email,
        phone:              phone,
        school:             school,
        personal_id:        personalId,
        birth_date:         birthDate || null,
        origin:             origin,
        role:               role,
        accommodation:      accommodation,
        room_size:          roomSize ? parseInt(roomSize) : null,
        roommate_id:        roommateId || null,
        price:              price ? parseFloat(price) : null,
        currency:           currency,
        passport_photo_url: passportPhotoUrl || null,
        passport_number:    passportNumber || null,
        country:            country || null,
        receipt_url:        receiptUrl || null,
        status:             'Pending',
      }]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return { success: false, error: origin === 'local'
        ? 'Kayıt veritabanına eklenirken bir hata oluştu.'
        : 'A database error occurred. Please try again.' };
    }

    // revalidatePath('/admin') removed to avoid unintentional router cache wiping on the client.
    return { success: true };

  } catch (error) {
    console.error('Registration submission error:', error);
    return { success: false, error: 'Server error. Please try again later.' };
  }
}
