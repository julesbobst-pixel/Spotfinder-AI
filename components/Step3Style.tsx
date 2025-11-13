import React, { useEffect } from 'react';
import { SearchCriteria } from '../types';

interface Step3StyleProps {
  criteria: SearchCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>;
  styles: { [key: string]: string[] };
}

const Step3Style: React.FC<Step3StyleProps> = ({ criteria, setCriteria, styles }) => {
  
  const getRelevantStyles = () => {
    if (criteria.motivs.length === 0) {
        return styles.default;
    }
    const allStyles = criteria.motivs.flatMap(motiv => styles[motiv] || []);
    const uniqueStyles = [...new Set(allStyles)];
    return uniqueStyles.length > 0 ? uniqueStyles : styles.default;
  };

  const relevantStyles = getRelevantStyles();

  // Effect to clean up selected styles if they are no longer relevant
  useEffect(() => {
    setCriteria(prev => {
        const newStyles = prev.styles.filter(style => relevantStyles.includes(style));
        if (newStyles.length !== prev.styles.length) {
            return { ...prev, styles: newStyles };
        }
        return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria.motivs, setCriteria]);


  const toggleStyle = (style: string) => {
    setCriteria((prev) => {
      const newStyles = prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style];
      return { ...prev, styles: newStyles };
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Welchen Stil oder welche Stimmung suchst du?</h2>
      <p className="text-center text-gray-400 mb-6">Wähle so viele, wie du magst. Die Auswahl passt sich an deine gewählten Motive an.</p>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {relevantStyles.map((style) => (
          <label
            key={style}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2
              ${criteria.styles.includes(style) ? 'bg-primary-500/20 border-primary-500' : 'bg-gray-800/50 border-gray-600 hover:border-primary-500'}
            `}
          >
            <input
              type="checkbox"
              checked={criteria.styles.includes(style)}
              onChange={() => toggleStyle(style)}
              className="w-5 h-5 rounded accent-primary-500 bg-gray-700 border-gray-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-200">{style}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Step3Style;