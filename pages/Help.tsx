
import React from 'react';
import { UI_STRINGS } from '../constants';

const Help: React.FC = () => {
  const downloadPDFGuide = () => window.print();
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20 px-4 pt-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 flex flex-col md:flex-row md:items-center justify-between print:hidden">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight">उपयोग मार्गदर्शिका</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-loose">यादव समाज वागड़ चौरासी - डिजिटल डायरेक्टरी</p>
          </div>
          <button onClick={downloadPDFGuide} className="mt-6 md:mt-0 bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3" /></svg>
            <span>PDF डाउनलोड करें</span>
          </button>
        </div>

        {/* Detailed Guide Sections */}
        <div className="space-y-12">
          
          {/* Section 1: Home & Search */}
          <GuideSection title="1. मुख्य स्क्रीन और खोज (Home & Search)" icon="🏠">
            <p className="text-slate-600 leading-relaxed mb-4 font-medium">ऐप खोलते ही आपको होम स्क्रीन दिखाई देगी। यहाँ से आप पूरे समाज के सदस्यों को खोज सकते हैं:</p>
            <ul className="space-y-4">
              <GuideStep title="गाँव का चयन करें" text="ड्रॉपडाउन मेनू से अपने गाँव का नाम चुनें। चुनते ही उस गाँव के सभी सदस्यों की सूची नीचे आ जाएगी।" />
              <GuideStep title="नाम या मोबाइल से खोजें" text="ऊपर दिए गए 'खोज' बॉक्स में सदस्य का नाम या उनके मोबाइल नंबर के कुछ अंक लिखें। ऐप तुरंत उन्हें ढूंढ लेगा।" />
              <GuideStep title="सीधा कॉल और व्हाट्सएप" text="सदस्य के नाम के पास 'कॉल' बटन दबाने पर सीधे फोन लग जाएगा। 'व्हाट्सएप' बटन से आप उनकी जानकारी साझा कर सकते हैं।" />
            </ul>
          </GuideSection>

          {/* Section 2: Registration */}
          <GuideSection title="2. नया सदस्य पंजीकरण (Registration)" icon="📝">
            <p className="text-slate-600 leading-relaxed mb-4 font-medium">यदि आपका या आपके परिवार के किसी सदस्य का नाम सूची में नहीं है, तो खुद जोड़ें:</p>
            <ul className="space-y-4">
              <GuideStep title="पंजीकरण लिंक" text="साइड मेनू (☰) में जाकर 'नया सदस्य पंजीकरण' पर क्लिक करें।" />
              <GuideStep title="विवरण भरें" text="अपना नाम, पिता का नाम और गाँव का चयन करें। कृपया ध्यान दें कि नाम केवल हिंदी (देवनागरी) में ही लिखें।" />
              <GuideStep title="OTP सत्यापन" text="सुरक्षा के लिए आपके मोबाइल पर एक कोड आएगा, उसे डालकर पंजीकरण पूरा करें।" />
            </ul>
          </GuideSection>

          {/* Section 3: Smart AI Assistant */}
          <GuideSection title="3. स्मार्ट AI सहायक (Voice Search)" icon="🎙️">
            <p className="text-slate-600 leading-relaxed mb-4 font-medium">बिना टाइप किए ऐप चलाने के लिए AI का उपयोग करें:</p>
            <ul className="space-y-4">
              <GuideStep title="नीचे दिया गया माइक बटन" text="स्क्रीन के नीचे दाईं ओर नीले रंग का माइक बटन दबाएं।" />
              <GuideStep title="बोलें और खोजें" text="जैसे ही 'सुन रहा हूँ' लिखा आए, बोलें - 'साकोदरा गाँव दिखाओ' या 'नगजी यादव को खोजो'। ऐप अपने आप उस पेज पर चला जाएगा।" />
            </ul>
          </GuideSection>

          {/* Section 4: Admin Panel */}
          <GuideSection title="4. एडमिन पैनल निर्देश (For Admins Only)" icon="🔐">
            <p className="text-slate-600 leading-relaxed mb-4 font-medium">समाज के व्यवस्थापकों के लिए विशेष निर्देश:</p>
            <ul className="space-y-4">
              <GuideStep title="गाँव जोड़ना" text="एडमिन पैनल में 'गाँव सूची' पर जाकर आप नए गाँव और तहसील का विवरण जोड़ सकते हैं।" />
              <GuideStep title="सदस्य प्रबंधन" text="'सदस्य' टैब में जाकर आप किसी भी सदस्य की जानकारी देख सकते हैं या गलत जानकारी होने पर उसे हटा सकते हैं।" />
              <GuideStep title="Excel बैकअप" text="समय-समय पर पूरी डायरेक्टरी को सुरक्षित रखने के लिए 'Excel Backup' बटन का उपयोग करें।" />
            </ul>
          </GuideSection>

        </div>

        {/* Support Footer */}
        <div className="bg-indigo-900 text-white p-12 rounded-[3.5rem] text-center shadow-2xl">
          <h3 className="text-2xl font-black mb-4">कोई समस्या आ रही है?</h3>
          <p className="text-indigo-300 font-bold mb-8 uppercase tracking-widest text-xs">Technical Support Contact</p>
          <div className="inline-block bg-white/10 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
            <p className="text-xl font-black text-amber-400">नगजी यादव (साकोदरा)</p>
            <a href="tel:9982151938" className="text-3xl font-black block mt-2 hover:text-blue-400 transition-colors">9982151938</a>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 mt-4">WhatsApp पर संपर्क करें</p>
          </div>
        </div>

      </div>
    </div>
  );
};

const GuideSection = ({ title, icon, children }: any) => (
  <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-110"></div>
    <div className="flex items-center space-x-4 mb-8">
      <span className="text-3xl bg-indigo-50 p-4 rounded-2xl">{icon}</span>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
    </div>
    {children}
  </div>
);

const GuideStep = ({ title, text }: any) => (
  <li className="flex items-start space-x-4">
    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0"></div>
    <div>
      <h4 className="text-sm font-heavy-custom text-slate-800 mb-1">{title}</h4>
      <p className="text-xs font-bold text-slate-500 leading-relaxed">{text}</p>
    </div>
  </li>
);

export default Help;
