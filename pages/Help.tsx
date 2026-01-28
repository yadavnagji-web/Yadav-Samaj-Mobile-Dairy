
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UI_STRINGS } from '../constants';

const Help: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 px-4 pt-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Button */}
        <div className="flex justify-start">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-slate-700 font-bold text-xs active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="uppercase tracking-widest">पीछे जाएँ</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-white p-10 rounded-[3rem] text-center shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="text-5xl mb-6">💡</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">उपयोग मार्गदर्शिका <br/><span className="text-indigo-600">User Guide</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em] mt-6">
            {UI_STRINGS.appName} • स्मार्ट सहायता
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-indigo-600 uppercase tracking-tight mb-4 flex items-center">
              <span className="mr-3">🤖</span> AI स्मार्ट असिस्टेंट
            </h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              नीचे दिए गए काले माइक बटन को दबाकर आप ऐप से बात कर सकते हैं। यह 'Groq AI' द्वारा संचालित है जो आपके आदेशों को समझकर परिणाम दिखाता है। आप कह सकते हैं "साकोदरा गाँव दिखाओ" या "होम पर जाओ"।
            </p>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-purple-600 uppercase tracking-tight mb-4 flex items-center">
              <span className="mr-3">🛡️</span> डिवाइस बाइंडिंग एवं सुरक्षा
            </h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              सुरक्षा के लिए, आपका नंबर आपके फोन से जुड़ जाता है। आप अपना नंबर केवल उसी फोन से हटा सकते हैं जिसमें वह नंबर चल रहा है। यदि फोन बदल गया है, तो 'नंबर अपडेट' का उपयोग करें।
            </p>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-emerald-600 uppercase tracking-tight mb-4 flex items-center">
              <span className="mr-3">👤</span> नया पंजीकरण
            </h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              नया रजिस्ट्रेशन करने के लिए 'Register' बटन दबाएँ। अपना नाम और विवरण केवल हिंदी (देवनागरी) में भरें। आपके व्हाट्सएप पर एक OTP आएगा जिसे दर्ज करते ही पंजीकरण पूरा हो जाएगा।
            </p>
          </section>
        </div>

        {/* Support */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-center text-white">
          <h3 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">तकनीकी सहायता</h3>
          <h4 className="text-xl font-bold mb-2">नगजी यादव</h4>
          <a href="tel:9982151938" className="text-2xl font-black text-amber-400">9982151938</a>
          <p className="text-[8px] text-slate-500 uppercase mt-4 tracking-widest">शिक्षित बनो • संगठित रहो • संघर्ष करो</p>
        </div>
      </div>
    </div>
  );
};

export default Help;
