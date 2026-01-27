
import * as XLSX from 'xlsx';
import { Contact, Village } from '../types';

export const exportContactsToExcel = (contacts: Contact[], villages: Village[]) => {
  const data = contacts.filter(c => !c.isDeleted).map(c => {
    const village = villages.find(v => v.id === c.villageId);
    return {
      'सदस्य का नाम': c.name,
      'पिता का नाम': c.fatherName,
      'मोबाइल नंबर': c.mobile,
      'गाँव': village ? village.name : 'अज्ञात',
      'तहसील': village ? village.tehsil : 'अज्ञात',
      'जिला': village ? village.district : 'अज्ञात',
      'पेशा': c.profession || 'किसान',
      'पंजीकरण तिथि': c.isActive ? 'Active' : 'Inactive'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Yadav_Samaj_Database');
  
  // Set column widths for better readability
  const wscols = [
    {wch: 25}, {wch: 25}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 10}
  ];
  worksheet['!cols'] = wscols;

  const date = new Date().toLocaleDateString('hi-IN').replace(/\//g, '-');
  XLSX.writeFile(workbook, `Yadav_Samaj_Full_Directory_${date}.xlsx`);
};

export const parseContactsFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
