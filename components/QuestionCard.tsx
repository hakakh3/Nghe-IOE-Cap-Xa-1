
import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import Button from './Button';
import AudioPlayer from './AudioPlayer';

interface QuestionCardProps {
  question: Question;
  onAnswer: (response: string) => void;
  isAnswered: boolean;
  userAnswer?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isAnswered, userAnswer }) => {
  const [inputVal, setInputVal] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintInfo, setHintInfo] = useState<{ length?: number, firstChar?: string, text?: string }>({});

  useEffect(() => {
    setInputVal('');
    setShowHint(false);
    setHintInfo({});
  }, [question.id]);

  const normalize = (str?: string) => str ? str.replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase() : "";
  const isCorrect = () => userAnswer && normalize(userAnswer) === normalize(question.correctAnswer);

  const handleMCSelect = (opt: string) => {
    if (!isAnswered) {
      onAnswer(opt);
    }
  };

  const handleInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAnswered && inputVal.trim()) {
      onAnswer(inputVal.trim());
    }
  };

  const generateHint = () => {
    if (Object.keys(hintInfo).length > 0) return;
    
    if (question.type === QuestionType.FILL_IN_BLANK) {
      const ans = question.correctAnswer.trim();
      setHintInfo({
        length: ans.length,
        firstChar: ans.charAt(0).toUpperCase(),
        text: "Gợi ý: Hãy lắng nghe thật kỹ từ còn thiếu."
      });
    } else {
      setHintInfo({
        text: "Gợi ý: Một trong 4 đáp án bên dưới là câu trả lời chính xác."
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
              {question.type.replace(/_/g, ' ')}
            </span>
            {!isAnswered && (
              <button 
                onClick={() => { generateHint(); setShowHint(!showHint); }} 
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase border-2 rounded-full bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 transition-all shadow-sm"
              >
                <span>{showHint ? 'Ẩn Gợi ý' : 'Gợi ý 💡'}</span>
              </button>
            )}
          </div>
          <span className="text-[10px] font-black text-slate-300 tracking-widest">#{question.id}</span>
        </div>
        
        <div className="p-8 sm:p-12">
          <div className="mb-10 space-y-4">
            {question.audioUrl && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                <AudioPlayer src={question.audioUrl} />
              </div>
            )}
          </div>

          {showHint && !isAnswered && (
            <div className="mb-10 bg-amber-50 p-6 rounded-2xl text-sm text-amber-900 border-2 border-amber-100 shadow-inner animate-fade-in">
              <div className="flex flex-col gap-3 font-bold">
                {hintInfo.length && (
                  <p className="flex items-center gap-3">
                    <span className="bg-amber-200 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">📏</span> 
                    Từ có: <span className="text-indigo-600 text-lg">{hintInfo.length} chữ cái</span>
                  </p>
                )}
                {hintInfo.firstChar && (
                  <p className="flex items-center gap-3">
                    <span className="bg-amber-200 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">🔤</span> 
                    Bắt đầu bằng: <span className="text-indigo-600 text-2xl uppercase underline underline-offset-4 decoration-indigo-200">"{hintInfo.firstChar}"</span>
                  </p>
                )}
                {hintInfo.text && (
                  <p className="italic text-amber-700 mt-2 flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">ℹ️</span>
                    {hintInfo.text}
                  </p>
                )}
              </div>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-12 leading-relaxed tracking-tight italic">
            "{question.questionText}"
          </h2>

          {question.type === QuestionType.MULTIPLE_CHOICE && (
            <div className="grid grid-cols-1 gap-5">
              {question.options?.map((opt, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleMCSelect(opt)} 
                  disabled={isAnswered} 
                  className={`w-full p-6 rounded-2xl text-left border-4 transition-all font-black text-xl flex items-center gap-5 shadow-sm active:scale-[0.98] ${
                    isAnswered 
                      ? (opt === question.correctAnswer 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-200 scale-[1.02]' 
                          : opt === userAnswer 
                            ? 'bg-rose-500 border-rose-500 text-white opacity-80' 
                            : 'bg-slate-50 opacity-40 text-slate-400 border-slate-100'
                        ) 
                      : 'bg-white border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-700'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 font-black ${isAnswered && opt === question.correctAnswer ? 'bg-white/20 border-white' : 'bg-slate-50 border-slate-200'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {question.type === QuestionType.FILL_IN_BLANK && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-5">
                <input 
                  type="text" 
                  value={isAnswered && userAnswer ? userAnswer : inputVal} 
                  onChange={(e) => setInputVal(e.target.value)} 
                  onKeyDown={(e) => { if(e.key === 'Enter' && !isAnswered) handleInputSubmit(); }}
                  disabled={isAnswered} 
                  autoFocus
                  className={`flex-1 p-6 rounded-[2rem] border-4 font-black text-2xl outline-none transition-all shadow-inner ${
                    isAnswered 
                      ? (isCorrect() ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-rose-500 bg-rose-50 text-rose-800') 
                      : 'border-slate-100 bg-slate-50 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-100'
                  }`} 
                  placeholder="Gõ từ nghe được..." 
                />
                {!isAnswered && (
                  <button 
                    onClick={handleInputSubmit}
                    className="px-10 py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-90 transition-all text-xl"
                  >
                    NỘP BÀI
                  </button>
                )}
              </div>
              {!isAnswered && <div className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">Nhấn ENTER để nộp nhanh</div>}
            </div>
          )}

          {isAnswered && (
            <div className={`mt-14 p-8 rounded-[3rem] border-l-[12px] shadow-2xl animate-fade-in ${isCorrect() ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
              <div className="flex items-start gap-7">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 text-white font-black text-3xl shadow-xl ${isCorrect() ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'}`}>
                  {isCorrect() ? '✓' : '✕'}
                </div>
                <div>
                  <h3 className={`font-black text-3xl mb-3 tracking-tight ${isCorrect() ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {isCorrect() ? 'TUYỆT VỜI, CHÍNH XÁC!' : 'CỐ GẮNG LẦN SAU NHÉ!'}
                  </h3>
                  {!isCorrect() && (
                    <div className="mb-5">
                      <span className="text-rose-400 font-black text-[10px] uppercase tracking-widest block mb-1">Đáp án đúng phải là:</span> 
                      <span className="font-black text-rose-600 text-4xl underline decoration-rose-200 decoration-8 underline-offset-4 tracking-tight">{question.correctAnswer.toUpperCase()}</span>
                    </div>
                  )}
                  <p className="text-slate-600 font-bold leading-relaxed text-lg italic opacity-90">"{question.explanation}"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
