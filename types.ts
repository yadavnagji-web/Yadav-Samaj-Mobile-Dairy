
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
  villageCode: string;
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
  fatherName: string;
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
  title: string;
  content: string;
  isDeleted: boolean;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  isDeleted: boolean;
}

export interface AppSettings {
  whatsappApiKey: string;
  senderMobile: string;
  templateId: string;
  messageId: string;
  otpMessage: string;
  logoUrl: string; 
  backgroundImageUrl?: string; // New: Persistent background
  proxyUrl?: string;
  aiKeyPrimary: string;
  aiKeySecondary: string;
}

export interface User {
  id: string;
  mobile: string;
  role: 'user' | 'admin';
}
