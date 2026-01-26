
export const getHindiDateInfo = () => {
  const date = new Date();
  
  // 1. Vaar (Weekday)
  const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const vaar = days[date.getDay()];

  // 2. Date
  const dinank = date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // 3. Simplified Hindi Months (Approximation for UI/UX)
  // Actual calculation requires complex astronomical data, using a seasonal mapping for demo
  const months = [
    'पौष', 'माघ', 'फाल्गुन', 'चैत्र', 'वैशाख', 'ज्येष्ठ', 
    'आषाढ़', 'श्रावण', 'भाद्रपद', 'अश्विन', 'कार्तिक', 'मार्गशीर्ष'
  ];
  const monthIdx = (date.getMonth() + 3) % 12; // Simple shift to align with Vikram Samvat approx
  const mahina = months[monthIdx];

  // 4. Paksh & Tithi (Estimated Logic)
  const dayOfMonth = date.getDate();
  const paksh = dayOfMonth <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const tithiNum = dayOfMonth <= 15 ? dayOfMonth : dayOfMonth - 15;
  const tithiNames = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 
    'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 
    'त्रयोदशी', 'चतुर्दशी', dayOfMonth <= 15 ? 'पूर्णिमा' : 'अमावस्या'
  ];
  const tithi = tithiNames[Math.min(tithiNum - 1, 14)];

  return {
    dinank,
    vaar,
    mahina,
    paksh,
    tithi,
    year: 'विक्रम संवत 2082' // Estimated
  };
};
