
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AddSpotModalProps {
  onClose: () => void;
  onSave: (data: { name: string; address: string; description: string }) => Promise<void>;
}

export const AddSpotModal: React.FC<AddSpotModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !address.trim()) {
            setError("Name und Adresse sind Pflichtfelder.");
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            await onSave({ name, address, description });
        } catch (err: any) {
            setError(err.message || 'Der Ort konnte nicht gefunden oder gespeichert werden. Bitte überprüfe die Adresse.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="futuristic-bg rounded-2xl shadow-2xl p-8 w-full max-w-md futuristic-border relative" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-2xl"
                    aria-label="Schließen"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-center text-white mb-2">Besuchten Spot eintragen</h2>
                <p className="text-center text-gray-400 mb-6">Füge einen Ort hinzu, den du besucht hast.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="spotName">
                            Name des Spots
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                            id="spotName"
                            type="text"
                            placeholder="z.B. alter Leuchtturm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="spotAddress">
                            Adresse oder Ort
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                            id="spotAddress"
                            type="text"
                            placeholder="Straße, PLZ, Stadt"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                     <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="spotDescription">
                            Kurze Beschreibung (optional)
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                            id="spotDescription"
                            placeholder="z.B. Toller Blick auf den Sonnenuntergang..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        ></textarea>
                    </div>
                    {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
                    <div className="flex items-center justify-center">
                        <button
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? <LoadingSpinner /> : 'Spot speichern'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
