
import React from 'react';
import { UI_STRINGS } from '../constants';

interface HelpProps {
  logoUrl: string;
}

const Help: React.FC<HelpProps> = ({ logoUrl }) => {
  const downloadPDFGuide = () => window.print();
  return (
    <div className="space-y-8 pb-20 print:p-0">
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50 flex flex-col md:flex-row md:items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow-md">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight">उपयोग सहायता</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{UI_STRINGS.appName} Manual</p>
          </div>
        </div>
        <button onClick={downloadPDFGuide} className="mt-6 md:mt-0 bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center space-x-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3" /></svg>
          <span>गाइड डाउनलोड करें</span>
        </button>
      </div>

      <section className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden print:bg-slate-50 print:text-indigo-900">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-4">नमस्ते! उपयोग कैसे करें?</h2>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl print:text-slate-700">यह ऐप आपके गाँव की पूरी जानकारी को व्यवस्थित करता है। नीचे दिए गए स्टेप्स से आप इसे और आसानी से समझ सकते हैं।</p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32"></div>
      </section>

      <div className="grid grid-cols-1 gap-8">
        <HelpStep num="1" title="मोबाइल नंबर से खोजें" desc="होम पेज पर सर्च बार में किसी का मोबाइल नंबर या नाम लिखें, परिणाम तुरंत मिल जाएगा।" icon="🔍" />
        <HelpStep num="2" title="AI वॉइस सर्च का उपयोग" desc="माइक वाले बटन पर क्लिक करके सिर्फ नाम बोलें, AI अपने आप उसे खोज देगा।" icon="🎙️" />
        <HelpStep num="3" title="इमरजेंसी संपर्क (SOS)" desc="गाँव के पेज पर सबसे ऊपर लाल रंग के बॉक्स में डॉक्टर, एम्बुलेंस और गाँव के मुख्य लोगों के नंबर दिए गए हैं जो संकट में काम आ सकते हैं।" icon="🆘" />
        <HelpStep num="4" title="WhatsApp पर शेयर" desc="किसी के नाम के बगल में व्हाट्सएप बटन दबाकर उनकी पूरी जानकारी किसी और को भेजें।" icon="📲" />
      </div>

      <section className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">सहायता चाहिए?</h3>
            <p className="text-slate-400 font-bold">संपर्क सूत्र (Contact Us)</p>
          </div>
          <div className="bg-white/10 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl text-center">
            <p className="text-xl font-black text-amber-400">Nagji Yadav sakodara</p>
            <a href="tel:9982151938" className="text-3xl font-black block mt-2 hover:text-blue-400 transition-colors">9982151938</a>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 mt-4">Available on WhatsApp</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const HelpStep = ({ num, title, desc, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-start gap-6 shadow-sm">
    <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0">{icon}</div>
    <div>
      <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center">
        <span className="text-indigo-600 mr-2">#{num}</span> {title}
      </h4>
      <p className="text-slate-500 font-bold leading-relaxed mt-2">{desc}</p>
    </div>
  </div>
);

export default Help;
