
import React, { useState, useRef, useEffect } from 'react';
import { UI_STRINGS } from '../constants';
import { getAiParentingAdvice } from '../services/geminiService';

const AiAdvisor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const adviceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (advice && adviceRef.current) {
      adviceRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [advice]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAdvice(null);
    const response = await getAiParentingAdvice(question);
    setAdvice(response);
    setLoading(false);
  };

  const predefinedQuestions = [
    "Körpəm gecə çox ağlayır, nə edim?",
    "Hamiləlikdə hansı meyvələr faydalıdır?",
    "2 yaşlı uşağa oyuncaq seçimi",
    "Uşaqda iştahasızlıq"
  ];

  return (
    <section className="bg-white border-2 border-pink-50 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-pink-100/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-pink-100/30 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-3xl shadow-xl shadow-pink-200 mb-8 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {UI_STRINGS.aiAdvisorTitle}
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Hər bir ana bəzən suallarına dərhal cavab istəyir. Bizim süni zəka köməkçimiz 
            sizin üçün 24/7 buradadır.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={UI_STRINGS.aiAdvisorPlaceholder}
              className="flex-grow px-8 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-500 focus:bg-white transition-all text-lg font-medium shadow-inner outline-none"
            />
            <button 
              onClick={handleAsk}
              disabled={loading}
              className="bg-pink-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Düşünürəm...</span>
                </div>
              ) : UI_STRINGS.askAi}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {predefinedQuestions.map((q, i) => (
              <button 
                key={i}
                onClick={() => setQuestion(q)}
                className="text-sm bg-pink-50 text-pink-700 px-4 py-2 rounded-full hover:bg-pink-100 transition-colors font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {advice && (
          <div 
            ref={adviceRef}
            className="mt-12 bg-gradient-to-tr from-pink-50/50 to-orange-50/50 p-10 rounded-[2.5rem] border border-white shadow-xl animate-scale-in"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-md mr-4">
                👩‍⚕️
              </div>
              <h4 className="text-2xl font-bold text-pink-600">Məsləhətiniz Hazırdır</h4>
            </div>
            <div className="prose prose-pink max-w-none text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {advice}
            </div>
            <div className="mt-8 pt-8 border-t border-pink-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-gray-400 font-medium max-w-xs">
                * Bu məsləhət süni zəka tərəfindən yaradılmışdır. Həkim müayinəsini əvəz etmir.
              </p>
              <button 
                onClick={() => {
                  setAdvice(null);
                  setQuestion('');
                }}
                className="text-pink-600 font-bold hover:underline text-sm"
              >
                Yeni sual ver
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AiAdvisor;
