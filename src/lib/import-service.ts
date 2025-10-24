
'use server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, query, where, getDocs, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { campTypes } from './constants';

const validateCadetData = (cadet: any) => {
    return cadet.regNo && cadet.Cadet_Name && cadet.batch;
};

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
            const normalizedKey = FIELD_MAPPING[key.toLowerCase().replace(/ /g, '_').trim()] || key.trim();
            normalizedRow[normalizedKey] = rawRow[key];
        }
        
        if (!validateCadetData(normalizedRow)) {
            continue;
        }
        
        const { regNo, Cadet_Name, batch: batchYear, ...rest } = normalizedRow;

        const camps = processCampData(normalizedRow);
        
        const dataToSave = {
            institution: institutionName,
            regNo,
            Cadet_Name,
            batch: Number(batchYear) || new Date().getFullYear(),
            camps: camps, // Add the structured camps array
            ...rest // Add all other normalized fields
        };
        
        // Ensure default values for radio button fields if they are missing
        dataToSave.Willingness_to_undergo_Military_Training = dataToSave.Willingness_to_undergo_Military_Training || 'No';
        dataToSave.Willingness_to_serve_in_NCC = dataToSave.Willingness_to_serve_in_NCC || 'No';
        dataToSave.Previously_Applied_for_enrollment = dataToSave.Previously_Applied_for_enrollment || 'No';
        dataToSave.Dismissed_from_NCC_TA_AF = dataToSave.Dismissed_from_NCC_TA_AF || 'No';
        dataToSave.Criminal_Court = dataToSave.Criminal_Court || 'No';
        dataToSave.rank = dataToSave.rank || 'CDT';


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

    