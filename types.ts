import React from 'react';

// Fix: Removed self-import of types from this file which caused declaration conflicts.
export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodedLocation extends Coordinates {
    name: string;
}

export interface SearchCriteria {
  mediaType: 'photo' | 'video';
  motivs: string[];
  radius: number;
  styles: string[];
  timeOfDay: string;
}

export interface PhotoSpot {
  id: string;
  name: string;
  address: string;
  description: string;
  coordinates: Coordinates;
  distance?: number; // in km, calculated client-side
  matchingCriteria: string[];
  weather?: WeatherData;
}

export interface DetailedSpotInfo {
    address: string;
    summary: string;
    keyAspects: string[];
    travelInfo: {
        parking: string;
        publicTransport: string;
    };
    bestTimeToVisit: string;
    imagePrompt: string;
}

export interface WeatherData {
  condition: string;
  temperature: number; // in Celsius
  precipitationChance: number; // in %
  windSpeed: number; // in km/h
  notes?: string;
}

// For Auth
export interface User {
    id: string;
    username: string;
}

export interface UserData {
    favorites: PhotoSpot[];
    visited: string[]; // array of spot IDs
    savedPlans: PhotoshootPlan[];
}

// For NEW Planner Mode
export interface PlannerCriteria {
    // Step 1
    subject: string;
    styles: string[];
    keyElements: string; // Optional short text for specifics
    // Step 2
    desiredWeather: string[];
    desiredLight: string[];
    // Step 3
    userLocation: Coordinates;
    radius: number;
}

export interface TimeSlotSuggestion {
    dateTime: string; // ISO format string
    reason: string;
}

export interface PhotoshootPlan {
    id: string;
    title: string;
    spot: {
        name: string;
        description: string;
        coordinates: Coordinates;
    };
    travelPlan: {
        departureTime: string;
        notes: string;
    };
    weatherForecast: WeatherData;
    lightingAnalysis: {
        condition: string;
        lightPollution: string; // e.g., "Gering", "Moderat", "Hoch"
    };
    equipmentList: string[];
    notesAndTips: string[];
    // New creative briefing fields
    creativeVision: string;
    shotList: string[];
    moodImagePrompts: string[];
}

export interface IdeaStarter {
    id: string;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    prefill: {
        subject: string;
        styles: string[];
        keyElements: string;
    }
}

export interface ImageAnalysis {
  photographicElements: string[];
  colorPalette: string[]; // hex codes
}