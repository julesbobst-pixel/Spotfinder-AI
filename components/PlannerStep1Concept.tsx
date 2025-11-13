
import React, { useState, useEffect } from 'react';
import { PlannerCriteria, GeneratedIdea } from '../types';
import { MOTIVS, DYNAMIC_STYLES } from '../constants';
import { generateCreativeIdeas } from '../services/geminiService';
import { SparklesIcon, SolidCheckCircleIcon } from './icons/CardIcons';

interface Props {
  criteria: Partial<PlannerCriteria>;
  setCriteria: React.Dispatch<React.SetStateAction<Partial<PlannerCriteria>>>;
  isOffline: boolean;
}

const PlannerStep1Concept: React.FC<Props> = ({ criteria, setCriteria, isOffline }) => {
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeIdea, setActiveIdea] = useState<GeneratedIdea | null>(null);

  const toggleMotiv = (motivId: string) => {
    navigator.vibrate?.(30);
    setCriteria((prev) => {
      const newMotivs = prev.motivs?.includes(motivId)
        ? prev.motivs.filter((m) => m !== motivId)
        : [...(prev.motivs || []), motivId];
      return { ...prev, motivs: newMotivs };
    });
    // Reset ideas if motivs change
    setIdeas([]);
    setActiveIdea(null);
  };

  const getRelevantStyles = () => {
    if (!criteria.motivs || criteria.motivs.length === 0) {
        return DYNAMIC_STYLES.default;
    }
    const allStyles = criteria.motivs.flatMap(motiv => DYNAMIC_STYLES[motiv] || []);
    const uniqueStyles = [...new Set(allStyles)];
    return uniqueStyles.length > 0 ? uniqueStyles : DYNAMIC_STYLES.default;
  };
  
  const relevantStyles = getRelevantStyles();

  // Effect to clean up selected styles if they are no longer relevant
  useEffect(() => {
    setCriteria(prev => {
        const newStyles = (prev.styles || []).filter(style => relevantStyles.includes(style));
        if (newStyles.length !== (prev.styles || []).length) {
            return { ...prev, styles: newStyles };
        }
        return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria.motivs, setCriteria]);


  const toggleStyle = (style: string) => {
    navigator.vibrate?.(30);
    setCriteria((prev) => {
      const newStyles = prev.styles?.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...(prev.styles || []), style];
      return { ...prev, styles: newStyles };
    });
    setActiveIdea(null);
  };

  const handleGenerateIdeas = async () => {
    if (!criteria.motivs || criteria.motivs.length === 0) return;
    navigator.vibrate?.(50);
    setIsGenerating(true);
    setError('');
    setIdeas([]);
    try {
        const generatedIdeas = await generateCreativeIdeas(criteria.motivs);
        setIdeas(generatedIdeas);
    } catch(e: any) {
        setError(e.message || "Ideen konnten nicht generiert werden.");
    } finally {
        setIsGenerating(false);
    }
  }

  const handleSelectIdea = (idea: GeneratedIdea) => {
    navigator.vibrate?.(50);
    setActiveIdea(idea);
    setCriteria(prev => ({
        ...prev,
        styles: idea.styles,
        keyElements: idea.keyElements,
    }));
  }

  return (
    <div className="w-full max-w-3xl text-center">
      <h2 className="text-2xl font-semibold mb-2">Was ist deine kreative Idee?</h2>
      <p className="text-center text-gray-400 mb-6">Wähle zuerst ein oder mehrere Motive, um loszulegen.</p>
      
      {/* Motiv Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {MOTIVS.map((motiv) => {
          const isSelected = criteria.motivs?.includes(motiv.id);
          return (
            <button
              key={motiv.id}
              onClick={() => toggleMotiv(motiv.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 text-center
                ${isSelected ? 'bg-primary-500/20 border-primary-500 text-white' : 'bg-gray-700/50 border-gray-600 hover:border-primary-500 hover:bg-gray-700 text-gray-300'}
              `}
            >
              <motiv.icon className="w-10 h-10 mb-2" />
              <span className="font-medium text-sm">{motiv.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Idea Generator */}
      <div className="mb-6">
        <button
            onClick={handleGenerateIdeas}
            disabled={!criteria.motivs || criteria.motivs.length === 0 || isGenerating || isOffline}
            className="w-full max-w-md mx-auto px-6 py-3 bg-accent text-gray-900 font-bold rounded-lg hover:bg-accent-focus transition-all disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            title={isOffline ? "Du musst online sein, um Ideen zu generieren." : ""}
        >
            <SparklesIcon className="w-6 h-6" />
            {isGenerating ? 'Moment, die Muse küsst...' : 'Inspirations-Funke zünden'}
        </button>
      </div>

      {/* Generated Ideas */}
      {isGenerating && <div className="text-center p-4">Lade Ideen...</div>}
      {error && <div className="text-center p-4 text-red-400">{error}</div>}
      {ideas.length > 0 && (
          <div className="mb-6 space-y-3">
              {ideas.map((idea, index) => {
                  const isSelected = activeIdea?.title === idea.title;
                  return (
                      <button 
                        key={index} 
                        onClick={() => handleSelectIdea(idea)}
                        className={`relative w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected ? 'bg-primary-900/50 border-primary-500 ring-2 ring-primary-500/50' : 'bg-gray-700/50 border-gray-600 hover:border-primary-500'}`}
                      >
                         {isSelected && <SolidCheckCircleIcon className="w-6 h-6 text-primary-400 absolute top-3 right-3" />}
                         <h4 className="font-bold text-white">{idea.title}</h4>
                         <p className="text-sm text-gray-400 mt-1 mb-2">{idea.description}</p>
                         <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-600/50">
                            <span className="text-xs font-semibold text-gray-300">Stile:</span>
                            {idea.styles.map(style => (
                                <span key={style} className="text-xs bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full">{style}</span>
                            ))}
                         </div>
                      </button>
                  )
              })}
          </div>
      )}

      {/* Manual Configuration */}
       <div className="text-left space-y-6">
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Stimmung & Stil</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {relevantStyles.map(style => (
                        <label
                            key={style}
                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors border-2 text-xs ${criteria.styles?.includes(style) ? 'bg-primary-500/20 border-primary-500' : 'bg-gray-700/50 border-gray-600 hover:border-primary-500'}`}
                        >
                            <input
                                type="checkbox"
                                checked={criteria.styles?.includes(style)}
                                onChange={() => toggleStyle(style)}
                                className="w-4 h-4 rounded accent-primary-500 bg-gray-700 border-gray-600"
                            />
                            <span className="ml-2 font-medium text-gray-200">{style}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="keyElements">Wichtige Details (optional)</label>
                <input
                    id="keyElements"
                    type="text"
                    value={criteria.keyElements || ''}
                    onChange={(e) => {
                        setCriteria(prev => ({ ...prev, keyElements: e.target.value }));
                        setActiveIdea(null);
                    }}
                    placeholder="z.B. 'roter Sportwagen', 'Person im langen Kleid'"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
      </div>
    </div>
  );
};

export default PlannerStep1Concept;
