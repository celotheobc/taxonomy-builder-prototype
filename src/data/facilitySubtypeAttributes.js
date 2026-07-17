/** Specialised attributes per Facility subtype (prototype story). */

export const FACILITY_SUBTYPE_SPECIALIZED_ATTRIBUTES = {
  'Manufacturing Facility': [
    { name: 'Production Lines', dataType: 'INTEGER' },
    { name: 'Operating Shifts', dataType: 'STRING' },
    { name: 'ISO Certification', dataType: 'STRING' },
  ],
  Warehouse: [
    { name: 'Storage Capacity', dataType: 'INTEGER' },
    { name: 'Temperature Controlled', dataType: 'BOOLEAN' },
    { name: 'Loading Bays', dataType: 'INTEGER' },
  ],
  'Distribution Centre': [
    { name: 'Daily Throughput', dataType: 'INTEGER' },
    { name: 'Loading Docks', dataType: 'INTEGER' },
    { name: 'Delivery Radius', dataType: 'INTEGER' },
  ],
  'Retail Store': [
    { name: 'Opening Hours', dataType: 'STRING' },
    { name: 'Sales Floor Area', dataType: 'INTEGER' },
    { name: 'Store Format', dataType: 'STRING' },
  ],
  Office: [
    { name: 'Desk Capacity', dataType: 'INTEGER' },
    { name: 'Meeting Rooms', dataType: 'INTEGER' },
    { name: 'Hybrid Working Enabled', dataType: 'BOOLEAN' },
  ],
};

export function getFacilitySubtypeSpecializedAttributes(labelOrValue) {
  if (!labelOrValue) return [];
  return FACILITY_SUBTYPE_SPECIALIZED_ATTRIBUTES[labelOrValue] ?? [];
}
