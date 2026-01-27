
import { Village, FieldType, DynamicField, AppSettings } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  whatsappApiKey: '',
  senderMobile: '',
  templateId: '', 
  messageId: '', 
  otpMessage: '*{otp}* आपका वेरिफ़िकेशन कोड है।',
  proxyUrl: 'https://corsproxy.io/?',
  aiKeyPrimary: '',
  aiKeySecondary: ''
};

export const UI_STRINGS = {
  appName: 'यादव समाज वागड़ चौरासी',
  shortName: 'यादव समाज',
  tagline: 'शिक्षित बनो, संगठित रहो, संघर्ष करो',
  copyright: 'यादव समाज वागड़ चौरासी © 2026'
};

export const DAILY_THOUGHTS = [
  "शिक्षा वह शेरनी का दूध है जो पियेगा वह दहाड़ेगा।",
  "छीने हुए अधिकार भीख में नहीं मिलते, अधिकार वसूल करने पड़ते हैं।",
  "संविधान केवल वकीलों का दस्तावेज नहीं है, यह जीवन का एक माध्यम है।",
  "मैं एक समुदाय की प्रगति को उस प्रगति की डिग्री से मापता हूं जो महिलाओं ने हासिल की है।",
  "भाग्य के बजाय अपनी शक्ति पर विश्वास करो।",
  "जीवन लंबा होने के बजाय महान होना चाहिए।"
];
