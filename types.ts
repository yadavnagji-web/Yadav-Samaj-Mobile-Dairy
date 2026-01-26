
export enum FieldType {
  TEXT = 'Text',
  NUMBER = 'Number',
  DROPDOWN = 'Dropdown',
  YESNO = 'Yes/No'
}

export interface DynamicField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface Village {
  id: string;
  villageCode: string; // Automatic Unique Village Number
  name: string;
  district: string;
  tehsil: string;
  order: number;
  isDeleted: boolean;
  isPrintLocked?: boolean;
}

export interface Contact {
  id: string;
  villageId: string;
  familyId?: string;
  name: string;
  fatherName: string; // New Core Field
  mobile: string;
  profession: string;
  dynamicValues: Record<string, any>;
  isActive: boolean;
  isEmergency: boolean;
  isDeleted: boolean;
  isMarkedWrong?: boolean;
}

export interface Bulletin {
  id: string;
  villageId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  contactPerson: string;
  expiryDate: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  position: 'Top' | 'Bottom' | 'Village' | 'Diary';
  isActive: boolean;
}

export interface AppSettings {
  whatsappApiKey: string;
  senderMobile: string;
  templateId: string;
  messageId: string;
  phoneNumberId?: string; // For WhatsApp Route
  otpMessage: string;
  diaryYear: string;
  pageSize: 'A4' | 'A5';
  fontSize: 'Small' | 'Medium' | 'Large';
  isBackupActive: boolean;
  logoUrl: string; 
  proxyUrl?: string; // New field for CORS Proxy
}

export interface User {
  id: string;
  mobile: string;
  role: 'user' | 'admin';
}
