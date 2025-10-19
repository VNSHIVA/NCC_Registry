
export const campTypes = [
  { value: "ATC", label: "ATC – Annual Training Camp" },
  { value: "CATC", label: "CATC – Combined Annual Training Camp" },
  { value: "NIC", label: "NIC – National Integration Camp" },
  { value: "SNIC", label: "SNIC – Special National Integration Camp" },
  { value: "EBSB", label: "EBSB – Ek Bharat Shreshtha Bharat" },
  { value: "RDC", label: "RDC – Republic Day Camp" },
  { value: "TSC", label: "TSC – Thal Sainik Camp" },
  { value: "BLC", label: "BLC – Basic Leadership Camp" },
  { value: "ALC", label: "ALC – Advance Leadership Camp" },
  { value: "ATTACHMENT", label: "Attachment Camp (Army/Navy/Air)" },
  { value: "ADVENTURE", label: "Adventure Camp (Trekking, Rock-Climbing…)" },
  { value: "YEP", label: "YEP – Youth Exchange Programme" },
  { value: "OTHER", label: "Other" },
];

export const rdcLevels = [
    "Unit Level", "Group Level", "IGC", "Pre-RDC I", "Pre-RDC II", "Pre-RDC III", "RDC (National Level)"
];

export const tscLevels = [
    "Unit Level", "Group Level", "IGC", "Pre-TSC I", "Pre-TSC II", "TSC (National Level)"
];

export const nationalCampTypes = ["RDC", "TSC"];

export const campWithLevels = {
    RDC: rdcLevels,
    TSC: tscLevels
};

