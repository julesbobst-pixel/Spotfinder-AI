import React from 'react';

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
  name:string;
  address: string;
  description: string;
  coordinates: Coordinates;
  distance?: number; // in km, calculated client-side
  matchingCriteria: string[];
  weather?: WeatherData;
  keyAspects?: string[];
  bestTimeToVisit?: string;
  photoTips?: string[];
  proTip?: string;
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
    visited: PhotoSpot[]; // array of spot objects
    savedPlans: PhotoshootPlan[];
}

// For NEW Planner Mode
export interface PlannerCriteria {
    // Step 1
    motivs: string[];
    styles: string[];
    keyElements: string; // Optional short text for specifics
    // Step 2
    dateRange: {
        start: string; // YYYY-MM-DD
        end: string;   // YYYY-MM-DD
    }
    desiredWeather: string[];
    desiredLight: string[];
    // Step 3
    userLocation: Coordinates;
    radius: number;
}

export interface PhotoshootPlan {
    id: string;
    title: string;
    dateTime: string; // The chosen optimal date time by the AI
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

export interface GeneratedIdea {
    title: string;
    description: string;
    styles: string[];
    keyElements: string;
}

export type ImageState = {
    isLoading: boolean;
    image: string | null;
    error: string | null;
    progress?: number;
};