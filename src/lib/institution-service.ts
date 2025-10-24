
'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, getCountFromServer, query, where, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function getInstitutions() {
    const institutionsCol = collection(db, 'institutions');
    const institutionSnapshot = await getDocs(institutionsCol);
    
    const institutionList = await Promise.all(institutionSnapshot.docs.map(async (doc) => {
        const institutionData = doc.data();
        const cadetsCol = collection(db, 'cadets');
        const q = query(cadetsCol, where("institutionName", "==", institutionData.name));
        const cadetsSnapshot = await getDocs(q);
        const cadets = cadetsSnapshot.docs.map(d => d.data());

        const divisionCounts = { SD: 0, SW: 0, JD: 0, JW: 0 };
        for (const cadet of cadets) {
            const division = cadet.division?.toUpperCase();
            if (division in divisionCounts) {
                divisionCounts[division as keyof typeof divisionCounts]++;
            }
        }
        
        return { 
            id: doc.id, 
            ...institutionData,
            cadetCount: cadets.length,
            divisionCounts,
        };
    }));

    return institutionList;
}

export async function getInstitutionByName(name: string) {
    const institutionsCol = collection(db, 'institutions');
    const q = query(institutionsCol, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
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
    const institutionDocRef = doc(db, 'institutions', id);
    
    // First, get the institution's data to find its name
    const institutionSnap = await getDoc(institutionDocRef);
    if (!institutionSnap.exists()) {
        console.error("Institution to delete does not exist.");
        return;
    }
    const institutionName = institutionSnap.data().name;

    // Find all cadets belonging to this institution
    const cadetsCol = collection(db, 'cadets');
    const q = query(cadetsCol, where("institutionName", "==", institutionName));
    const cadetsSnapshot = await getDocs(q);

    // Create a batch to delete all associated cadets
    const batch = writeBatch(db);
    cadetsSnapshot.docs.forEach((cadetDoc) => {
        batch.delete(cadetDoc.ref);
    });

    // Add the institution itself to the batch for deletion
    batch.delete(institutionDocRef);

    // Commit the batch
    await batch.commit();

    revalidatePath('/institutions');
    // Also revalidate the specific cadets page in case the user navigates back
    revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
}
