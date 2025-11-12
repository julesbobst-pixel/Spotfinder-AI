import React from 'react';
import { PhotoSpot } from '../types';
import MapEmbed from './MapEmbed';

interface MapModalProps {
  spots: PhotoSpot[];
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ spots, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="futuristic-bg futuristic-border rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Gefundene Spots</h3>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white transition-colors text-2xl"
                aria-label="Karte schließen"
            >
                &times;
            </button>
        </div>
        <div className="flex-grow p-1">
          <MapEmbed spots={spots} />
        </div>
      </div>
    </div>
  );
};

export default MapModal;
