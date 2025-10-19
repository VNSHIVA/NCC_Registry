'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// NOTE: In a real app, you would have more robust error handling.

export async function getCadets(institutionName: string) {
    const cadetsCol = collection(db, 'cadets');
    const q = query(cadetsCol, where("institution", "==", institutionName));
    const cadetSnapshot = await getDocs(q);
    const cadetsList = cadetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cadetsList;
}

export async function getCadet(id: string) {
    const cadetDoc = doc(db, 'cadets', id);
    const cadetSnapshot = await getDoc(cadetDoc);
    if (cadetSnapshot.exists()) {
        return { id: cadetSnapshot.id, ...cadetSnapshot.data() };
    } else {
        return null;
    }
}

export async function updateCadet(id: string, data: any, institutionName: string) {
    const cadetDoc = doc(db, 'cadets', id);
    await updateDoc(cadetDoc, data);
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets/${id}`);
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets/${id}/edit`);
}

export async function addCadet(data: any, institutionName: string) {
    const cadetsCol = collection(db, 'cadets');
    await addDoc(cadetsCol, data);
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
}

export async function deleteCadet(id: string, institutionName: string) {
    const cadetDoc = doc(db, 'cadets', id);
    await deleteDoc(cadetDoc);
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
}

export async function deleteCadets(ids: string[], institutionName: string) {
    if (!ids || ids.length === 0) return;
    const batch = writeBatch(db);
    ids.forEach(id => {
        const cadetDoc = doc(db, 'cadets', id);
        batch.delete(cadetDoc);
    });
    await batch.commit();
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
}
