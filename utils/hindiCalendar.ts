
export const getHindiDateInfo = () => {
  const date = new Date();
  const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const vaar = days[date.getDay()];
  
  // Dynamic Date Formatting
  const dinank = date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Hindi Months Logic (Simplified for display)
  const months = ['पौष', 'माघ', 'फाल्गुन', 'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'अश्विन', 'कार्तिक', 'मार्गशीर्ष'];
  const monthIdx = (date.getMonth() + 3) % 12; // Approximation
  const mahina = months[monthIdx];

  const dayOfMonth = date.getDate();
  const paksh = dayOfMonth <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  
  const tithiNames = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 
    dayOfMonth <= 15 ? 'पूर्णिमा' : 'अमावस्या'
  ];
  
  const tithiIdx = (dayOfMonth > 15 ? dayOfMonth - 15 : dayOfMonth) - 1;
  const tithi = tithiNames[Math.min(tithiIdx, 14)];

  return { dinank, vaar, mahina, paksh, tithi };
};
