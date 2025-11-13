import React, { useState, useEffect } from 'react';
import { PhotoshootPlan, ImageAnalysis } from '../types';
import { LocationMarkerIcon, ClockIcon, SunIcon, SparklesIcon, DocumentTextIcon, MoonIcon, LightBulbIcon, CameraIcon } from './icons/CardIcons';
import WeatherDisplay from './WeatherDisplay';
import { getFollowUpAnswer, generateMoodImages, analyzeImage } from '../services/geminiService';

interface PlanningResultProps {
  plan: PhotoshootPlan;
  onReset: () => void;
  onSavePlan: (plan: PhotoshootPlan) => void;
  onGoToProfile: () => void;
  isSaved: boolean;
  isLoggedIn: boolean;
}

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode, className?: string }> = ({ icon, title, children, className }) => (
    <div className={`bg-gray-800/60 p-5 rounded-lg border border-gray-700 h-full flex flex-col ${className}`}>
        <div className="flex items-center mb-3">
            {icon}
            <h4 className="text-lg font-semibold ml-2 text-white">{title}</h4>
        </div>
        <div className="text-gray-300 text-sm space-y-2 flex-grow">
            {children}
        </div>
    </div>
);

const PlanningResult: React.FC<PlanningResultProps> = ({ plan, onReset, onSavePlan, onGoToProfile, isSaved, isLoggedIn }) => {
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [conversation, setConversation] = useState<{ question: string; answer: string }[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [followUpError, setFollowUpError] = useState('');
  
  const [moodImages, setMoodImages] = useState<(string | null)[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(true);
  
  const [analyses, setAnalyses] = useState<(ImageAnalysis | null)[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchMoodImages = async () => {
        if (plan?.moodImagePrompts && plan.moodImagePrompts.length > 0) {
            setIsGeneratingImages(true);
            const images = await generateMoodImages(plan.moodImagePrompts);
            setMoodImages(images);
            setAnalyses(new Array(images.length).fill(null));
            setIsAnalyzing(new Array(images.length).fill(false));
            setIsGeneratingImages(false);
        }
    };
    fetchMoodImages();
  }, [plan]);


  const handleAnalyzeImage = async (index: number) => {
      const imageBase64 = moodImages[index];
      if (!imageBase64 || analyses[index]) return; // Don't re-analyze

      setIsAnalyzing(prev => {
          const newAnalyzing = [...prev];
          newAnalyzing[index] = true;
          return newAnalyzing;
      });

      try {
          const result = await analyzeImage(imageBase64);
          setAnalyses(prev => {
              const newAnalyses = [...prev];
              newAnalyses[index] = result;
              return newAnalyses;
          });
      } catch (error) {
          console.error("Analysis failed:", error);
          alert("Bildanalyse fehlgeschlagen.");
      } finally {
          setIsAnalyzing(prev => {
              const newAnalyzing = [...prev];
              newAnalyzing[index] = false;
              return newAnalyzing;
          });
      }
  };


  const suggestionChips = [
    "Welche Kameraeinstellungen empfiehlst du?",
    "Simuliere das Ergebnis mit einem 50mm f/1.8 Objektiv.",
    "Gibt es alternative Perspektiven vor Ort?",
  ];

  const handleAskFollowUp = async (question: string) => {
    if (!question.trim()) return;

    setIsAnswering(true);
    setFollowUpError('');
    
    // Optimistic UI update for the question
    const currentQuestion = question;
    setConversation(prev => [...prev, { question: currentQuestion, answer: "..." }]);
    setFollowUpQuestion(''); // Clear input immediately

    try {
      const answer = await getFollowUpAnswer(plan, currentQuestion);
      // Update the last entry with the real answer
      setConversation(prev => prev.map((entry, index) => index === prev.length - 1 ? { ...entry, answer } : entry));
    } catch (e: any) {
      setFollowUpError(e.message || 'Ein Fehler ist aufgetreten.');
      // Remove the optimistic entry on error
      setConversation(prev => prev.slice(0, prev.length - 1));
    } finally {
      setIsAnswering(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAskFollowUp(followUpQuestion);
  }

  const handleChipClick = (question: string) => {
    setFollowUpQuestion(question);
  }


  if (!plan) {
    return (
      <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Fehler</h3>
        <p className="text-gray-400">Der Plan konnte nicht geladen werden.</p>
        <button onClick={onReset} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Erneut versuchen</button>
      </div>
    );
  }

  return (
    <div className="text-gray-200 w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-red-400 mb-2">{plan.title}</h2>
        <p className="text-lg text-gray-400">Dein persönlicher Shooting-Plan</p>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => setIsBriefingOpen(!isBriefingOpen)}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all text-lg btn-primary-glow"
        >
          <CameraIcon className="w-6 h-6" />
          {isBriefingOpen ? 'Creative Briefing ausblenden' : 'Creative Briefing anzeigen'}
          <span className={`transform transition-transform ${isBriefingOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      {/* Creative Briefing */}
      {isBriefingOpen && (
        <InfoCard icon={<CameraIcon className="w-6 h-6 text-red-400" />} title="Creative Briefing" className="mb-6">
          <div>
              <h5 className="font-semibold text-base text-white mb-2">Kreative Vision</h5>
              <p className="text-gray-300 italic mb-4">"{plan.creativeVision}"</p>
              <h5 className="font-semibold text-base text-white mb-2">Shot-Liste</h5>
              <ul className="list-disc list-inside space-y-1 mb-6">
                  {plan.shotList.map((shot, index) => <li key={index}>{shot}</li>)}
              </ul>
              
              <h5 className="font-semibold text-base text-white mb-2">Living Moodboard</h5>
              <p className="text-xs text-gray-400 mb-3">Führe eine visuelle Analyse durch, um die Bildsprache und Farbpalette zu verstehen.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isGeneratingImages ? (
                      Array.from({ length: 2 }).map((_, index) => (
                          <div key={index} className="aspect-video bg-gray-700/50 rounded animate-pulse"></div>
                      ))
                  ) : (
                      moodImages.map((img, index) => (
                          <div key={index} className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                              <div className="aspect-video bg-gray-900 rounded overflow-hidden mb-2">
                                  {img ? <img src={`data:image/png;base64,${img}`} alt={`Moodboard Bild ${index + 1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Fehler</div>}
                              </div>

                              {analyses[index] ? (
                                  <div className="p-2">
                                      <h6 className="font-semibold text-sm mb-1 text-red-400">Fotografische Elemente</h6>
                                      <ul className="list-disc list-inside text-xs space-y-0.5 mb-2">
                                          {analyses[index]!.photographicElements.map((el, i) => <li key={i}>{el}</li>)}
                                      </ul>
                                      <h6 className="font-semibold text-sm mb-1 text-red-400">Farbpalette</h6>
                                      <div className="flex gap-1">
                                          {analyses[index]!.colorPalette.map((color, i) => (
                                              <div key={i} title={color} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: color }}></div>
                                          ))}
                                      </div>
                                  </div>
                              ) : (
                                  <button onClick={() => handleAnalyzeImage(index)} disabled={isAnalyzing[index] || !img} className="w-full text-xs font-semibold py-1.5 px-3 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 transition-colors">
                                      {isAnalyzing[index] ? 'Analysiere...' : 'Visuelle Analyse'}
                                  </button>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </div>
        </InfoCard>
      )}


      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Spot Info */}
        <div className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 md:col-span-2">
            <div className="flex items-center mb-2">
                <LocationMarkerIcon className="w-6 h-6 mr-2 text-red-400" />
                <h3 className="text-2xl font-bold text-white">{plan.spot.name}</h3>
            </div>
            <p className="text-gray-300">{plan.spot.description}</p>
        </div>

        {/* Travel Plan */}
        <InfoCard icon={<ClockIcon className="w-5 h-5 text-red-400" />} title="Reiseplan">
            <p><span className="font-semibold">Abfahrt:</span> {plan.travelPlan.departureTime}</p>
            <p>{plan.travelPlan.notes}</p>
        </InfoCard>

        {/* Weather */}
        <InfoCard icon={<SunIcon className="w-5 h-5 text-red-400" />} title="Wetter & Licht">
            <WeatherDisplay weather={plan.weatherForecast} isLoading={false} />
            <p className="mt-2">{plan.weatherForecast.notes}</p>
            <div className="mt-2 flex items-center"><SunIcon className="w-4 h-4 mr-2" /><p><span className="font-semibold">Licht:</span> {plan.lightingAnalysis.condition}</p></div>
            <div className="flex items-center"><MoonIcon className="w-4 h-4 mr-2" /><p><span className="font-semibold">Lichtverschmutzung:</span> {plan.lightingAnalysis.lightPollution}</p></div>
        </InfoCard>

        {/* Equipment */}
        <InfoCard icon={<DocumentTextIcon className="w-5 h-5 text-red-400" />} title="Ausrüstungs-Checkliste">
            <ul className="list-disc list-inside">
                {plan.equipmentList.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </InfoCard>

        {/* Tips */}
        <InfoCard icon={<SparklesIcon className="w-5 h-5 text-red-400" />} title="Profi-Tipps">
            <ul className="list-disc list-inside space-y-1">
                {plan.notesAndTips.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </InfoCard>
      </div>

      {/* Follow-up Question Section */}
      <div className="mt-10 bg-gray-800/60 p-5 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-yellow-300" />
            Dein virtueller Foto-Assistent
        </h3>
        
        {conversation.length > 0 && (
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2">
            {conversation.map((entry, index) => (
              <div key={index}>
                <p className="font-semibold text-red-400 mb-1">Du:</p>
                <p className="bg-gray-700/50 p-3 rounded-lg text-sm mb-3">{entry.question}</p>
                <p className="font-semibold text-green-400 mb-1">SpotFinder AI:</p>
                <p className="bg-gray-900/50 p-3 rounded-lg text-sm whitespace-pre-wrap">{entry.answer === '...' ? <span className="animate-pulse">denkt nach...</span> : entry.answer}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
          <textarea
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            placeholder="Stelle eine beliebige Folgefrage..."
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[60px] text-sm"
            rows={2}
            disabled={isAnswering}
          />
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                {suggestionChips.map(q => (
                    <button type="button" key={q} onClick={() => handleChipClick(q)} className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded-full transition-colors">
                        {q}
                    </button>
                ))}
            </div>
            <button
                type="submit"
                disabled={isAnswering || !followUpQuestion.trim()}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
                {isAnswering ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : 'Frage stellen'}
            </button>
          </div>
        </form>
        {followUpError && <p className="text-sm text-center text-red-400 mt-2">{followUpError}</p>}
      </div>


       <div className="mt-8 text-center flex justify-center items-center gap-4">
            <button onClick={onReset} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
                Neuen Plan erstellen
            </button>
            {isLoggedIn && (
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onSavePlan(plan)}
                        disabled={isSaved}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
                    >
                        {isSaved ? '✓ Gespeichert' : 'Plan speichern'}
                    </button>
                    {isSaved && (
                         <button onClick={onGoToProfile} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                            Zum Profil
                        </button>
                    )}
                </div>
            )}
            {!isLoggedIn && (
                 <button 
                    onClick={() => onSavePlan(plan)}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                    Plan speichern
                </button>
            )}
        </div>
    </div>
  );
};

export default PlanningResult;