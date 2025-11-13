
import React from 'react';
import { UserData, User, PhotoSpot, Coordinates } from '../types';
import SpotCard from './SpotCard';
import PlanCard from './PlanCard';
import MapEmbed from './MapEmbed';

interface ProfileProps {
    userData: UserData;
    currentUser: User | null;
    userLocation: Coordinates | null;
    onToggleFavorite: (spot: PhotoSpot) => void;
    onToggleVisited: (spotId: string) => void;
    onDeletePlan: (planId: string) => void;
    setView: (view: 'search' | 'profile' | 'detail') => void;
    onSpotSelect: (spot: PhotoSpot) => void;
}

const Profile: React.FC<ProfileProps> = ({ userData, currentUser, userLocation, onToggleFavorite, onToggleVisited, onDeletePlan, setView, onSpotSelect }) => {
    
    if (!currentUser) return null;

    const favoriteSpots = userData.favorites;
    const savedPlans = userData.savedPlans || [];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-3xl font-bold">Mein Profil</h2>
                 <button onClick={() => setView('search')} className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg hover:bg-gray-600/50 transition-all">
                    Neue Suche starten
                </button>
            </div>

            {/* Favoriten Section */}
            <section className="mb-12">
                <h3 className="text-2xl font-semibold border-b-2 border-red-500 pb-2 mb-6">Meine gespeicherten Spots</h3>
                {favoriteSpots.length > 0 ? (
                    <>
                        <div className="mb-6">
                            <MapEmbed spots={favoriteSpots} />
                        </div>
                        <div className="space-y-6">
                            {favoriteSpots.map(spot => {
                                const isVisited = userData.visited.includes(spot.id);
                                return (
                                    <SpotCard
                                        key={spot.id}
                                        spot={spot}
                                        userLocation={userLocation!}
                                        currentUser={currentUser}
                                        isFavorite={true}
                                        isVisited={isVisited}
                                        onToggleFavorite={onToggleFavorite}
                                        onToggleVisited={onToggleVisited}
                                        onSelect={onSpotSelect}
                                    />
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="text-center futuristic-bg p-8 rounded-lg futuristic-border border-dashed">
                        <p className="text-gray-400">Du hast noch keine Spots als Favoriten markiert.</p>
                    </div>
                )}
            </section>
            
            {/* Gespeicherte Pläne Section */}
            <section>
                <h3 className="text-2xl font-semibold border-b-2 border-red-500 pb-2 mb-6">Meine gespeicherten Pläne</h3>
                {savedPlans.length > 0 ? (
                     <div className="space-y-4">
                        {savedPlans.map(plan => (
                           <PlanCard key={plan.id} plan={plan} onDelete={onDeletePlan} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center futuristic-bg p-8 rounded-lg futuristic-border border-dashed">
                        <p className="text-gray-400 mb-4">Du hast noch keine Shooting-Pläne gespeichert.</p>
                    </div>
                )}
            </section>

        </div>
    );
};

export default Profile;
