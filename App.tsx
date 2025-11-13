

import React, { useState, useEffect, useCallback } from 'react';
import { SearchCriteria, Coordinates, PhotoSpot, User, UserData, PhotoshootPlan, PlannerCriteria, ImageState } from './types';
import { findPhotoSpots, generatePhotoshootPlan, geocodeLocation, generateSpotImage } from './services/geminiService';
import { MOTIVS, DYNAMIC_STYLES, TIMES_OF_DAY, MAX_RADIUS, QUICK_SEARCH_LOADING_MESSAGES, PLANNER_LOADING_MESSAGES } from './constants';

import StepIndicator from './components/StepIndicator';
import Step1Motiv from './components/Step1Motiv';
import Step2Location from './components/Step2Location';
import Step3Style from './components/Step3Style';
import Step4Time from './components/Step4Time';
import LoadingSpinner from './components/LoadingSpinner';
import Results from './components/Results';
import Profile from './components/Profile';
import PlannerWizard from './components/PlannerWizard';
import PlanningResult from './components/PlanningResult';
// Fix: Changed import to a named import as the error indicates no default export was found.
import { AddSpotModal } from './components/AddSpotModal';
import { UserIcon } from './components/icons/CardIcons';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_USER: User = { id: 'default', username: 'Mein Profil' };
const USER_DATA_KEY = `spotfinder_userdata_${DEFAULT_USER.id}`;

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 */
const getDistance = (coords1: Coordinates, coords2: Coordinates): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords1.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};


const App: React.FC = () => {
  const [mode, setMode] = useState<'quick' | 'planner'>('quick');
  
  // Quick Search State
  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    mediaType: 'photo',
    motivs: [],
    radius: 20,
    styles: [],
    timeOfDay: 'Nachmittag',
  });
  const [spots, setSpots] = useState<PhotoSpot[]>([]);
  const [imageStates, setImageStates] = useState<{ [spotId: string]: ImageState }>({});
  
  // Planner State
  const [plan, setPlan] = useState<PhotoshootPlan | null>(null);
  const [plannerStep, setPlannerStep] = useState(1);
  const [plannerCriteria, setPlannerCriteria] = useState<Partial<PlannerCriteria>>({
      motivs: [],
      styles: [],
      keyElements: '',
      dateRange: { start: '', end: '' },
      desiredWeather: [],
      desiredLight: [],
      radius: 25,
  });


  // Shared State
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string>('');
  const [view, setView] = useState<'search' | 'results' | 'profile'>('search');
  const [userData, setUserData] = useState<UserData>({ favorites: [], visited: [], savedPlans: [] });
  const [isAddSpotModalOpen, setIsAddSpotModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const [isOffline, setIsOffline] = useState(false);


  // Load user data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(USER_DATA_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        // Simple migration: if visited is an array of strings (old format), clear it.
        if (data.visited && data.visited.length > 0 && typeof data.visited[0] === 'string') {
            data.visited = [];
        }
        setUserData({ favorites: [], visited: [], savedPlans: [], ...data });
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem(USER_DATA_KEY);
      }
    }
  }, []);

  // Loading message effect
  useEffect(() => {
    let interval: number;
    if (isLoading) {
      const messages = mode === 'quick' ? QUICK_SEARCH_LOADING_MESSAGES : PLANNER_LOADING_MESSAGES;
      setLoadingMessage(messages[0]);
      let i = 1;
      interval = window.setInterval(() => {
        setLoadingMessage(messages[i % messages.length]);
        i++;
      }, 2500);
    }
    return () => window.clearInterval(interval);
  }, [isLoading, mode]);

  const showToast = useCallback((message: string) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

    const resetQuickSearch = useCallback(() => {
    setCurrentStep(1);
    setCriteria({
        mediaType: 'photo',
        motivs: [],
        radius: 20,
        styles: [],
        timeOfDay: 'Nachmittag',
    });
    setSpots([]);
    setImageStates({});
    setError('');
    setView('search');
  }, []);

  const resetPlannerState = useCallback(() => {
    setPlan(null);
    setPlannerStep(1);
    setPlannerCriteria({
        motivs: [],
        styles: [],
        keyElements: '',
        dateRange: { start: '', end: '' },
        desiredWeather: [],
        desiredLight: [],
        radius: 25,
    });
  }, []);

  // Handle online/offline status and initial app reset
  useEffect(() => {
    const handleOnline = () => {
        setIsOffline(false);
        showToast('Du bist wieder online!');
    };
    const handleOffline = () => {
        setIsOffline(true);
        setView('profile'); // Force profile view when offline
        showToast('Du bist offline. Nur gespeicherte Daten sind verfügbar.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial setup on mount
    if (!navigator.onLine) {
        handleOffline();
    } else {
        // This is the "hard reset" logic for a fresh online start
        resetQuickSearch();
        resetPlannerState();
        setMode('quick');
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [resetQuickSearch, resetPlannerState, showToast]);

  const hardReset = useCallback(() => {
    if (isOffline) {
        setView('profile');
        return;
    }
    resetQuickSearch();
    resetPlannerState();
    setMode('quick');
  }, [isOffline, resetQuickSearch, resetPlannerState]);

  const handleModeChange = (newMode: 'quick' | 'planner') => {
    if (mode === newMode) return;
    navigator.vibrate?.(50);
    hardReset();
    setMode(newMode);
  }

  const saveUserData = (data: UserData) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  };

  const handleToggleFavorite = (spot: PhotoSpot) => {
    const isFavorite = userData.favorites.some(fav => fav.id === spot.id);
    const newFavorites = isFavorite
      ? userData.favorites.filter(fav => fav.id !== spot.id)
      : [...userData.favorites, spot];
    
    const newUserData = { ...userData, favorites: newFavorites };
    setUserData(newUserData);
    saveUserData(newUserData);
  };

  const handleToggleVisited = (spot: PhotoSpot) => {
    const isVisited = userData.visited.some(s => s.id === spot.id);
    const newVisited = isVisited
      ? userData.visited.filter(s => s.id !== spot.id)
      : [...userData.visited, spot];

    const newUserData = { ...userData, visited: newVisited };
    setUserData(newUserData);
    saveUserData(newUserData);
  };
  
  const handleSaveNewSpot = async (spotData: { name: string; address: string; description: string }) => {
    const { name, address, description } = spotData;
    if (isOffline) {
        throw new Error("Du musst online sein, um einen neuen Ort zu geocodieren und zu speichern.");
    }
    const geocoded = await geocodeLocation(address);
    
    const newSpot: PhotoSpot = {
        id: name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now(),
        name,
        address: geocoded.name, // Use the verified name from geocoding
        description,
        coordinates: { lat: geocoded.lat, lon: geocoded.lon },
        matchingCriteria: ['Manuell hinzugefügt'],
    };

    const newUserData = { ...userData, visited: [...userData.visited, newSpot] };
    setUserData(newUserData);
    saveUserData(newUserData);
    setIsAddSpotModalOpen(false);
  };

  const handleNextStep = () => {
    navigator.vibrate?.(50);
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSearch();
    }
  };

  const handlePrevStep = () => {
    navigator.vibrate?.(50);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const isNextDisabled = (): boolean => {
    if (isOffline) return true;
    switch(currentStep) {
        case 1: return criteria.motivs.length === 0;
        case 2: return !userLocation;
        case 3: return false; // Optional
        case 4: return false;
        default: return true;
    }
  }

  const handleSearch = async () => {
    if (isOffline) {
        setError('Du bist offline. Bitte stelle eine Internetverbindung her, um zu suchen.');
        return;
    }
    if (!userLocation) {
      setError('Bitte gib deinen Standort an.');
      setCurrentStep(2);
      return;
    }
    if (criteria.motivs.length === 0) {
        setError('Bitte wähle mindestens ein Motiv.');
        setCurrentStep(1);
        return;
    }
    setError('');
    setIsLoading(true);
    setView('search'); 

    try {
      const results = await findPhotoSpots(criteria, userLocation);
      const spotsWithDistance = results.map(spot => ({
        ...spot,
        distance: userLocation ? parseFloat(getDistance(userLocation, spot.coordinates).toFixed(1)) : undefined
      }));
      setSpots(spotsWithDistance);
      setView('results');
    } catch (e: any) {
      setError(e.message || 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadImage = useCallback(async (spotId: string, spotName: string, description: string) => {
    if (isOffline) {
        setImageStates(prev => ({ ...prev, [spotId]: { isLoading: false, image: null, error: 'Bilder können offline nicht geladen werden.', progress: 0 } }));
        return;
    }
    let progressInterval: number;
    
    // Start "fake" progress
    setImageStates(prev => ({ ...prev, [spotId]: { isLoading: true, image: null, error: null, progress: 0 } }));
    
    let progress = 0;
    progressInterval = window.setInterval(() => {
        progress += 5;
        if (progress >= 95) {
            window.clearInterval(progressInterval);
        }
        setImageStates(prev => {
            if (prev[spotId] && !prev[spotId].isLoading) {
                window.clearInterval(progressInterval);
                return prev;
            }
            return { ...prev, [spotId]: { ...prev[spotId], isLoading: true, image: null, error: null, progress } };
        });
    }, 200);

    try {
      const image = await generateSpotImage(spotName, description);
      window.clearInterval(progressInterval);
      setImageStates(prev => ({ ...prev, [spotId]: { isLoading: false, image, error: null, progress: 100 } }));
    } catch (e: any) {
      window.clearInterval(progressInterval);
      setImageStates(prev => ({ ...prev, [spotId]: { isLoading: false, image: null, error: e.message || 'Bild konnte nicht geladen werden.', progress: 0 } }));
    }
  }, [isOffline]);
  
  // --- PLANNER HANDLERS ---
  const handleGeneratePlan = async () => {
    if (isOffline) {
        setError('Du bist offline. Bitte stelle eine Internetverbindung her, um einen Plan zu erstellen.');
        return;
    }
    if (!plannerCriteria.userLocation) {
        setError("Bitte gib zuerst deinen Standort an.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
        const planResult = await generatePhotoshootPlan(plannerCriteria as PlannerCriteria);
        const planWithId = {
            ...planResult,
            id: planResult.title.toLowerCase().replace(/\s/g, '-') + '-' + Date.now()
        }
        setPlan(planWithId);
    } catch(e: any) {
        setError(e.message || "Fehler bei der Erstellung des Plans.");
        setPlan(null);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSavePlan = (planToSave: PhotoshootPlan) => {
    if (userData.savedPlans.some(p => p.id === planToSave.id)) return; // Already saved

    const newPlans = [...userData.savedPlans, planToSave];
    const newUserData = { ...userData, savedPlans: newPlans };
    setUserData(newUserData);
    saveUserData(newUserData);
    showToast('Plan erfolgreich in deinem Profil gespeichert!');
  };
  
  const handleDeletePlan = (planId: string) => {
    const newPlans = userData.savedPlans.filter(p => p.id !== planId);
    const newUserData = { ...userData, savedPlans: newPlans };
    setUserData(newUserData);
    saveUserData(newUserData);
  }
  
  const goToProfile = () => {
      navigator.vibrate?.(50);
      setView('profile');
      setMode('quick'); // Switch mode to avoid showing planner UI behind profile
  }

  const renderQuickSearch = () => {
    if (view === 'results') {
      return <Results 
        spots={spots} 
        userLocation={userLocation!}
        resetSearch={resetQuickSearch}
        onRemix={handleSearch}
        currentUser={DEFAULT_USER}
        userData={userData}
        onToggleFavorite={handleToggleFavorite}
        onToggleVisited={handleToggleVisited}
        imageStates={imageStates}
        onLoadImage={handleLoadImage}
        isOffline={isOffline}
      />;
    }
    
    if (view === 'profile') {
        return <Profile
            currentUser={DEFAULT_USER}
            userData={userData}
            userLocation={userLocation}
            onToggleFavorite={handleToggleFavorite}
            onToggleVisited={handleToggleVisited}
            onDeletePlan={handleDeletePlan}
            setView={setView}
            onAddNewSpot={() => setIsAddSpotModalOpen(true)}
            imageStates={imageStates}
            onLoadImage={handleLoadImage}
            isOffline={isOffline}
        />
    }

    const renderCurrentStep = () => {
        switch (currentStep) {
          case 1:
            return <Step1Motiv criteria={criteria} setCriteria={setCriteria} motivs={MOTIVS} />;
          case 2:
            return <Step2Location 
                     radius={criteria.radius}
                     onRadiusChange={(r) => setCriteria(prev => ({ ...prev, radius: r }))}
                     setUserLocation={setUserLocation} 
                     maxRadius={MAX_RADIUS} 
                     isOffline={isOffline}
                   />;
          case 3:
            return <Step3Style criteria={criteria} setCriteria={setCriteria} styles={DYNAMIC_STYLES} />;
          case 4:
            return <Step4Time criteria={criteria} setCriteria={setCriteria} timesOfDay={TIMES_OF_DAY} />;
          default:
            return null;
        }
      };
    
    const totalSteps = 4;
    return (
      <motion.div
        key="quick-search-wizard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="futuristic-bg p-8 rounded-2xl futuristic-border w-full max-w-3xl mx-auto shadow-2xl"
      >
        <div className="mb-8">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {renderCurrentStep()}
        <div className="flex justify-between mt-10">
          <button onClick={handlePrevStep} disabled={currentStep === 1} className="px-8 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50">Zurück</button>
          <button onClick={handleNextStep} disabled={isNextDisabled()} className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:bg-gray-700/80 disabled:cursor-not-allowed disabled:shadow-none btn-primary-glow">
            {currentStep === totalSteps ? 'Spots finden' : 'Weiter'}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderPlanner = () => {
    if (plan) {
        const isPlanSaved = userData.savedPlans.some(p => p.id === plan.id);
        return <PlanningResult 
            plan={plan} 
            onReset={resetPlannerState}
            onSavePlan={handleSavePlan}
            onGoToProfile={goToProfile}
            isSaved={isPlanSaved}
        />;
    }
    return <PlannerWizard 
        step={plannerStep}
        setStep={setPlannerStep}
        criteria={plannerCriteria}
        setCriteria={setPlannerCriteria}
        onGeneratePlan={handleGeneratePlan}
        isOffline={isOffline}
    />;
  }
  
  const renderContent = () => {
    if (isLoading && !isOffline) {
      return (
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg">{loadingMessage}</p>
          <p className="text-gray-400">Dies kann einen Moment dauern.</p>
        </div>
      );
    }

    return mode === 'quick' ? renderQuickSearch() : renderPlanner();
  };
  
  return (
    <div className="min-h-screen text-white font-sans flex flex-col items-center relative">
        {isOffline && (
            <div className="w-full text-center bg-yellow-600 text-black p-2 text-sm font-semibold sticky top-0 z-50">
                Du bist offline. Nur gespeicherte Daten sind verfügbar.
            </div>
        )}
       <div className="w-full flex-grow flex flex-col items-center safe-area-padding">
        <AnimatePresence>
            {toast && (
                <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-8 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
                >
                    {toast.message}
                </motion.div>
            )}
        </AnimatePresence>
        <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-4">
            <h1 className="text-4xl font-extrabold gradient-text-primary tracking-tight cursor-pointer" onClick={hardReset}>SpotFinder AI</h1>
            <div className="flex items-center gap-4">
                <button onClick={goToProfile} className="flex items-center gap-2 font-semibold hover:text-primary-400 transition-colors">
                    <UserIcon className="w-6 h-6"/>
                    {DEFAULT_USER.username}
                </button>
            </div>
        </header>

        <div className={`w-full max-w-2xl mx-auto flex justify-center items-center mb-8 futuristic-bg p-1.5 rounded-xl futuristic-border ${isOffline ? 'opacity-50 pointer-events-none' : ''}`}>
            <button onClick={() => handleModeChange('quick')} className={`w-1/2 text-center py-2.5 rounded-lg font-semibold transition-all ${mode === 'quick' ? 'bg-primary-600 text-white shadow-lg' : 'hover:bg-white/5'}`}>
                Schnellsuche
            </button>
            <button onClick={() => handleModeChange('planner')} className={`w-1/2 text-center py-2.5 rounded-lg font-semibold transition-all ${mode === 'planner' ? 'bg-primary-600 text-white shadow-lg' : 'hover:bg-white/5'}`}>
                Creative Studio
            </button>
        </div>
        
        <main className="w-full max-w-6xl mx-auto flex-grow flex items-center justify-center">
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </main>

        {isAddSpotModalOpen && (
            <AddSpotModal
                onClose={() => setIsAddSpotModalOpen(false)}
                onSave={handleSaveNewSpot}
                isOffline={isOffline}
            />
        )}
       </div>
    </div>
  );
};

export default App;