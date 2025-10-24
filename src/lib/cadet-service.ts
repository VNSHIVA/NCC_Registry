
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
        return (currentYear - batchYear) < 1;
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

export async function getArchivedCadetsByInstitution() {
    const cadetsCol = collection(db, 'cadets');
    const cadetSnapshot = await getDocs(cadetsCol);
    
    const archivedCadets = cadetSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(cadet => !isActiveCadet(cadet));

    const groupedByInstitution = archivedCadets.reduce((acc, cadet) => {
        const institutionName = cadet.institutionName || 'Unknown Institution';
        if (!acc[institutionName]) {
            acc[institutionName] = [];
        }
        acc[institutionName].push(cadet);
        return acc;
    }, {} as { [key: string]: any[] });

    // Sort institutions by name
    const sortedInstitutions = Object.keys(groupedByInstitution).sort();
    
    const result = sortedInstitutions.map(institutionName => ({
        institutionName,
        cadets: groupedByInstitution[institutionName].sort((a, b) => (a.Cadet_Name || '').localeCompare(b.Cadet_Name || '')) // Sort cadets by name
    }));

    return result;
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
