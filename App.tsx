

import React, { useState, useEffect } from 'react';
import { SearchCriteria, Coordinates, PhotoSpot, User, UserData, PhotoshootPlan, PlannerCriteria, TimeSlotSuggestion } from './types';
import { findPhotoSpots, generatePhotoshootPlan, getTimeSlotSuggestions, initializeGenAI } from './services/geminiService';
import { MOTIVS, DYNAMIC_STYLES, TIMES_OF_DAY, MAX_RADIUS, QUICK_SEARCH_LOADING_MESSAGES, PLANNER_LOADING_MESSAGES, PLANNER_SUGGESTION_LOADING_MESSAGES } from './constants';

import StepIndicator from './components/StepIndicator';
import Step1Motiv from './components/Step1Motiv';
import Step2Location from './components/Step2Location';
import Step3Style from './components/Step3Style';
import Step4Time from './components/Step4Time';
import LoadingSpinner from './components/LoadingSpinner';
import Results from './components/Results';
import AuthModal from './components/AuthModal';
import Profile from './components/Profile';
import PlannerWizard from './components/PlannerWizard';
import PlanningResult from './components/PlanningResult';
import SpotDetail from './components/SpotDetail';
import ApiKeyModal from './components/ApiKeyModal';
import { UserIcon } from './components/icons/CardIcons';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
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
  const [selectedSpot, setSelectedSpot] = useState<PhotoSpot | null>(null);
  
  // Planner State
  const [plan, setPlan] = useState<PhotoshootPlan | null>(null);
  const [plannerPhase, setPlannerPhase] = useState<'input' | 'suggestions' | 'plan'>('input');
  const [plannerStep, setPlannerStep] = useState(1);
  const [plannerCriteria, setPlannerCriteria] = useState<Partial<PlannerCriteria>>({
      subject: '',
      styles: [],
      keyElements: '',
      desiredWeather: [],
      desiredLight: [],
      radius: 25,
  });
  const [plannerSuggestions, setPlannerSuggestions] = useState<TimeSlotSuggestion[]>([]);


  // Shared State
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string>('');
  const [view, setView] = useState<'search' | 'results' | 'profile' | 'detail'>('search');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>({ favorites: [], visited: [], savedPlans: [] });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);


  // Check for API key on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        setApiKey(savedApiKey);
        initializeGenAI(savedApiKey);
    }
  }, []);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('spotfinder_user');
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      setCurrentUser(user);
      loadUserData(user.id);
    }
  }, []);

  // Loading message effect
  useEffect(() => {
    // Fix: Replaced NodeJS.Timeout with number for browser compatibility.
    let interval: number;
    if (isLoading) {
      let messages: string[];
      if (mode === 'quick') {
        messages = QUICK_SEARCH_LOADING_MESSAGES;
      } else {
        messages = plannerPhase === 'suggestions' ? PLANNER_SUGGESTION_LOADING_MESSAGES : PLANNER_LOADING_MESSAGES;
      }

      setLoadingMessage(messages[0]);
      let i = 1;
      interval = setInterval(() => {
        setLoadingMessage(messages[i % messages.length]);
        i++;
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading, mode, plannerPhase]);


  const loadUserData = (userId: string) => {
    const savedData = localStorage.getItem(`spotfinder_userdata_${userId}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setUserData({ favorites: [], visited: [], savedPlans: [], ...data });
    }
  };

  const saveUserData = (userId: string, data: UserData) => {
    localStorage.setItem(`spotfinder_userdata_${userId}`, JSON.stringify(data));
  };
  
  const handleApiKeySave = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    initializeGenAI(key);
  };

  const handleLogin = (username: string) => {
    const user = { id: username.toLowerCase(), username };
    setCurrentUser(user);
    localStorage.setItem('spotfinder_user', JSON.stringify(user));
    loadUserData(user.id);
    setIsAuthModalOpen(false);
    
    if (pendingAction) {
        pendingAction();
        setPendingAction(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserData({ favorites: [], visited: [], savedPlans: [] });
    localStorage.removeItem('spotfinder_user');
    setView('search');
  };

  const handleToggleFavorite = (spot: PhotoSpot) => {
    if (!currentUser) {
      setPendingAction(() => () => handleToggleFavorite(spot));
      setIsAuthModalOpen(true);
      return;
    }
    const isFavorite = userData.favorites.some(fav => fav.id === spot.id);
    const newFavorites = isFavorite
      ? userData.favorites.filter(fav => fav.id !== spot.id)
      : [...userData.favorites, spot];
    
    const newUserData = { ...userData, favorites: newFavorites };
    setUserData(newUserData);
    saveUserData(currentUser.id, newUserData);
  };

  const handleToggleVisited = (spotId: string) => {
    if (!currentUser) {
      setPendingAction(() => () => handleToggleVisited(spotId));
      setIsAuthModalOpen(true);
      return;
    }
    const isVisited = userData.visited.includes(spotId);
    const newVisited = isVisited
      ? userData.visited.filter(id => id !== spotId)
      : [...userData.visited, spotId];

    const newUserData = { ...userData, visited: newVisited };
    setUserData(newUserData);
    saveUserData(currentUser.id, newUserData);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSearch();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const isNextDisabled = (): boolean => {
    switch(currentStep) {
        case 1: return criteria.motivs.length === 0;
        case 2: return !userLocation;
        case 3: return false; // Optional
        case 4: return false;
        default: return true;
    }
  }

  const handleSearch = async () => {
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
      setSpots(results);
      setView('results');
    } catch (e: any) {
      setError(e.message || 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSpot = (spot: PhotoSpot) => {
    setSelectedSpot(spot);
    setView('detail');
  };
  
  // --- PLANNER HANDLERS ---
  const handleGetSuggestions = async () => {
    if (!plannerCriteria.userLocation) {
        setError("Bitte gib zuerst deinen Standort an.");
        return;
    }
    setError('');
    setIsLoading(true);
    setPlannerPhase('suggestions');
    try {
        const result = await getTimeSlotSuggestions(plannerCriteria as PlannerCriteria);
        setPlannerSuggestions(result);
        if (result.length === 0) {
            setError("Leider konnten keine passenden Zeitfenster gefunden werden. Versuche, die Kriterien anzupassen (z.B. anderes Wetter oder Licht).");
        } else {
             setPlannerStep(4);
        }
    } catch(e: any) {
        setError(e.message || "Fehler bei der Suche nach Terminvorschlägen.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGeneratePlan = async (dateTime: string) => {
    setError('');
    setIsLoading(true);
    setPlannerPhase('plan');
    try {
        const planResult = await generatePhotoshootPlan(plannerCriteria as PlannerCriteria, dateTime);
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
    if (!currentUser) {
        setPendingAction(() => () => handleSavePlan(planToSave));
        setIsAuthModalOpen(true);
        return;
    }
    if (userData.savedPlans.some(p => p.id === planToSave.id)) return; // Already saved

    const newPlans = [...userData.savedPlans, planToSave];
    const newUserData = { ...userData, savedPlans: newPlans };
    setUserData(newUserData);
    saveUserData(currentUser.id, newUserData);
    alert('Plan erfolgreich in deinem Profil gespeichert!');
  };
  
  const handleDeletePlan = (planId: string) => {
    if (!currentUser) return;
    const newPlans = userData.savedPlans.filter(p => p.id !== planId);
    const newUserData = { ...userData, savedPlans: newPlans };
    setUserData(newUserData);
    saveUserData(currentUser.id, newUserData);
  }
  
  const goToProfile = () => {
      setView('profile');
      setMode('quick'); // Switch mode to avoid showing planner UI behind profile
  }

  const resetQuickSearch = () => {
    setCurrentStep(1);
    setCriteria({
        mediaType: 'photo',
        motivs: [],
        radius: 20,
        styles: [],
        timeOfDay: 'Nachmittag',
    });
    setSpots([]);
    setError('');
    setView('search');
    setSelectedSpot(null);
  };

  const resetPlannerState = () => {
    setPlan(null);
    setPlannerPhase('input');
    setPlannerStep(1);
    setPlannerCriteria({
        subject: '',
        styles: [],
        keyElements: '',
        desiredWeather: [],
        desiredLight: [],
        radius: 25,
    });
    setPlannerSuggestions([]);
  };

  const hardReset = () => {
    resetQuickSearch();
    resetPlannerState();
    setMode('quick');
  }

  const renderQuickSearch = () => {
    if (view === 'results') {
      return <Results 
        spots={spots} 
        userLocation={userLocation!}
        resetSearch={resetQuickSearch}
        currentUser={currentUser}
        userData={userData}
        onToggleFavorite={handleToggleFavorite}
        onToggleVisited={handleToggleVisited}
        onSpotSelect={handleSelectSpot}
      />;
    }

    if (view === 'detail' && selectedSpot) {
      return <SpotDetail spot={selectedSpot} onBack={() => setView('results')} />
    }
    
    if (view === 'profile' && currentUser) {
        return <Profile
            currentUser={currentUser}
            userData={userData}
            userLocation={userLocation}
            onToggleFavorite={handleToggleFavorite}
            onToggleVisited={handleToggleVisited}
            onDeletePlan={handleDeletePlan}
            setView={setView}
            onSpotSelect={handleSelectSpot}
        />
    }

    const renderCurrentStep = () => {
        switch (currentStep) {
          case 1:
            return <Step1Motiv criteria={criteria} setCriteria={setCriteria} motivs={MOTIVS} />;
          case 2:
            return <Step2Location criteria={criteria} setCriteria={setCriteria} setUserLocation={setUserLocation} maxRadius={MAX_RADIUS} />;
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
      <div className="futuristic-bg p-8 rounded-2xl futuristic-border w-full max-w-3xl mx-auto shadow-2xl">
        <div className="mb-8">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {renderCurrentStep()}
        <div className="flex justify-between mt-10">
          <button onClick={handlePrevStep} disabled={currentStep === 1} className="px-8 py-3 bg-gray-600/50 border border-gray-500 text-white rounded-lg hover:bg-gray-500/50 transition-all disabled:opacity-50">Zurück</button>
          <button onClick={handleNextStep} disabled={isNextDisabled()} className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-500/80 disabled:cursor-not-allowed disabled:shadow-none btn-primary-glow">
            {currentStep === totalSteps ? 'Spots finden' : 'Weiter'}
          </button>
        </div>
      </div>
    );
  };

  const renderPlanner = () => {
    if (plan) {
        const isPlanSaved = currentUser ? userData.savedPlans.some(p => p.id === plan.id) : false;
        return <PlanningResult 
            plan={plan} 
            onReset={resetPlannerState}
            onSavePlan={handleSavePlan}
            onGoToProfile={goToProfile}
            isSaved={isPlanSaved}
            isLoggedIn={!!currentUser}
        />;
    }
    return <PlannerWizard 
        step={plannerStep}
        setStep={setPlannerStep}
        criteria={plannerCriteria}
        setCriteria={setPlannerCriteria}
        suggestions={plannerSuggestions}
        onGetSuggestions={handleGetSuggestions}
        onGeneratePlan={handleGeneratePlan}
    />;
  }
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg">{loadingMessage}</p>
          <p className="text-gray-400">Dies kann einen Moment dauern.</p>
        </div>
      );
    }
    if (error && !plan && view !== 'results' && mode === 'quick' && view !== 'detail') {
        return <p className="text-red-400 text-center mb-4">{error}</p>
    }

    return mode === 'quick' ? renderQuickSearch() : renderPlanner();
  };
  
  if (!apiKey) {
    return <ApiKeyModal onSave={handleApiKeySave} />;
  }
  
  return (
    <div className="min-h-screen text-white font-sans flex flex-col items-center p-4 sm:p-8 relative">
        <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-400 text-transparent bg-clip-text tracking-tight cursor-pointer" onClick={hardReset}>SpotFinder AI</h1>
            <div>
                {currentUser ? (
                    <div className="flex items-center gap-4">
                        <button onClick={goToProfile} className="flex items-center gap-2 font-semibold hover:text-red-400 transition-colors">
                            <UserIcon className="w-6 h-6"/>
                            {currentUser.username}
                        </button>
                        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
                    </div>
                ) : (
                    <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 bg-gray-700/50 border border-gray-600 text-white font-semibold rounded-lg hover:bg-gray-600/50 transition-all">
                        Login
                    </button>
                )}
            </div>
        </header>

        <div className="w-full max-w-6xl mx-auto flex justify-center items-center mb-8 futuristic-bg p-2 rounded-xl futuristic-border">
            <button onClick={() => setMode('quick')} className={`w-1/2 text-center py-2.5 rounded-lg font-semibold transition-all ${mode === 'quick' ? 'bg-red-600 text-white btn-primary-glow' : 'hover:bg-white/5'}`}>
                Schnellsuche
            </button>
            <button onClick={() => setMode('planner')} className={`w-1/2 text-center py-2.5 rounded-lg font-semibold transition-all ${mode === 'planner' ? 'bg-red-600 text-white btn-primary-glow' : 'hover:bg-white/5'}`}>
                Shooting-Planer
            </button>
        </div>
        
        <main className="w-full max-w-6xl mx-auto flex-grow flex items-center justify-center">
            {renderContent()}
        </main>

        {isAuthModalOpen && <AuthModal 
            onLogin={handleLogin} 
            onClose={() => {
                setIsAuthModalOpen(false);
                setPendingAction(null);
            }} 
        />}
    </div>
  );
};

export default App;