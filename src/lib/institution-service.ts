
'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, getCountFromServer, query, where, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function getInstitutions() {
    const institutionsCol = collection(db, 'institutions');
    const institutionSnapshot = await getDocs(institutionsCol);
    
    const institutionList = await Promise.all(institutionSnapshot.docs.map(async (doc) => {
        const institutionData = doc.data();
        const cadetsCol = collection(db, 'cadets');
        const q = query(cadetsCol, where("institution", "==", institutionData.name));
        const cadetsSnapshot = await getCountFromServer(q);
        const cadetCount = cadetsSnapshot.data().count;

        return { 
            id: doc.id, 
            ...institutionData,
            cadetCount: cadetCount,
        };
    }));

    return institutionList;
}

export async function addInstitution(data: { name: string; anoName: string; type: 'School' | 'College' }) {
    const docRef = await addDoc(collection(db, "institutions"), {
        ...data,
        cadetCount: 0 
    });
    revalidatePath('/institutions');
    return docRef.id;
}

export async function updateInstitution(id: string, data: { name: string; anoName: string; type: 'School' | 'College' }) {
    const institutionDoc = doc(db, 'institutions', id);
    await updateDoc(institutionDoc, data);
    revalidatePath('/institutions');
}

export async function deleteInstitution(id: string) {
    const institutionDoc = doc(db, 'institutions', id);
    await deleteDoc(institutionDoc);
    revalidatePath('/institutions');
}

    