
'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, getCountFromServer, query, where, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const isActiveCadet = (cadet: any) => {
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

export async function getInstitutions() {
    const institutionsCol = collection(db, 'institutions');
    const institutionSnapshot = await getDocs(institutionsCol);
    
    const institutionList = await Promise.all(institutionSnapshot.docs.map(async (doc) => {
        const institutionData = doc.data();
        const cadetsCol = collection(db, 'cadets');
        const q = query(cadetsCol, where("institutionName", "==", institutionData.name));
        const cadetsSnapshot = await getDocs(q);
        
        const allCadets = cadetsSnapshot.docs.map(d => d.data());
        const activeCadets = allCadets.filter(isActiveCadet);

        const divisionCounts = { SD: 0, SW: 0, JD: 0, JW: 0 };
        const yearCounts = {
            SD: { first: 0, second: 0, third: 0 },
            SW: { first: 0, second: 0, third: 0 }
        };
        const currentYear = new Date().getFullYear();

        for (const cadet of activeCadets) {
            const division = cadet.division?.toUpperCase();
            if (division in divisionCounts) {
                divisionCounts[division as keyof typeof divisionCounts]++;
            }

            if (institutionData.type === 'College' && (division === 'SD' || division === 'SW')) {
                const batchYear = parseInt(cadet.batch);
                if (!isNaN(batchYear)) {
                    const yearDiff = currentYear - batchYear;
                    if (yearDiff === 0) {
                        yearCounts[division as 'SD' | 'SW'].first++;
                    } else if (yearDiff === 1) {
                        yearCounts[division as 'SD' | 'SW'].second++;
                    } else if (yearDiff === 2) {
                        yearCounts[division as 'SD' | 'SW'].third++;
                    }
                }
            }
        }
        
        return { 
            id: doc.id, 
            ...institutionData,
            cadetCount: activeCadets.length, // Count only active cadets
            divisionCounts,
            yearCounts,
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
    const institutionDocRef = doc(db, 'institutions', id);

    // Get the current institution name before updating
    const institutionSnap = await getDoc(institutionDocRef);
    if (!institutionSnap.exists()) {
        throw new Error("Institution not found");
    }
    const oldInstitutionName = institutionSnap.data().name;
    
    const newInstitutionName = data.name;

    const batch = writeBatch(db);

    // Update the institution document itself
    batch.update(institutionDocRef, data);

    // If the name has changed, update all associated cadets
    if (oldInstitutionName !== newInstitutionName) {
        const cadetsQuery = query(collection(db, 'cadets'), where('institutionName', '==', oldInstitutionName));
        const cadetsSnapshot = await getDocs(cadetsQuery);
        
        cadetsSnapshot.forEach((cadetDoc) => {
            const cadetRef = doc(db, 'cadets', cadetDoc.id);
            batch.update(cadetRef, { institutionName: newInstitutionName });
        });
    }

    // Commit all batched writes
    await batch.commit();

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
