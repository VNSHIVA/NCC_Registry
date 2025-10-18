'use server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, query, where, getDocs, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// This is a simplified validation. In a real-world scenario, you'd use a library like Zod.
const validateCadetData = (cadet: any) => {
    return cadet.regNo && cadet.name && cadet.batch;
};

export async function importCadets(cadets: any[], institutionName: string) {
    if (!Array.isArray(cadets) || cadets.length === 0) {
        return { success: false, error: 'No cadet data provided.' };
    }

    const cadetsCollection = collection(db, 'cadets');
    const batch = writeBatch(db);
    let importedCount = 0;

    // Fetch existing cadets for this institution to check for updates
    const q = query(cadetsCollection, where('institution', '==', institutionName));
    const querySnapshot = await getDocs(q);
    const existingCadets = new Map(querySnapshot.docs.map(doc => [doc.data().regNo, doc.id]));

    for (const cadet of cadets) {
        if (!validateCadetData(cadet)) {
            // Skip invalid records, or you could return an error
            continue;
        }

        const dataToSave = {
            ...cadet,
            institution: institutionName,
            // Ensure batch is a number
            batch: Number(cadet.batch) || null,
            // Set default rank if not provided
            rank: cadet.rank || 'CDT'
        };

        const existingCadetId = existingCadets.get(cadet.regNo);

        if (existingCadetId) {
            // Update existing cadet
            const cadetRef = doc(db, 'cadets', existingCadetId);
            batch.update(cadetRef, dataToSave);
        } else {
            // Add new cadet. Use a new doc ref.
            const cadetRef = doc(cadetsCollection);
            batch.set(cadetRef, dataToSave);
        }
        importedCount++;
    }

    try {
        await batch.commit();
        revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
        return { success: true, count: importedCount };
    } catch (error: any) {
        console.error("Firestore batch commit failed:", error);
        return { success: false, error: error.message || 'Failed to import data to Firestore.' };
    }
}
