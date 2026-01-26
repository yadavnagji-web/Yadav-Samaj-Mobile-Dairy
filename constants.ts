
import { Village, FieldType, DynamicField, AppSettings } from './types';

// Updated branding logo with the provided image URL
export const BRAND_LOGO_URL = "https://w7.pngwing.com/pngs/454/339/png-transparent-b-r-ambedkar-dalit-logo-dalit-s-blue-face-logo-thumbnail.png";

export const INITIAL_VILLAGES: Village[] = [
  { id: 'v1', villageCode: 'V-CITARI', name: 'चितरी', district: 'डूंगरपुर', tehsil: 'लीकोट', order: 1, isDeleted: false },
  { id: 'v2', villageCode: 'V-SAGWAD', name: 'सागवाड़ा', district: 'डूंगरपुर', tehsil: 'सागवाड़ा', order: 2, isDeleted: false },
  { id: 'v3', villageCode: 'V-OBRI01', name: 'ओबरी', district: 'डूंगरपुर', tehsil: 'सागवाड़ा', order: 3, isDeleted: false },
];

export const INITIAL_FIELDS: DynamicField[] = [
  { id: 'f2', name: 'गोत्र', type: FieldType.TEXT, required: false },
  { id: 'f3', name: 'रक्त समूह', type: FieldType.DROPDOWN, required: false, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
];

export const INITIAL_SETTINGS: AppSettings = {
  whatsappApiKey: '3WHUAVcRdtob3GfQRv9LGlI1V9LU2gMn56ODP799qqwxz0ABSd5j2VTM2fde',
  senderMobile: '9530482812',
  templateId: 'contact_dairy', 
  messageId: '11232', 
  phoneNumberId: '823937774143863', 
  otpMessage: '*{otp}* आपका वेरिफ़िकेशन कोड है।',
  diaryYear: '2026',
  pageSize: 'A4',
  fontSize: 'Medium',
  isBackupActive: true,
  logoUrl: BRAND_LOGO_URL,
  proxyUrl: 'https://corsproxy.io/?'
};

export const UI_STRINGS = {
  appName: 'यादव समाज',
  subName: 'वागड़ चौरासी',
  fullAppName: 'यादव समाज वागड़ चौरासी मोबाइल डायरी',
  tagline: 'डिजिटल ग्राम निर्देशिका एवं सामाजिक डायरी',
  searchPlaceholder: 'नाम या मोबाइल नंबर खोजें...',
  voiceSearch: 'बोलकर खोजें',
  adminLogin: 'एडमिन लॉगिन',
  userLogin: 'व्हाट्सएप लॉगिन',
  villageList: 'गाँव की सूची',
  contacts: 'संपर्क',
  bulletin: 'सूचना पट्ट',
  addVillage: 'गाँव जोड़ें',
  generateDiary: 'डायरी (PDF) बनाएं',
  exportExcel: 'एक्सेल एक्सपोर्ट',
};
