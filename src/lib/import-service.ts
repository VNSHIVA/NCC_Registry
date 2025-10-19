'use server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, query, where, getDocs, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { campTypes } from './constants';

const validateCadetData = (cadet: any) => {
    return cadet.regNo && cadet.name && cadet.batch;
};

// Maps variations of header names to our standardized camelCase field names
const FIELD_MAPPING: { [key: string]: string } = {
    'regimental no': 'regNo',
    'regimental number': 'regNo',
    'reg no': 'regNo',
    'rank': 'rank',
    'full name': 'name',
    'name': 'name',
    'batch': 'batch',
    'year': 'batch',
    'dob': 'dob',
    'date of birth': 'dob',
    'mobile': 'mobile',
    'mobile no': 'mobile',
    'mobile number': 'mobile',
    'email': 'email',
    'email id': 'email',
    'blood group': 'bloodGroup',
    'home address': 'homeAddress',
    'address': 'homeAddress',
    'nok name': 'nokName',
    'next of kin name': 'nokName',
    'nok relation': 'nokRelation',
    'next of kin relation': 'nokRelation',
    'nok contact': 'nokContact',
    'next of kin contact': 'nokContact',
    'adhaar': 'adhaar',
    'adhaar no': 'adhaar',
    'aadhar': 'adhaar',
    'education': 'education',
    'education qualification': 'education',
    'sports/culturals': 'sportsCulturals',
    'sports': 'sportsCulturals',
};

// Function to process and structure camp details from a flat row
const processCampData = (row: any) => {
    const camps = [];
    const campTypeValues = campTypes.map(c => c.value);

    // Iterative camp fields like 'camp1_type', 'camp1_location', etc.
    for (let i = 1; i <= 10; i++) { // Check for up to 10 camps
        const campType = row[`camp${i}_type`];
        if (campType && campTypeValues.includes(campType.toUpperCase())) {
            camps.push({
                campType: campType.toUpperCase(),
                level: row[`camp${i}_level`] || '',
                location: row[`camp${i}_location`] || '',
                startDate: row[`camp${i}_startDate`] || '',
                endDate: row[`camp${i}_endDate`] || '',
                reward: row[`camp${i}_reward`] || '',
                durationDays: 0, // Should be calculated on front-end or here if dates are valid
                certificateUrl: row[`camp${i}_certificateUrl`] || '',
            });
        }
    }

    return camps;
};


export async function importCadets(cadets: any[], institutionName: string) {
    if (!Array.isArray(cadets) || cadets.length === 0) {
        return { success: false, error: 'No cadet data provided.' };
    }

    const cadetsCollection = collection(db, 'cadets');
    const batch = writeBatch(db);
    let importedCount = 0;

    const q = query(cadetsCollection, where('institution', '==', institutionName));
    const querySnapshot = await getDocs(q);
    const existingCadets = new Map(querySnapshot.docs.map(doc => [doc.data().regNo, doc.id]));

    for (const rawRow of cadets) {
        const normalizedRow: { [key: string]: any } = {};
        for (const key in rawRow) {
            const normalizedKey = FIELD_MAPPING[key.toLowerCase().trim()] || key.trim();
            normalizedRow[normalizedKey] = rawRow[key];
        }

        if (!validateCadetData(normalizedRow)) {
            continue;
        }
        
        const { regNo, name, batch: batchYear, ...rest } = normalizedRow;

        const camps = processCampData(normalizedRow);
        
        const dataToSave = {
            institution: institutionName,
            regNo,
            name,
            batch: Number(batchYear) || new Date().getFullYear(),
            rank: rest.rank || 'CDT',
            camps: camps, // Add the structured camps array
            ...rest // Add all other normalized fields
        };

        const existingCadetId = existingCadets.get(regNo);

        if (existingCadetId) {
            const cadetRef = doc(db, 'cadets', existingCadetId);
            batch.update(cadetRef, dataToSave);
        } else {
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
