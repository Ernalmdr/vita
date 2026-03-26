'use server';

import { revalidatePath } from 'next/cache';

// In a real application, you would import prisma here to execute actual DB operations
// import prisma from '@/lib/prisma';

export async function updateRegistrationStatus(id: string, newStatus: string) {
  try {
    // Basic validation
    if (!['Approved', 'Rejected'].includes(newStatus)) {
      return { success: false, error: 'Invalid status' };
    }

    // --- Example Prisma Update ---
    /*
    await prisma.registration.update({
      where: { id },
      data: { status: newStatus }
    });
    */

    // Simulate database interaction network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Revalidate the admin dashboard so fresh data is loaded on the next page view
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error updating registration status:', error);
    return { success: false, error: 'Failed to update status in database' };
  }
}
