'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateRegistrationStatus(id: string, newStatus: string) {
  try {
    if (!['Approved', 'Rejected'].includes(newStatus)) {
      return { success: false, error: 'Invalid status' };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Status update error:', error);
      return { success: false, error: 'Failed to update status in database' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating registration status:', error);
    return { success: false, error: 'Failed to update status in database' };
  }
}
