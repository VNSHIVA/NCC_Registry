
'use server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, query, where, getDocs, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const REQUIRED_FIELDS = ['regNo', 'Cadet_Name', 'batch'];

const FIELD_MAPPING: { [key: string]: string } = {
    'regimental no': 'regNo',
    'regimental number': 'regNo',
    'reg no': 'regNo',
    'rank': 'rank',
    'batch': 'batch',
    'year': 'batch',
    'division': 'division',
    'armytype': 'armytype',

    'cadet_mobile_no': 'Cadet_Mobile_No',
    'cadet_name': 'Cadet_Name',
    'date_of_birth': 'Date_of_Birth',
    'cadet_gender': 'Cadet_Gender',
    'email_address': 'Email_Address',
    'nationality': 'Nationality',
    'identification_mark': 'Identification_Mark',
    'blood_group': 'Blood_Group',
    'adhaarnumber': 'adhaarnumber',

    'father_s_name': "Father_s_Name",
    'mother_s_name': "Mother_s_Name",

    'house_no': 'House_No',
    'building_name': 'Building_Name',
    'area': 'Area',
    'permanent_address_pin_code': 'Permanent_Address_Pin_code',
    'city': 'city',
    'state': 'state',
    'permanent_address_nrs': 'Permanent_Address_Nrs',

    'education_qualification': 'Education_Qualification',
    'institutetype': 'institutetype',

    'medical_complaint_if_any': 'Medical_Complaint_if_any',
    
    'nok_name': 'NOK_Name',
    'nok_relationship': 'NOK_Relationship',
    'nok_contact_number': 'NOK_Contact_Number',
    'nok_house_no': 'NOK_House_No',
    'nok_building_name': 'NOK_Building_Name',
    'nok_area': 'NOK_Area',
    'nok_pincode': 'NOK_Pincode',
    'nokcity': 'nokcity',
    'nokstate': 'nokstate',
    'noknrs': 'noknrs',
    
    'sports_games': 'Sports_Games',
    'co_curricular_activity': 'Co_Curricular_Activity',
    
    'willingness_to_undergo_military_training': 'Willingness_to_undergo_Military_Training',
    'willingness_to_serve_in_ncc': 'Willingness_to_serve_in_NCC',
    'previously_applied_for_enrollment': 'Previously_Applied_for_enrollment',
    'dismissed_from_ncc_ta_af': 'Dismissed_from_NCC_TA_AF',

    'criminal_court': 'Criminal_Court'
};


// Helper to create a composite key for name + DOB matching
const createNameDobKey = (name: string, dob: string) => {
    if (!name || !dob) return null;
    return `${name.toLowerCase().trim()}|${dob.trim()}`;
};


export async function importCadets(cadets: any[], institutionName: string) {
    if (!Array.isArray(cadets) || cadets.length === 0) {
        return { success: false, error: 'No cadet data provided.' };
    }

    const cadetsCollection = collection(db, 'cadets');
    const batch = writeBatch(db);
    let addedCount = 0;
    let updatedCount = 0;
    const missingFieldsTracker = new Set<string>();

    const q = query(cadetsCollection, where('institution', '==', institutionName));
    const querySnapshot = await getDocs(q);

    // Create maps for efficient lookups based on different criteria
    const existingByRegNo = new Map();
    const existingByAadhaar = new Map();
    const existingByNameDob = new Map();

    querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const record = { id: doc.id, data };
        if (data.regNo) existingByRegNo.set(data.regNo, record);
        if (data.adhaarnumber) existingByAadhaar.set(data.adhaarnumber, record);
        const nameDobKey = createNameDobKey(data.Cadet_Name, data.Date_of_Birth);
        if (nameDobKey) existingByNameDob.set(nameDobKey, record);
    });
    

    for (const rawRow of cadets) {
        const normalizedRow: { [key: string]: any } = {};
        for (const key in rawRow) {
            const normalizedKey = FIELD_MAPPING[key.toLowerCase().replace(/[ _-]/g, '_').trim()] || key.trim();
            // We keep null/empty values for now to check against required fields
            normalizedRow[normalizedKey] = rawRow[key];
        }

        // Clean object for Firestore: contains only fields with actual values
        const dataForFirestore: { [key: string]: any } = {};
        for (const key in normalizedRow) {
            if (normalizedRow[key] !== null && normalizedRow[key] !== '' && normalizedRow[key] !== undefined) {
                dataForFirestore[key] = normalizedRow[key];
            }
        }
        
        // Check for required fields before proceeding
        REQUIRED_FIELDS.forEach(field => {
            if (!dataForFirestore[field]) {
                missingFieldsTracker.add(field);
            }
        });
        
        // Find existing cadet using prioritized criteria
        let existingCadet = null;
        if (dataForFirestore.regNo) {
            existingCadet = existingByRegNo.get(dataForFirestore.regNo);
        }
        if (!existingCadet && dataForFirestore.adhaarnumber) {
            existingCadet = existingByAadhaar.get(dataForFirestore.adhaarnumber);
        }
        if (!existingCadet) {
            const nameDobKey = createNameDobKey(dataForFirestore.Cadet_Name, dataForFirestore.Date_of_Birth);
            if (nameDobKey) {
                existingCadet = existingByNameDob.get(nameDobKey);
            }
        }
        
        if (existingCadet) {
            // UPDATE: Merge new non-empty data with existing record
            const cadetRef = doc(db, 'cadets', existingCadet.id);
            batch.set(cadetRef, dataForFirestore, { merge: true });
            updatedCount++;
        } else {
            // CREATE: Add a new record
            const dataToSave = {
                institution: institutionName,
                ...dataForFirestore,
                // Ensure array fields exist even if not in the import
                certificates: dataForFirestore.certificates || [],
                camps: dataForFirestore.camps || [],
            };

            // Auto-assign division logic if not provided
            if (!dataToSave.division && dataToSave.institutetype && dataToSave.Cadet_Gender) {
                if (dataToSave.institutetype === 'School') {
                    dataToSave.division = dataToSave.Cadet_Gender === 'Male' ? 'JD' : 'JW';
                } else if (dataToSave.institutetype === 'College') {
                    dataToSave.division = dataToSave.Cadet_Gender === 'Male' ? 'SD' : 'SW';
                }
            }
            
            const cadetRef = doc(cadetsCollection);
            batch.set(cadetRef, dataToSave);
            addedCount++;
        }
    }

    try {
        await batch.commit();
        revalidatePath(`/institutions/${encodeURIComponent(institutionName)}/cadets`);
        return { 
            success: true, 
            added: addedCount,
            updated: updatedCount,
            missingFields: Array.from(missingFieldsTracker)
        };
    } catch (error: any) {
        console.error("Firestore batch commit failed:", error);
        return { success: false, error: error.message || 'Failed to import data to Firestore.' };
    }
}
