import React, { useState } from 'react';
import { PlannerCriteria, IdeaStarter } from '../types';
// Fix: Use the newly created STYLES constant from constants.ts
import { PHOTO_SUBJECTS, STYLES, INITIAL_IDEA_STARTERS } from '../constants';
import { getNewIdeaStarters } from '../services/geminiService';
import { LandscapeIcon, ArchitectureIcon, PortraitIcon, StreetIcon, LongExposureIcon, MacroIcon, LostPlaceIcon, WildlifeIcon, AstroIcon } from './icons/MotivIcons';
import { SparklesIcon } from './icons/CardIcons';

interface Props {
  criteria: Partial<PlannerCriteria>;
  setCriteria: React.Dispatch<React.SetStateAction<Partial<PlannerCriteria>>>;
}

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
    'Landschaft': LandscapeIcon,
    'Architektur': ArchitectureIcon,
    'Portrait / Menschen': PortraitIcon,
    'Streetfotografie': StreetIcon,
    'Astrofotografie': AstroIcon,
    'Tierfotografie': WildlifeIcon,
    'Auto / Fahrzeug': StreetIcon,
    'Produkt': MacroIcon,
    'Event': PortraitIcon,
    'default': SparklesIcon
};

const getIconForSubject = (subject: string) => {
    return iconMap[subject] || iconMap['default'];
};


const PlannerStep1Idea: React.FC<Props> = ({ criteria, setCriteria }) => {
  const [starters, setStarters] = useState<IdeaStarter[]>(INITIAL_IDEA_STARTERS as IdeaStarter[]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [activeStarter, setActiveStarter] = useState<string | null>(null);

  const toggleStyle = (style: string) => {
    setCriteria((prev) => {
      const newStyles = prev.styles?.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...(prev.styles || []), style];
      return { ...prev, styles: newStyles };
    });
  };

  const handleSelectStarter = (starter: IdeaStarter) => {
      setCriteria(prev => ({
          ...prev,
          ...starter.prefill
      }));
      setActiveStarter(starter.id);
  }
  
  const handleGenerateNewIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
        const newStartersData = await getNewIdeaStarters();
        const newStarters = newStartersData.map((s, index) => ({
            id: `generated-${index}-${Date.now()}`,
            title: s.title,
            description: s.description,
            icon: getIconForSubject(s.subject),
            prefill: {
                subject: s.subject,
                styles: s.styles,
                keyElements: s.keyElements,
            }
        }));
        setStarters(newStarters);
        setActiveStarter(null); // Reset selection
    } catch (error) {
        console.error(error);
        alert("Konnte keine neuen Ideen laden. Versuche es später erneut.");
    } finally {
        setIsGeneratingIdeas(false);
    }
  }

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-2xl font-semibold mb-2">Was ist deine kreative Idee?</h2>
      <p className="text-center text-gray-400 mb-6">Wähle einen Starter oder stelle deine Idee manuell zusammen.</p>
      
      {/* Idea Starters */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-left text-red-400">Inspirations-Hub</h3>
            <button onClick={handleGenerateNewIdeas} disabled={isGeneratingIdeas} className="px-3 py-1.5 text-xs font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isGeneratingIdeas ? 'Generiere...' : 'Neue Ideen generieren'}
                <SparklesIcon className={`w-4 h-4 ${isGeneratingIdeas ? 'animate-pulse' : ''}`} />
            </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {starters.map(starter => (
                <button key={starter.id} onClick={() => handleSelectStarter(starter)} className={`text-left p-3 rounded-lg border-2 transition-all h-full flex flex-col ${activeStarter === starter.id ? 'bg-red-500/20 border-red-500' : 'bg-gray-700/50 border-gray-600 hover:border-red-500'}`}>
                    <starter.icon className="w-8 h-8 mb-2 text-red-400" />
                    <h4 className="font-bold text-sm text-white flex-grow">{starter.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{starter.description}</p>
                </button>
            ))}
        </div>
      </div>

      <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400 font-semibold">Oder starte manuell</span>
          <div className="flex-grow border-t border-gray-700"></div>
      </div>


      {/* Manual Configuration */}
      <div className="text-left mb-6">
        <label className="block text-gray-300 text-sm font-bold mb-2">Hauptmotiv</label>
        <div className="flex flex-wrap gap-2">
            {PHOTO_SUBJECTS.map(subject => (
                <button 
                    key={subject}
                    onClick={() => {
                        setCriteria(prev => ({...prev, subject}));
                        setActiveStarter(null);
                    }}
                    className={`px-4 py-2 text-sm rounded-full border-2 transition-colors ${criteria.subject === subject ? 'bg-red-500 border-red-500 text-white font-semibold' : 'bg-gray-700 border-gray-600 hover:border-red-500'}`}
                >
                    {subject}
                </button>
            ))}
        </div>
      </div>

      <div className="text-left mb-6">
        <label className="block text-gray-300 text-sm font-bold mb-2">Stimmung & Stil</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STYLES.map(style => (
                 <label
                    key={style}
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors border-2 text-xs
                    ${criteria.styles?.includes(style) ? 'bg-red-500/20 border-red-500' : 'bg-gray-700/50 border-gray-600 hover:border-red-500'}
                    `}
                >
                    <input
                    type="checkbox"
                    checked={criteria.styles?.includes(style)}
                    onChange={() => {
                        toggleStyle(style);
                        setActiveStarter(null);
                    }}
                    className="w-4 h-4 rounded accent-red-500 bg-gray-700 border-gray-600"
                    />
                    <span className="ml-2 font-medium text-gray-200">{style}</span>
                </label>
            ))}
        </div>
      </div>
      
       <div className="text-left">
        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="keyElements">
          Wichtige Details (optional)
        </label>
        <input
          id="keyElements"
          type="text"
          value={criteria.keyElements || ''}
          onChange={(e) => {
              setCriteria(prev => ({...prev, keyElements: e.target.value}));
              setActiveStarter(null);
          }}
          placeholder="z.B. 'roter Sportwagen', 'Person im langen Kleid'"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

    </div>
  );
};

export default PlannerStep1Idea;