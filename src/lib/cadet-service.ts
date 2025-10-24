

'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const isActiveCadet = (cadet: any) => {
    if (!cadet || !cadet.batch || !cadet.division) return false;
    const currentYear = new Date().getFullYear();
    const batchYear = parseInt(cadet.batch, 10);
    if (isNaN(batchYear)) return false;

    const division = cadet.division?.toUpperCase();
    if (division === 'SD' || division === 'SW') {
        return (currentYear - batchYear) < 3;
    }
    if (division === 'JD' || division === 'JW') {
        return (currentYear - batchYear) < 2; // Junior is 2 years
    }
    return false; // Default to inactive if division is unknown
};


export async function getCadets(institutionName: string) {
    const cadetsCol = collection(db, 'cadets');
    const q = query(cadetsCol, where("institutionName", "==", institutionName));
    const cadetSnapshot = await getDocs(q);
    const cadetsList = cadetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cadetsList;
}

export async function getArchivedCadets() {
    const cadetsCol = collection(db, 'cadets');
    const institutionsCol = collection(db, 'institutions');
    
    const [cadetSnapshot, institutionsSnapshot] = await Promise.all([
        getDocs(cadetsCol),
        getDocs(institutionsCol)
    ]);
    
    const allCadets = cadetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const archivedCadets = allCadets.filter(cadet => !isActiveCadet(cadet));
    const institutions = institutionsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));

    return { archivedCadets, institutions };
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
    revalidatePath('/dashboard');
    revalidatePath('/institutions');
    revalidatePath('/archived');
}

export async function addCadet(data: any, institutionName: string) {
    const cadetsCol = collection(db, 'cadets');
    await addDoc(cadetsCol, data);
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
    revalidatePath('/dashboard');
    revalidatePath('/institutions');
}

export async function deleteCadet(id: string, institutionName: string) {
    const cadetDoc = doc(db, 'cadets', id);
    await deleteDoc(cadetDoc);
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
    revalidatePath('/dashboard');
    revalidatePath('/institutions');
    revalidatePath('/archived');
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
    revalidatePath('/dashboard');
    revalidatePath('/institutions');
    revalidatePath('/archived');
}
