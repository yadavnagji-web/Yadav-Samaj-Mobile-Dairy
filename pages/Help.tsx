
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UI_STRINGS } from '../constants';

const Help: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 px-4 pt-10 relative">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Back Button */}
        <div className="flex justify-start mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="group flex items-center space-x-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">मुख्य स्क्रीन पर लौटें</span>
          </button>
        </div>

        {/* Main Header */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-indigo-50 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-100 relative z-10">📖</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight relative z-10">उपयोग मार्गदर्शिका (User Guide)</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3 leading-relaxed relative z-10">
            {UI_STRINGS.appName} <br/> डिजिटल सिस्टम को समझने के लिए नीचे दिए गए चरणों का पालन करें
          </p>
        </div>

        {/* Page Wise Guide */}
        <div className="space-y-16">
          
          {/* Section 1: Registration */}
          <GuideSection title="चरण 1: नया सदस्य पंजीकरण (Registration)" icon="✨" color="indigo">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Step num="1" title="रजिस्ट्रेशन पेज खोलें" text="साइड मेन्यू खोलें और 'नया सदस्य पंजीकरण' बटन पर क्लिक करें।" />
              <Step num="2" title="मोबाइल नंबर की जाँच" text="अपना 10 अंकों का मोबाइल नंबर डालें। सिस्टम चेक करेगा कि आप पहले से जुड़ें हैं या नहीं।" />
              <Step num="3" title="विवरण भरें (हिंदी में)" text="अपना नाम, पिता का नाम और गाँव चुनें। ध्यान रहे! नाम केवल हिंदी (देवनागरी) लिपि में ही लिखें।" />
              <Step num="4" title="OTP सत्यापन" text="आपके मोबाइल पर आए 6 अंकों के सुरक्षा कोड (OTP) को डालकर रजिस्ट्रेशन पूरा करें।" />
            </div>
            <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl">
              <p className="text-[10px] font-black text-amber-700 uppercase leading-relaxed italic">नोट: यदि आप अंग्रेजी में नाम लिखेंगे, तो सिस्टम त्रुटि (Error) दिखाएगा।</p>
            </div>
          </GuideSection>

          {/* Section 2: Searching & Navigation */}
          <GuideSection title="चरण 2: सदस्य खोज एवं नेविगेशन" icon="🔍" color="purple">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Step num="1" title="नाम या मोबाइल से खोज" text="होम स्क्रीन पर दिए गए सर्च बॉक्स में किसी का भी नाम या मोबाइल नंबर लिखकर तुरंत परिणाम पाएँ।" />
              <Step num="2" title="गाँव के अनुसार सूची" text="ड्रॉपडाउन मेन्यू से अपना गाँव चुनें। गाँव चुनते ही उस गाँव के सभी सदस्यों की सूची और गाँव का QR कोड दिखाई देगा।" />
              <Step num="3" title="सीधा कॉल (Direct Call)" text="सदस्य के नाम के बगल में बने नीले 'फोन' आइकॉन पर क्लिक करने से सीधे कॉल लग जाएगा।" />
              <Step num="4" title="विवरण साझा करें" text="'शेयर' बटन दबाकर आप किसी भी सदस्य की जानकारी सीधे व्हाट्सएप पर भेज सकते हैं।" />
            </div>
          </GuideSection>

          {/* Section 3: AI & QR Features */}
          <GuideSection title="चरण 3: AI वॉइस और QR कोड फीचर्स" icon="🤖" color="rose">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Step num="1" title="बोलकर खोजें" text="नीचे दिए गए नीले 'माइक' बटन को दबाएँ और कहें - जैसे 'नगजी यादव को खोजो' या 'साकोदरा गाँव दिखाओ'।" />
              <Step num="2" title="गाँव का डिजिटल QR" text="जब आप कोई गाँव चुनते हैं, तो उसका एक विशेष QR कोड दिखता है। इसे दूसरों के साथ शेयर करें ताकि वे सीधे आपके गाँव की सूची देख सकें।" />
              <Step num="3" title="QR PDF डाउनलोड" text="साइड मेन्यू से 'सभी गाँव के QR' विकल्प चुनें और समाज के सभी गाँवों के कोड एक साथ प्रिंट करें।" />
              <Step num="4" title="प्रीमियम लुक्स" text="ऐप का बैकग्राउंड और डिजाइन समाज की एकता और आधुनिकता को ध्यान में रखकर बनाया गया है।" />
            </div>
          </GuideSection>

          {/* Section 4: Admin Panel */}
          <GuideSection title="चरण 4: एडमिन पैनल (केवल प्रबंधकों के लिए)" icon="🔐" color="slate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Step num="1" title="एडमिन लॉगिन" text="मेन्यू में 'Login Admin' पर जाकर अपना आईडी (ईमेल/मोबाइल) और पासवर्ड (123456) डालें।" />
              <Step num="2" title="एक्सेल इम्पोर्ट (Bulk Import)" text="हज़ारों नाम एक साथ जोड़ने के लिए एडमिन डैशबोर्ड पर 'Excel Import' का उपयोग करें।" />
              <Step num="3" title="डेटा मैनेजमेंट" text="एडमिन पैनल से आप किसी भी गलत जानकारी को सुधार सकते हैं या डिलीट कर सकते हैं।" />
              <Step num="4" title="सिस्टम सेटिंग्स" text="यहाँ से ऐप का बैकग्राउंड और AI की 'API Keys' को बदला जा सकता है।" />
            </div>
          </GuideSection>

        </div>

        {/* Final Contact Card */}
        <div className="bg-slate-900 p-12 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50"></div>
          <h3 className="text-xl font-black text-white mb-6 relative z-10">कोई अन्य समस्या है? संपर्क करें</h3>
          <div className="relative z-10 inline-block bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-2">मुख्य व्यवस्थापक</p>
            <h4 className="text-2xl font-black text-white">नगजी यादव (साकोदरा)</h4>
            <a href="tel:9982151938" className="text-3xl font-black text-amber-400 mt-4 block hover:scale-105 transition-transform">9982151938</a>
          </div>
          <p className="mt-8 text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10">{UI_STRINGS.copyright}</p>
        </div>

      </div>
    </div>
  );
};

const GuideSection = ({ title, icon, color, children }: any) => {
  const bgMap: any = { indigo: 'bg-indigo-50', purple: 'bg-purple-50', rose: 'bg-rose-50', slate: 'bg-slate-100' };
  const textMap: any = { indigo: 'text-indigo-600', purple: 'text-purple-600', rose: 'text-rose-600', slate: 'text-slate-800' };
  
  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="flex items-center space-x-5 mb-10">
        <span className={`${bgMap[color]} ${textMap[color]} w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform shadow-inner`}>{icon}</span>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
};

const Step = ({ num, title, text }: any) => (
  <div className="flex items-start space-x-5 group/step">
    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1 shadow-lg group-hover/step:bg-indigo-600 transition-colors">
      {num}
    </div>
    <div className="space-y-1.5">
      <h4 className="text-sm font-heavy-custom text-slate-800 tracking-tight">{title}</h4>
      <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default Help;
