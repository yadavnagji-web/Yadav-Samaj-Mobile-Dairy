
import { Village, FieldType, DynamicField, AppSettings } from './types';

export const BRAND_LOGO_URL = "https://w7.pngwing.com/pngs/454/339/png-transparent-b-r-ambedkar-dalit-logo-dalit-s-blue-face-logo-thumbnail.png";

export const INITIAL_SETTINGS: AppSettings = {
  whatsappApiKey: '',
  senderMobile: '',
  templateId: '', 
  messageId: '', 
  otpMessage: '*{otp}* आपका वेरिफ़िकेशन कोड है।',
  logoUrl: BRAND_LOGO_URL,
  proxyUrl: 'https://corsproxy.io/?',
  aiKeyPrimary: '',
  aiKeySecondary: ''
};

export const UI_STRINGS = {
  appName: 'Dr भीमराव अंबेडकर यादव युवा संगठन वागड़ चौरासी मोबाइल डायरी',
  shortName: 'यादव समाज वागड़ चौरासी',
  tagline: 'शिक्षित बनो, संगठित रहो, संघर्ष करो',
  copyright: 'डॉ. भीमराव अंबेडकर यादव युवा संगठन © 2026'
};

export const DAILY_THOUGHTS = [
  "शिक्षा वह शेरनी का दूध है जो पियेगा वह दहाड़ेगा।",
  "जब तक आप सामाजिक स्वतंत्रता हासिल नहीं कर लेते, कानून आपको जो भी स्वतंत्रता देता है वह आपके किसी काम की नहीं है।",
  "छीने हुए अधिकार भीख में नहीं मिलते, अधिकार वसूल करने पड़ते हैं।",
  "संविधान केवल वकीलों का दस्तावेज नहीं है, यह जीवन का एक माध्यम है।",
  "मैं एक समुदाय की प्रगति को उस प्रगति की डिग्री से मापता हूं जो महिलाओं ने हासिल की है।",
  "भाग्य के बजाय अपनी शक्ति पर विश्वास करो।",
  "एक महान आदमी एक प्रतिष्ठित आदमी से इस तरह अलग होता है कि वह समाज का सेवक बनने के लिए तैयार रहता है।",
  "समानता एक कल्पना हो सकती है, लेकिन फिर भी इसे एक शासी सिद्धांत के रूप में स्वीकार करना चाहिए।",
  "ज्ञान हर इंसान के जीवन का आधार है।",
  "अपने भाग्य के बजाय अपनी मेहनत पर विश्वास रखें।",
  "जीवन लंबा होने के बजाय महान होना चाहिए।"
];
