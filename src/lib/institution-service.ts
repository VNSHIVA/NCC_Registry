'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getInstitutions() {
    const institutionsCol = collection(db, 'institutions');
    const institutionSnapshot = await getDocs(institutionsCol);
    const institutionList = institutionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return institutionList;
}
