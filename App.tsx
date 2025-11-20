
import React, { useState, useEffect, useRef } from 'react';
import { Question, Topic, Difficulty, QuizResult, UserState, Theme } from './types';
import { INITIAL_QUESTIONS } from './data';
import { generateQuestionByTopic, generateScenarioImage, getChatResponse, parseContentToQuestions } from './services/geminiService';
import { ApiKeyModal } from './components/ApiKeyModal';

// --- UTILS ---
const getTopicTheme = (topic: Topic) => {
  switch (topic) {
    case Topic.CPR: return { icon: 'fa-heart-pulse', color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', bar: 'bg-rose-500' };
    case Topic.BLEEDING: return { icon: 'fa-droplet', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', bar: 'bg-red-600' };
    case Topic.BURNS: return { icon: 'fa-fire', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', bar: 'bg-orange-500' };
    case Topic.FRACTURES: return { icon: 'fa-bone', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-200 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-700', bar: 'bg-slate-500' };
    case Topic.CHOKING: return { icon: 'fa-lungs', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', bar: 'bg-cyan-600' };
    case Topic.ENV_EMERGENCIES: return { icon: 'fa-temperature-high', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', bar: 'bg-yellow-500' };
    case Topic.TRANSPORT: return { icon: 'fa-truck-medical', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', bar: 'bg-blue-600' };
    case Topic.ANATOMY: return { icon: 'fa-person', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', bar: 'bg-purple-500' };
    case Topic.PDF_EXAM: return { icon: 'fa-file-pdf', color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', bar: 'bg-indigo-600' };
    default: return { icon: 'fa-kit-medical', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', bar: 'bg-emerald-500' };
  }
};

const saveStats = (stats: UserState) => {
    localStorage.setItem('cankurtaran_stats_v2', JSON.stringify(stats));
};

const loadStats = (): UserState => {
    const stored = localStorage.getItem('cankurtaran_stats_v2');
    if (stored) return JSON.parse(stored);
    
    const emptyStats: UserState = {
        totalQuizzes: 0,
        totalQuestionsAnswered: 0,
        topicStats: {} as any,
        theme: 'system',
        customQuestions: []
    };
    Object.values(Topic).forEach(t => {
        emptyStats.topicStats[t] = { total: 0, correct: 0 };
    });
    return emptyStats;
};

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- COMPONENTS ---

const BottomNav = ({ currentScreen, setScreen }: { currentScreen: string, setScreen: (s: any) => void }) => (
  <div className="fixed bottom-0 left-0 right-0 glass px-6 py-3 flex justify-around items-center z-50 pb-safe transition-all duration-300">
    <button onClick={() => setScreen('home')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'home' ? 'text-medical-500 scale-105' : 'text-gray-400 dark:text-gray-500'}`}>
        <i className="fa-solid fa-house text-xl"></i>
        <span className="text-[10px] font-bold">Anasayfa</span>
    </button>
    
    <button onClick={() => setScreen('chat')} className={`flex flex-col items-center gap-1 -mt-8 group`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-medical-500/30 transition-all duration-300 ${currentScreen === 'chat' ? 'bg-gradient-to-br from-medical-500 to-medical-600 text-white translate-y-[-4px]' : 'bg-white dark:bg-slate-800 text-gray-400 border border-gray-100 dark:border-gray-700'}`}>
            <i className="fa-solid fa-comment-dots text-2xl group-hover:scale-110 transition-transform"></i>
        </div>
        <span className={`text-[10px] font-bold ${currentScreen === 'chat' ? 'text-medical-500' : 'text-gray-400 dark:text-gray-500'}`}>Asistan</span>
    </button>

    <button onClick={() => setScreen('analytics')} className={`flex flex-col items-center gap-1 transition-all ${currentScreen === 'analytics' ? 'text-medical-500 scale-105' : 'text-gray-400 dark:text-gray-500'}`}>
        <i className="fa-solid fa-chart-pie text-xl"></i>
        <span className="text-[10px] font-bold">Analiz</span>
    </button>
  </div>
);

// Settings Modal (New)
const SettingsScreen = ({ 
    onClose, 
    apiKey, 
    onApiKeyChange, 
    theme, 
    onThemeChange,
    onImportQuestions 
}: { 
    onClose: () => void, 
    apiKey: string, 
    onApiKeyChange: (key: string) => void,
    theme: Theme,
    onThemeChange: (t: Theme) => void,
    onImportQuestions: (text: string) => void
}) => {
    const [inputKey, setInputKey] = useState(apiKey);
    const [importText, setImportText] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async () => {
        if(!importText || !apiKey) return;
        setIsImporting(true);
        await onImportQuestions(importText);
        setImportText('');
        setIsImporting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center z-[60] animate-fade-in p-0 sm:p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl h-[90vh] sm:h-auto flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Ayarlar</h2>
                    <button onClick={onClose} className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Theme */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Görünüm</h3>
                        <div className="bg-gray-50 dark:bg-slate-800 p-1 rounded-xl flex">
                            {(['light', 'system', 'dark'] as Theme[]).map(t => (
                                <button 
                                    key={t}
                                    onClick={() => onThemeChange(t)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${theme === t ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                >
                                    {t === 'light' && <><i className="fa-solid fa-sun mr-2"></i>Aydınlık</>}
                                    {t === 'dark' && <><i className="fa-solid fa-moon mr-2"></i>Karanlık</>}
                                    {t === 'system' && <><i className="fa-solid fa-mobile mr-2"></i>Sistem</>}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* API Key */}
                    <section>
                         <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Yapay Zeka Bağlantısı</h3>
                         <div className="relative">
                            <input 
                                type="password" 
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder="Gemini API Anahtarı"
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-medical-500 outline-none text-gray-900 dark:text-white"
                            />
                            <button 
                                onClick={() => onApiKeyChange(inputKey)}
                                className="absolute right-2 top-2 bg-medical-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-medical-600"
                            >
                                Kaydet
                            </button>
                         </div>
                         <p className="text-[10px] text-gray-400 mt-2 ml-1">
                             Görsel oluşturma, Soru analizi ve Asistan için gereklidir.
                         </p>
                    </section>

                    {/* PDF Import */}
                    <section className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                                <i className="fa-solid fa-file-import"></i>
                            </div>
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-200">Soru Yükle (Akıllı Analiz)</h3>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3 leading-relaxed">
                            Elinizdeki PDF sınavlarının metinlerini buraya yapıştırın. Yapay zeka sizin için soruları ayıklayıp uygulamaya eklesin.
                        </p>
                        <textarea 
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Soru metinlerini buraya yapıştırın..."
                            className="w-full h-24 bg-white dark:bg-slate-900 rounded-xl p-3 text-xs mb-3 border border-indigo-100 dark:border-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-gray-300"
                        />
                        <button 
                            onClick={handleImport}
                            disabled={isImporting || !inputKey}
                            className={`w-full py-3 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
                                isImporting ? 'bg-gray-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {isImporting ? 'Analiz Ediliyor...' : 'Soruları Analiz Et ve Ekle'}
                            {!isImporting && <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        </button>
                    </section>

                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-900/80 text-center">
                     <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Geliştirici</p>
                     <p className="text-lg font-extrabold text-gray-800 dark:text-gray-200">Vet. Sinan</p>
                     <p className="text-[10px] text-gray-400 mt-1">CanKurtaran v2.0 Pro</p>
                </div>
            </div>
        </div>
    )
}

// 1. Analytics Screen
const AnalyticsScreen = ({ stats, onTrainWeakness }: { stats: UserState, onTrainWeakness: () => void }) => {
    const topics = Object.values(Topic).filter(t => t !== Topic.GENERAL);
    
    const weakTopics = topics.filter(t => {
        const s = stats.topicStats[t];
        return s && s.total > 0 && (s.correct / s.total) < 0.6;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 animate-fade-in">
             <div className="bg-white dark:bg-slate-900 px-6 py-6 shadow-sm dark:shadow-none mb-6 sticky top-0 z-10">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Gelişim Analizi</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Performans istatistiklerin</p>
            </div>

            <div className="px-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Toplam Soru</div>
                        <div className="text-3xl font-black text-gray-800 dark:text-white mt-1">{stats.totalQuestionsAnswered}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Tamamlanan Ders</div>
                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.totalQuizzes}</div>
                    </div>
                </div>

                {weakTopics.length > 0 ? (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Eksiklerin Var!</h3>
                            <p className="text-white/90 text-sm mb-4 text-balance leading-relaxed">
                                {weakTopics.length} konuda başarı oranın düşük. Senin için özel bir çalışma programı hazırladık.
                            </p>
                            <button 
                                onClick={onTrainWeakness}
                                className="bg-white text-orange-600 px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg active:scale-95 transition-transform"
                            >
                                EKSİKLERİ KAPAT <i className="fa-solid fa-bolt ml-1"></i>
                            </button>
                        </div>
                        <i className="fa-solid fa-triangle-exclamation absolute -right-4 -bottom-4 text-9xl opacity-10"></i>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Harika Gidiyorsun!</h3>
                                <p className="text-white/90 text-sm">Kritik bir eksiğin görünmüyor.</p>
                            </div>
                         </div>
                    </div>
                )}

                <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 ml-1">Konu Bazlı Başarı</h3>
                    <div className="space-y-4">
                        {topics.map(topic => {
                            const s = stats.topicStats[topic] || { total: 0, correct: 0 };
                            const theme = getTopicTheme(topic);
                            const percentage = s.total === 0 ? 0 : Math.round((s.correct / s.total) * 100);
                            
                            return (
                                <div key={topic} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center`}>
                                            <i className={`fa-solid ${theme.icon}`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{topic}</h4>
                                            <div className="text-xs text-gray-400">{s.correct} / {s.total} Doğru</div>
                                        </div>
                                        <div className="font-black text-xl text-gray-800 dark:text-gray-100">%{percentage}</div>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${theme.bar}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. Question Screen 
interface QuestionCardProps {
  question: Question;
  onResult: (isCorrect: boolean) => void;
  onNext: () => void;
  apiKey: string;
  currentStep: number;
  totalSteps: number;
  onExit: () => void;
}

const QuestionScreen: React.FC<QuestionCardProps> = ({ question, onResult, onNext, apiKey, currentStep, totalSteps, onExit }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false); 
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsChecked(false);
    
    let isMounted = true;
    const fetchImage = async () => {
      if (apiKey && !question.imageUrl) {
        setLoadingImage(true);
        setImageUrl(null);
        const url = await generateScenarioImage(apiKey, question.text);
        if (isMounted) {
          setImageUrl(url);
          setLoadingImage(false);
        }
      } else {
        setImageUrl(question.imageUrl || null);
        setLoadingImage(false);
      }
    };
    fetchImage();
    return () => { isMounted = false; };
  }, [question, apiKey]);

  const handleCheck = () => {
    if (selectedOption === null) return;
    setIsChecked(true);
    onResult(selectedOption === question.correctAnswer);
  };

  const theme = getTopicTheme(question.topic);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col safe-bottom">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-30">
        <button onClick={onExit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 bg-gray-100 dark:bg-slate-800 rounded-full w-10 h-10 flex items-center justify-center">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
        <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-medical-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs font-black text-gray-400 dark:text-gray-500 w-10 text-right">
           {currentStep}/{totalSteps}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32 max-w-2xl mx-auto w-full no-scrollbar">
        <div className="mb-4 flex flex-wrap items-center gap-2">
             <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400`}>{question.topic}</span>
             <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${question.difficulty === Difficulty.HARD ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>{question.difficulty}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-6 leading-snug tracking-tight">
          {question.text}
        </h1>

        {/* Image */}
        <div className="w-full aspect-video rounded-3xl bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 mb-8 overflow-hidden relative shadow-sm flex items-center justify-center">
            {loadingImage ? (
                <div className="flex flex-col items-center text-gray-400 animate-pulse">
                    <i className="fa-solid fa-wand-magic-sparkles mb-2 text-2xl text-medical-400"></i>
                    <span className="text-xs font-bold uppercase tracking-widest">AI Görseli</span>
                </div>
            ) : imageUrl ? (
                <img src={imageUrl} alt="Scenario" className="w-full h-full object-cover" />
            ) : (
                <div className={`flex flex-col items-center justify-center ${theme.color} opacity-50`}>
                    <i className={`fa-solid ${theme.icon} text-6xl mb-2`}></i>
                </div>
            )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correctAnswer;
            
            let styleClass = "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-[0.99]";
            
            if (isChecked) {
                if (isCorrect) styleClass = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400";
                else if (isSelected && !isCorrect) styleClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400";
                else styleClass = "border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 text-gray-400 opacity-50";
            } else if (isSelected) {
                styleClass = "border-medical-500 bg-medical-50 dark:bg-medical-900/20 text-medical-800 dark:text-medical-400 ring-1 ring-medical-500";
            }

            return (
              <button
                key={idx}
                onClick={() => !isChecked && setSelectedOption(idx)}
                disabled={isChecked}
                className={`w-full p-5 rounded-2xl text-left font-bold transition-all flex items-start border-2 ${styleClass}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 mr-3 text-[10px] ${
                    isSelected || (isChecked && isCorrect) ? 'border-current' : 'border-gray-300 dark:border-slate-600 text-gray-400'
                }`}>
                    {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 text-sm sm:text-base leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {!isChecked ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-5px_25px_rgba(0,0,0,0.05)] z-40 safe-bottom">
           <div className="max-w-2xl mx-auto">
               <button 
                onClick={handleCheck}
                disabled={selectedOption === null}
                className={`w-full py-4 rounded-2xl font-extrabold text-lg shadow-lg transition-all ${
                    selectedOption !== null 
                    ? 'bg-medical-600 text-white hover:bg-medical-700 shadow-medical-200 dark:shadow-none transform hover:-translate-y-1' 
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                }`}
               >
                KONTROL ET
               </button>
           </div>
        </div>
      ) : (
        <div className={`fixed bottom-0 left-0 right-0 p-6 pb-8 animate-slide-up z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.1)] ${selectedOption === question.correctAnswer ? 'bg-green-50 dark:bg-green-900/90' : 'bg-red-50 dark:bg-red-900/90'} backdrop-blur-lg border-t ${selectedOption === question.correctAnswer ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedOption === question.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} text-xl shadow-lg`}>
                        <i className={`fa-solid ${selectedOption === question.correctAnswer ? 'fa-check' : 'fa-xmark'}`}></i>
                    </div>
                    <div>
                        <h3 className={`text-xl font-extrabold mb-1 ${selectedOption === question.correctAnswer ? 'text-green-900 dark:text-white' : 'text-red-900 dark:text-white'}`}>
                            {selectedOption === question.correctAnswer ? 'Doğru Cevap!' : 'Yanlış Cevap'}
                        </h3>
                        <p className={`text-sm leading-relaxed ${selectedOption === question.correctAnswer ? 'text-green-800 dark:text-green-100' : 'text-red-800 dark:text-red-100'}`}>
                            {question.explanation}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onNext}
                    className={`w-full py-4 rounded-2xl font-extrabold text-lg shadow-lg transform transition-transform active:scale-95 ${
                        selectedOption === question.correctAnswer 
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200 dark:shadow-none' 
                        : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 dark:shadow-none'
                    }`}
                >
                    DEVAM ET
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

// 3. Result Screen with Weakness Analysis
const ResultScreen = ({ result, onHome, onTrainWeakness, weakTopicsFound }: { result: QuizResult, onHome: () => void, onTrainWeakness: () => void, weakTopicsFound: Topic[] }) => {
    const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
    const isSuccess = percentage >= 70;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center p-6 animate-fade-in overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-2xl ${isSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400'}`}>
                    <i className={`fa-solid ${isSuccess ? 'fa-trophy' : 'fa-book-medical'} text-6xl`}></i>
                </div>
                
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {isSuccess ? 'Tebrikler!' : 'Tamamlandı'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-8 text-center">
                    {isSuccess 
                        ? 'Harika bir sonuç. İlkyardım bilgilerin çok taze.' 
                        : 'Bazı konularda eksiklerin var, ama sorun değil.'}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="bg-gray-50 dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">DOĞRU</div>
                        <div className="text-4xl font-black text-green-600 dark:text-green-500">{result.correctAnswers}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">YANLIŞ</div>
                        <div className="text-4xl font-black text-red-500">{result.totalQuestions - result.correctAnswers}</div>
                    </div>
                </div>

                {weakTopicsFound.length > 0 && (
                    <div className="w-full bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-5 rounded-3xl mb-6 text-left">
                        <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-triangle-exclamation"></i> Gelişim Alanları
                        </h3>
                        <ul className="list-disc list-inside text-orange-700 dark:text-orange-400 text-sm space-y-1 mb-4 pl-1">
                            {weakTopicsFound.slice(0,3).map(t => <li key={t}>{t}</li>)}
                        </ul>
                        <button 
                            onClick={onTrainWeakness}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none transition-all"
                        >
                            Eksikleri Kapat
                        </button>
                    </div>
                )}

                <button 
                    onClick={onHome}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-extrabold text-lg shadow-xl hover:scale-[1.02] transition-transform"
                >
                    ANASAYFAYA DÖN
                </button>
            </div>
        </div>
    );
};

// 4. Chat Screen (AI Assistant)
const ChatScreen = ({ messages, onSendMessage, apiKey, onOpenSettings }: { 
  messages: ChatMessage[], 
  onSendMessage: (text: string) => void,
  apiKey: string,
  onOpenSettings: () => void
}) => {
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setIsSending(true);
        await onSendMessage(input);
        setInput('');
        setIsSending(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col pb-24">
             {/* Chat Header */}
             <div className="bg-white dark:bg-slate-900 px-4 py-3 shadow-sm sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                         <i className="fa-solid fa-robot text-lg"></i>
                     </div>
                     <div>
                         <h2 className="font-extrabold text-gray-800 dark:text-white text-lg leading-none">AI Asistan</h2>
                         <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">İlkyardım Rehberiniz</p>
                     </div>
                </div>
             </div>

             {/* Messages */}
             <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 dark:text-gray-600 opacity-70 mt-10">
                        <i className="fa-regular fa-comments text-6xl mb-4"></i>
                        <p className="text-sm font-bold mb-2">Henüz bir şey sormadınız.</p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                            {["Kanama nasıl durdurulur?", "Yanığa ne iyi gelir?", "Kalp masajı hızı nedir?"].map(suggestion => (
                                <button 
                                    key={suggestion}
                                    onClick={() => onSendMessage(suggestion)}
                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!apiKey && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 flex flex-col items-center text-center mx-4">
                        <i className="fa-solid fa-lock text-yellow-600 dark:text-yellow-500 text-3xl mb-3"></i>
                        <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">Asistan Kilitli</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">Yapay zeka ile sohbet etmek için API Anahtarı girmelisiniz.</p>
                        <button onClick={onOpenSettings} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">
                            Ayarları Aç
                        </button>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-medical-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-800 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {isSending && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
             </div>

             {/* Input */}
             <div className="fixed bottom-20 left-0 right-0 px-4 z-40 safe-bottom">
                <div className="flex gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-slate-800">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!apiKey || isSending}
                        placeholder={apiKey ? "Bir soru sorun..." : "API Anahtarı Gerekli"}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-3 pl-4 text-gray-800 dark:text-white placeholder-gray-400"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || !apiKey || isSending}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                            input.trim() && apiKey && !isSending ? 'bg-medical-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                        }`}
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
             </div>
        </div>
    );
};


// --- MAIN APP ---
export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [screen, setScreen] = useState<'home' | 'quiz' | 'result' | 'analytics' | 'chat'>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [userStats, setUserStats] = useState<UserState>(loadStats());
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<{id: string, correct: boolean}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Ders Hazırlanıyor...");

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Theme Logic
  useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (userStats.theme === 'system') {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              root.classList.add('dark');
          } else {
              root.classList.add('light');
          }
      } else {
          root.classList.add(userStats.theme);
      }
  }, [userStats.theme]);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) setApiKey(stored);
  }, []);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };
  
  const handleImportQuestions = async (text: string) => {
      setLoading(true);
      setLoadingText("Sorular Analiz Ediliyor...");
      const newQuestions = await parseContentToQuestions(apiKey, text);
      
      if (newQuestions.length > 0) {
          const newStats = { ...userStats, customQuestions: [...(userStats.customQuestions || []), ...newQuestions] };
          setUserStats(newStats);
          saveStats(newStats);
          alert(`${newQuestions.length} adet soru başarıyla eklendi! 'PDF / Çıkmış Sorular' bölümünden ulaşabilirsiniz.`);
          setShowSettings(false);
      } else {
          alert("Soru ayrıştırılamadı. Lütfen metni kontrol edip tekrar deneyin.");
      }
      setLoading(false);
  };

  const handleThemeChange = (theme: Theme) => {
      const newStats = { ...userStats, theme };
      setUserStats(newStats);
      saveStats(newStats);
  };

  const handleSendMessage = async (text: string) => {
      const newHistory = [...chatHistory, { role: 'user', text } as ChatMessage];
      setChatHistory(newHistory);

      try {
          const apiHistory = newHistory.slice(0, -1).map(msg => ({
              role: msg.role,
              parts: [{ text: msg.text }]
          }));
          const response = await getChatResponse(apiKey, text, apiHistory);
          setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      } catch (error) {
          setChatHistory(prev => [...prev, { role: 'model', text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." }]);
      }
  };

  const startQuiz = async (mode: 'TOPIC' | 'GENERAL' | 'WEAKNESS', topic?: Topic) => {
    setLoading(true);
    setLoadingText(mode === 'WEAKNESS' ? "Eksiklerin Analiz Ediliyor..." : "Sınav Hazırlanıyor...");
    
    let questions: Question[] = [];

    if (mode === 'TOPIC' && topic) {
        if (topic === Topic.PDF_EXAM) {
            // Only from custom questions
            questions = (userStats.customQuestions || []).filter(q => q.topic === Topic.PDF_EXAM);
        } else {
            questions = INITIAL_QUESTIONS.filter(q => q.topic === topic);
            
            // If not enough hardcoded questions, we might want to generate or use GENERAL fallback
            // But for now, we rely on INITIAL_QUESTIONS having enough.
        }
    } else if (mode === 'WEAKNESS') {
        const weakTopics = Object.values(Topic).filter(t => {
             const s = userStats.topicStats[t];
             return s && s.total > 0 && (s.correct / s.total) < 0.6;
        });
        questions = INITIAL_QUESTIONS.filter(q => weakTopics.includes(q.topic));
    } else {
        // General Exam
        questions = [...INITIAL_QUESTIONS, ...(userStats.customQuestions || [])];
    }

    // Shuffle and Limit to 20
    questions = questions.sort(() => Math.random() - 0.5).slice(0, 20); 

    if (questions.length === 0) {
        alert("Bu konuda henüz soru bulunmuyor. Lütfen önce soru yükleyin veya başka bir konu seçin.");
        setLoading(false);
        return;
    }

    setQuizQuestions(questions);
    setCurrentQIndex(0);
    setSessionResults([]);
    setScreen('quiz');
    setLoading(false);
  };

  const handleQuestionResult = (isCorrect: boolean) => {
    const currentQ = quizQuestions[currentQIndex];
    setSessionResults(prev => [...prev, { id: currentQ.id, correct: isCorrect }]);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < quizQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const newStats = { ...userStats };
    newStats.totalQuizzes += 1;
    newStats.totalQuestionsAnswered += sessionResults.length;

    sessionResults.forEach((res, idx) => {
        const q = quizQuestions[idx];
        if (!newStats.topicStats[q.topic]) newStats.topicStats[q.topic] = { total: 0, correct: 0 };
        
        newStats.topicStats[q.topic].total += 1;
        if (res.correct) newStats.topicStats[q.topic].correct += 1;
    });

    saveStats(newStats);
    setUserStats(newStats);
    setScreen('result');
  };

  const getWeakTopicsForResult = (): Topic[] => {
      const sessionWeakness: Record<string, {total: number, correct: number}> = {};
      sessionResults.forEach((res, idx) => {
          const q = quizQuestions[idx];
          if(!sessionWeakness[q.topic]) sessionWeakness[q.topic] = {total:0, correct:0};
          sessionWeakness[q.topic].total++;
          if(res.correct) sessionWeakness[q.topic].correct++;
      });
      return Object.keys(sessionWeakness)
        .filter(t => (sessionWeakness[t].correct / sessionWeakness[t].total) < 0.5) as Topic[];
  };

  const hasCustomQuestions = userStats.customQuestions && userStats.customQuestions.length > 0;

  // Render Helpers
  const HomeScreen = () => (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* App Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-9 h-9 bg-medical-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-medical-500/30">
                     <i className="fa-solid fa-heart-pulse"></i>
                   </div>
                   <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-xl">CanKurtaran</span>
                </div>
                <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all">
                    <i className="fa-solid fa-sliders"></i>
                </button>
            </div>

            <div className="px-5 pt-6 space-y-6">
                {/* Hero Cards */}
                <div onClick={() => startQuiz('GENERAL')} className="bg-gradient-to-br from-gray-900 to-slate-800 dark:from-slate-800 dark:to-black rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden cursor-pointer group transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                             <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-100 border border-white/10">GÜNLÜK ANTRENMAN</div>
                        </div>
                        <h2 className="font-black text-2xl mb-2 leading-tight">Genel Deneme<br/>Sınavı</h2>
                        <p className="text-gray-400 text-sm mb-6 font-medium">20 soruluk karışık, zorlu deneme sınavı ile kendini test et.</p>
                        <div className="inline-flex bg-white text-gray-900 px-5 py-3 rounded-xl font-extrabold text-sm items-center shadow-lg gap-2">
                            BAŞLA <i className="fa-solid fa-arrow-right"></i>
                        </div>
                    </div>
                    <div className="absolute right-[-10px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
                        <i className="fa-solid fa-star-of-life text-[10rem]"></i>
                    </div>
                </div>
                
                {/* PDF / Import Card - ONLY SHOW IF CONTENT EXISTS */}
                {hasCustomQuestions && (
                    <div onClick={() => startQuiz('TOPIC', Topic.PDF_EXAM)} className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden cursor-pointer group transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-indigo-200 text-sm font-bold">
                                <i className="fa-solid fa-file-pdf"></i>
                                <span>ÇIKMIŞ SORULAR</span>
                            </div>
                            <h2 className="font-black text-xl mb-1">PDF Sınavları</h2>
                            <p className="text-indigo-100 text-xs mb-0 font-medium opacity-80">{userStats.customQuestions.length} Soru Yüklendi</p>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-30 transition-opacity">
                            <i className="fa-solid fa-clipboard-question text-6xl"></i>
                        </div>
                    </div>
                )}

                {/* Topics List */}
                <div>
                    <h3 className="font-extrabold text-gray-400 dark:text-gray-500 text-xs tracking-widest uppercase mb-4 ml-1">Eğitim Konuları</h3>
                    <div className="grid gap-4">
                        {Object.values(Topic).filter(t => t !== Topic.GENERAL && t !== Topic.PDF_EXAM).map((topic, idx) => {
                            const theme = getTopicTheme(topic);
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => startQuiz('TOPIC', topic)}
                                    className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.color} flex items-center justify-center text-xl shadow-inner`}>
                                        <i className={`fa-solid ${theme.icon}`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-tight mb-1 group-hover:text-medical-600 transition-colors">{topic}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-12 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${theme.bar} w-3/4`}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">20 Soru</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 dark:text-slate-600 group-hover:text-medical-500 transition-colors">
                                        <i className="fa-solid fa-chevron-right text-xs"></i>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
  );

  return (
    <>
      {showSettings && (
        <SettingsScreen 
            onClose={() => setShowSettings(false)}
            apiKey={apiKey}
            onApiKeyChange={handleSaveKey}
            theme={userStats.theme}
            onThemeChange={handleThemeChange}
            onImportQuestions={handleImportQuestions}
        />
      )}

      {loading ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-950 z-50">
            <div className="w-16 h-16 border-4 border-gray-100 dark:border-slate-800 border-t-medical-600 rounded-full animate-spin mb-4"></div>
            <h3 className="font-bold text-gray-800 dark:text-white animate-pulse">{loadingText}</h3>
        </div>
      ) : screen === 'home' ? (
        <>
            <HomeScreen />
            <BottomNav currentScreen="home" setScreen={setScreen} />
        </>
      ) : screen === 'analytics' ? (
        <>
            <AnalyticsScreen stats={userStats} onTrainWeakness={() => startQuiz('WEAKNESS')} />
            <BottomNav currentScreen="analytics" setScreen={setScreen} />
        </>
      ) : screen === 'chat' ? (
        <>
            <ChatScreen 
                messages={chatHistory} 
                onSendMessage={handleSendMessage} 
                apiKey={apiKey}
                onOpenSettings={() => setShowSettings(true)}
            />
            <BottomNav currentScreen="chat" setScreen={setScreen} />
        </>
      ) : screen === 'quiz' ? (
        <QuestionScreen 
            question={quizQuestions[currentQIndex]}
            onResult={handleQuestionResult}
            onNext={handleNextQuestion}
            apiKey={apiKey}
            currentStep={currentQIndex + 1}
            totalSteps={quizQuestions.length}
            onExit={() => setScreen('home')}
        />
      ) : (
        <ResultScreen 
            result={{
                score: 0,
                totalQuestions: quizQuestions.length,
                correctAnswers: sessionResults.filter(r => r.correct).length,
                level: '',
                topicBreakdown: {} as any
            }}
            onHome={() => setScreen('home')}
            onTrainWeakness={() => startQuiz('WEAKNESS')}
            weakTopicsFound={getWeakTopicsForResult()}
        />
      )}
    </>
  );
}
