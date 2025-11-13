import React, { useState, useEffect } from 'react';
import { PhotoshootPlan, Coordinates, ImageState } from '../types';
import { LocationMarkerIcon, ClockIcon, SunIcon, SparklesIcon, DocumentTextIcon, MoonIcon, LightBulbIcon, CameraIcon, RouteIcon, ShareIcon } from './icons/CardIcons';
import WeatherDisplay from './WeatherDisplay';
import { getFollowUpAnswer, generateMoodImages } from '../services/geminiService';

interface PlanningResultProps {
  plan: PhotoshootPlan;
  onReset: () => void;
  onSavePlan: (plan: PhotoshootPlan) => void;
  onGoToProfile: () => void;
  isSaved: boolean;
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

const getGoogleMapsUrl = (coords: Coordinates) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`;
}

const ImageProgress: React.FC<{ imageState: ImageState, title: string }> = ({ imageState, title }) => {
    return (
        <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
            <div className="aspect-video bg-gray-900 rounded overflow-hidden flex items-center justify-center relative">
                {imageState.isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-xs">
                            <p className="text-xs text-gray-400 mb-2 text-center">{title}...</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 relative">
                                <div
                                    className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${imageState.progress || 0}%` }}
                                ></div>
                                <span className="absolute inset-0 text-center text-xs font-bold text-white leading-loose">
                                    {Math.round(imageState.progress || 0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                {imageState.error && <p className="text-xs text-red-400 p-4 text-center">{imageState.error}</p>}
                {imageState.image && !imageState.isLoading && <img src={`data:image/jpeg;base64,${imageState.image}`} alt={title} className="w-full h-full object-cover" />}
            </div>
        </div>
    );
};

const PlanningResult: React.FC<PlanningResultProps> = ({ plan, onReset, onSavePlan, onGoToProfile, isSaved }) => {
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [conversation, setConversation] = useState<{ question: string; answer: string }[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [followUpError, setFollowUpError] = useState('');
  
  const [moodImageStates, setMoodImageStates] = useState<ImageState[]>([]);

  useEffect(() => {
    const generateAndTrackProgress = async (prompt: string, index: number) => {
        let progressInterval: number;
        
        setMoodImageStates(prev => {
            const newStates = [...prev];
            newStates[index] = { isLoading: true, image: null, error: null, progress: 0 };
            return newStates;
        });

        let progress = 0;
        progressInterval = window.setInterval(() => {
            progress += 5;
            if (progress >= 95) {
                window.clearInterval(progressInterval);
            }
            setMoodImageStates(prev => {
                const newStates = [...prev];
                if (newStates[index]?.isLoading) {
                    newStates[index] = { ...newStates[index], progress };
                } else {
                     window.clearInterval(progressInterval);
                }
                return newStates;
            });
        }, 250);

        try {
            const images = await generateMoodImages([prompt]);
            window.clearInterval(progressInterval);
            setMoodImageStates(prev => {
                const newStates = [...prev];
                if (images[0]) {
                    newStates[index] = { isLoading: false, image: images[0], error: null, progress: 100 };
                } else {
                    throw new Error("Bild konnte nicht generiert werden.");
                }
                return newStates;
            });
        } catch (e: any) {
            window.clearInterval(progressInterval);
            setMoodImageStates(prev => {
                const newStates = [...prev];
                newStates[index] = { isLoading: false, image: null, error: e.message || 'Bild konnte nicht geladen werden.', progress: 0 };
                return newStates;
            });
        }
    };

    if (plan?.moodImagePrompts && plan.moodImagePrompts.length > 0) {
        setMoodImageStates(plan.moodImagePrompts.map(() => ({ isLoading: true, image: null, error: null, progress: 0 })));
        plan.moodImagePrompts.forEach((prompt, index) => {
            generateAndTrackProgress(prompt, index);
        });
    }
  }, [plan]);


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
      const errorMessage = e.message || 'Ein Fehler ist aufgetreten.';
      setFollowUpError(errorMessage);
       // Update the last entry with the error message
      setConversation(prev => prev.map((entry, index) => 
          index === prev.length - 1 
          ? { ...entry, answer: `Fehler: ${errorMessage}` } 
          : entry
      ));
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
  
  const canShare = typeof navigator.share === 'function';
    
  const handleSharePlan = async () => {
      navigator.vibrate?.(50);
      if(canShare) {
          try {
              await navigator.share({
                  title: `Fotoshooting-Plan: ${plan.title}`,
                  text: `Schau dir diesen Fotoshooting-Plan für "${plan.spot.name}" an!\n\n${plan.creativeVision}`,
                  url: window.location.href, // This will share the current page URL
              });
          } catch (error) {
              console.error('Sharing failed:', error);
          }
      }
  }


  if (!plan) {
    return (
      <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Fehler</h3>
        <p className="text-gray-400">Der Plan konnte nicht geladen werden.</p>
        <button onClick={onReset} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Erneut versuchen</button>
      </div>
    );
  }

  return (
    <div className="text-gray-200 w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-primary-400 mb-2">{plan.title}</h2>
        <p className="text-lg text-gray-400">Dein persönlicher Shooting-Plan</p>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => setIsBriefingOpen(!isBriefingOpen)}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-all text-lg btn-primary-glow"
        >
          <CameraIcon className="w-6 h-6" />
          {isBriefingOpen ? 'Creative Briefing ausblenden' : 'Creative Briefing anzeigen'}
          <span className={`transform transition-transform ${isBriefingOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      {/* Creative Briefing */}
      {isBriefingOpen && (
        <InfoCard icon={<CameraIcon className="w-6 h-6 text-primary-400" />} title="Creative Briefing" className="mb-6">
          <div>
              <h5 className="font-semibold text-base text-white mb-2">Kreative Vision</h5>
              <p className="text-gray-300 italic mb-4">"{plan.creativeVision}"</p>
              <h5 className="font-semibold text-base text-white mb-2">Shot-Liste</h5>
              <ul className="list-disc list-inside space-y-1 mb-6">
                  {plan.shotList.map((shot, index) => <li key={index}>{shot}</li>)}
              </ul>
              
              <h5 className="font-semibold text-base text-white mb-2">Living Moodboard</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moodImageStates.map((state, index) => (
                      <ImageProgress key={index} imageState={state} title={`Generiere Moodboard-Bild ${index + 1}`} />
                  ))}
              </div>
          </div>
        </InfoCard>
      )}


      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Spot Info */}
         <div className="bg-gray-800/60 p-5 rounded-lg border border-gray-700 md:col-span-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                    <div className="flex items-center mb-2">
                        <LocationMarkerIcon className="w-6 h-6 mr-2 text-primary-400" />
                        <h3 className="text-2xl font-bold text-white">{plan.spot.name}</h3>
                    </div>
                    <p className="text-gray-300">{plan.spot.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                     {canShare && (
                        <button onClick={handleSharePlan} className="px-4 py-2 text-sm rounded-lg transition-colors bg-gray-700/80 hover:bg-gray-600 border border-gray-600 flex items-center gap-2" aria-label="Plan teilen">
                            <ShareIcon className="w-5 h-5" /> Teilen
                        </button>
                    )}
                    <a href={getGoogleMapsUrl(plan.spot.coordinates)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm rounded-lg transition-colors bg-gray-700/80 hover:bg-gray-600 border border-gray-600 flex items-center gap-2" aria-label="Route planen">
                        <RouteIcon className="w-5 h-5" /> Route
                    </a>
                </div>
            </div>
        </div>

        {/* Travel Plan */}
        <InfoCard icon={<ClockIcon className="w-5 h-5 text-primary-400" />} title="Reiseplan">
            <p><span className="font-semibold">Abfahrt:</span> {plan.travelPlan.departureTime}</p>
            <p>{plan.travelPlan.notes}</p>
        </InfoCard>

        {/* Weather */}
        <InfoCard icon={<SunIcon className="w-5 h-5 text-primary-400" />} title="Wetter & Licht">
            <WeatherDisplay weather={plan.weatherForecast} isLoading={false} />
            <p className="mt-2">{plan.weatherForecast.notes}</p>
            <div className="mt-2 flex items-center"><SunIcon className="w-4 h-4 mr-2" /><p><span className="font-semibold">Licht:</span> {plan.lightingAnalysis.condition}</p></div>
            <div className="flex items-center"><MoonIcon className="w-4 h-4 mr-2" /><p><span className="font-semibold">Lichtverschmutzung:</span> {plan.lightingAnalysis.lightPollution}</p></div>
        </InfoCard>

        {/* Equipment */}
        <InfoCard icon={<DocumentTextIcon className="w-5 h-5 text-primary-400" />} title="Ausrüstungs-Checkliste">
            <ul className="list-disc list-inside">
                {plan.equipmentList.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </InfoCard>

        {/* Tips */}
        <InfoCard icon={<SparklesIcon className="w-5 h-5 text-primary-400" />} title="Profi-Tipps">
            <ul className="list-disc list-inside space-y-1">
                {plan.notesAndTips.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </InfoCard>
      </div>

      {/* Follow-up Question Section */}
      <div className="mt-10 bg-gray-800/60 p-5 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-accent" />
            Dein virtueller Foto-Assistent
        </h3>
        
        {conversation.length > 0 && (
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-2">
            {conversation.map((entry, index) => (
              <div key={index}>
                <p className="font-semibold text-primary-400 mb-1">Du:</p>
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
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[60px] text-sm"
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
                className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
                {isAnswering ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : 'Frage stellen'}
            </button>
          </div>
        </form>
        {followUpError && <p className="text-sm text-center text-red-400 mt-2">{followUpError}</p>}
      </div>


       <div className="mt-8 text-center flex justify-center items-center gap-4">
            <button onClick={() => { navigator.vibrate?.(50); onReset(); }} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
                Neuen Plan erstellen
            </button>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => { navigator.vibrate?.(80); onSavePlan(plan); }}
                    disabled={isSaved}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
                >
                    {isSaved ? '✓ Gespeichert' : 'Plan speichern'}
                </button>
                {isSaved && (
                     <button onClick={() => { navigator.vibrate?.(50); onGoToProfile(); }} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Zum Profil
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default PlanningResult;