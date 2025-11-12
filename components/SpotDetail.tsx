import React, { useState, useEffect } from 'react';
import { PhotoSpot, DetailedSpotInfo } from '../types';
import { getSpotDetails, generateImageForSpot } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CameraIcon, MapIcon, SparklesIcon, ChevronLeftIcon, RouteIcon, ShareIcon, LocationMarkerIcon, ClockIcon } from './icons/CardIcons';
import { DuotoneParkingIcon, DuotoneTrainIcon } from './icons/SpotDetailIcons';

interface SpotDetailProps {
  spot: PhotoSpot;
  onBack: () => void;
}

const InfoSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`futuristic-bg futuristic-border p-5 rounded-lg ${className}`}>
        <div className="flex items-center mb-3">
            {icon}
            <h3 className="text-xl font-semibold ml-3 text-red-400">{title}</h3>
        </div>
        <div className="text-gray-300 space-y-2">{children}</div>
    </div>
);

const SpotDetail: React.FC<SpotDetailProps> = ({ spot, onBack }) => {
  const [details, setDetails] = useState<DetailedSpotInfo | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch and display text details first for better perceived performance
        const spotDetails = await getSpotDetails(spot);
        setDetails(spotDetails);
        setIsLoading(false);

        // Then, fetch the image in the background
        if (spotDetails.imagePrompt) {
            const imageData = await generateImageForSpot(spotDetails.imagePrompt);
            if(imageData) {
                setImageUrl(`data:image/png;base64,${imageData}`);
            }
        }
      } catch (e: any) {
        setError(e.message || 'Ein Fehler ist aufgetreten.');
        setIsLoading(false);
      } finally {
        setIsImageLoading(false);
      }
    };
    fetchDetails();
  }, [spot]);
  
  const handleShare = async () => {
      const shareData = {
          title: `Photo-Spot: ${spot.name}`,
          text: `Schau dir diesen coolen Foto-Spot an, den ich gefunden habe: ${spot.name}. Adresse: ${details?.address || spot.address}`,
          url: `https://www.google.com/maps/search/?api=1&query=${spot.coordinates.lat},${spot.coordinates.lon}`
      }
      try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
              // Fallback for desktop
              await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
              alert('Link zum Spot wurde in die Zwischenablage kopiert!');
          }
      } catch (err) {
          console.error("Fehler beim Teilen:", err)
      }
  }
  
  const getGoogleMapsUrl = () => {
      return `https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates.lat},${spot.coordinates.lon}`;
  }


  if (isLoading) {
    return (
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-lg">Lade Details für {spot.name}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
          Zurück zu den Ergebnissen
        </button>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
                Zurück zur Übersicht
            </button>
        </div>
      
      <header className="mb-8">
        <h2 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-red-500 to-red-400 text-transparent bg-clip-text">{spot.name}</h2>
        <p className="text-center text-gray-400 flex items-center justify-center gap-2"><LocationMarkerIcon className="w-4 h-4" /> {details.address}</p>
      </header>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
            <div className="w-full h-full min-h-[250px] futuristic-bg futuristic-border rounded-lg flex items-center justify-center overflow-hidden">
                {isImageLoading ? (
                    <div>
                        <LoadingSpinner />
                        <p className="text-sm text-gray-400 mt-2">Generiere Vision...</p>
                    </div>
                ) : imageUrl ? (
                     <img src={imageUrl} alt={`Künstlerische Interpretation von ${spot.name}`} className="w-full h-full object-cover" />
                ) : (
                    <p className="text-gray-500">Vorschau konnte nicht geladen werden</p>
                )}
            </div>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
             <a href={getGoogleMapsUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full gap-3 px-6 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all text-lg">
                <RouteIcon className="w-6 h-6" />
                Route planen
            </a>
             <button onClick={handleShare} className="flex items-center justify-center w-full gap-3 px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-lg">
                <ShareIcon className="w-6 h-6" />
                Spot teilen
            </button>
            <div className="futuristic-bg futuristic-border p-4 rounded-lg text-center flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center mb-2"><ClockIcon className="w-6 h-6 mr-2 text-red-400" /><h4 className="font-semibold">Beste Zeit</h4></div>
                <p className="text-sm text-gray-300">{details.bestTimeToVisit}</p>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <InfoSection title="Fotografen-Briefing" icon={<CameraIcon className="w-6 h-6" />} className="md:col-span-2">
            <p className="text-base mb-4">{details.summary}</p>
            <ul className="space-y-2 list-disc list-inside">
                {details.keyAspects.map((aspect, index) => <li key={index} className="text-sm">{aspect}</li>)}
            </ul>
        </InfoSection>

        <InfoSection title="Anreise & Tipps" icon={<MapIcon className="w-6 h-6" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start">
                    <DuotoneParkingIcon className="w-8 h-8 mr-3 flex-shrink-0 text-red-400" />
                    <div>
                        <h5 className="font-semibold mb-1">Parken</h5>
                        <p className="text-gray-400">{details.travelInfo.parking}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <DuotoneTrainIcon className="w-8 h-8 mr-3 flex-shrink-0 text-red-400" />
                    <div>
                        <h5 className="font-semibold mb-1">ÖPNV</h5>
                        <p className="text-gray-400">{details.travelInfo.publicTransport}</p>
                    </div>
                </div>
            </div>
        </InfoSection>

        <div className="md:col-span-2">
            <InfoSection title="Top-Motive vor Ort" icon={<SparklesIcon className="w-6 h-6" />}>
                <div className="flex flex-wrap gap-3">
                    {/* Fix: Replaced non-existent 'details.primaryMotifs' with 'spot.matchingCriteria' which holds the relevant data. */}
                    {spot.matchingCriteria.map((motif, index) => (
                        <div key={index} className="bg-gray-700/50 py-2 px-4 rounded-full text-sm border border-gray-600">{motif}</div>
                    ))}
                </div>
            </InfoSection>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;