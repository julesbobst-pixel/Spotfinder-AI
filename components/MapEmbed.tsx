import React from 'react';
import { PhotoSpot } from '../types';

interface MapEmbedProps {
  spots: PhotoSpot[];
  focusedSpot?: PhotoSpot | null;
}

const MapEmbed: React.FC<MapEmbedProps> = ({ spots, focusedSpot }) => {
  if (spots.length === 0 && !focusedSpot) {
    return (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-gray-500">Keine Spots zum Anzeigen.</p>
        </div>
    );
  }

  let bbox = '';
  let markers = '';
  const spotsToShow = focusedSpot ? [focusedSpot] : spots;

  if (spotsToShow.length === 1) {
    const spot = spotsToShow[0];
    const lat = spot.coordinates.lat;
    const lon = spot.coordinates.lon;
    const padding = 0.01; // Zoom level for single spot
    bbox = [lon - padding, lat - padding, lon + padding, lat + padding].join(',');
    markers = `marker=${lat},${lon}`;
  } else {
    const latitudes = spotsToShow.map(s => s.coordinates.lat);
    const longitudes = spotsToShow.map(s => s.coordinates.lon);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    
    const latPadding = (maxLat - minLat) * 0.15 + 0.01;
    const lonPadding = (maxLon - minLon) * 0.15 + 0.01;

    bbox = [
        minLon - lonPadding, 
        minLat - latPadding, 
        maxLon + lonPadding, 
        maxLat + latPadding
    ].join(',');
    
    markers = spotsToShow.map(s => `marker=${s.coordinates.lat},${s.coordinates.lon}`).join('&');
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&${markers}`;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden futuristic-border shadow-lg bg-gray-900">
      <iframe
        key={mapUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        src={mapUrl}
        title="Gespeicherte Orte"
        style={{ border: 0 }}
      ></iframe>
       <div className="text-xs text-center text-gray-500 bg-black/50 p-1 relative -top-7">
        Karte von <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
      </div>
    </div>
  );
};

export default MapEmbed;