
import React from 'react';
import { LandscapeIcon, ArchitectureIcon, PortraitIcon, StreetIcon, LongExposureIcon, MacroIcon, LostPlaceIcon, WildlifeIcon, AstroIcon } from './components/icons/MotivIcons';
import { MoonIcon, SparklesIcon } from './components/icons/CardIcons';

export const MOTIVS = [
  { id: 'landschaft', label: 'Landschaft', icon: LandscapeIcon },
  { id: 'architektur', label: 'Architektur', icon: ArchitectureIcon },
  { id: 'portrait', label: 'Portrait / Menschen', icon: PortraitIcon },
  { id: 'street', label: 'Street', icon: StreetIcon },
  { id: 'astro', label: 'Astrofotografie', icon: AstroIcon },
  { id: 'tiere', label: 'Tiere', icon: WildlifeIcon },
  { id: 'langzeitbelichtung', label: 'Langzeitbelichtung', icon: LongExposureIcon },
  { id: 'makro', label: 'Makro', icon: MacroIcon },
  { id: 'lost-place', label: 'Lost Place', icon: LostPlaceIcon },
];

export const DYNAMIC_STYLES: { [key: string]: string[] } = {
  landschaft: ['Malerisch', 'Dramatisch', 'Minimalistisch', 'Natürlich', 'Mystisch', 'Weitläufig', 'Für Drohnenflüge geeignet'],
  architektur: ['Modern', 'Urban', 'Industriell', 'Minimalistisch', 'Futuristisch', 'Vintage', 'Symmetrisch', 'Brutalismus'],
  portrait: ['Romantisch', 'Natürlich', 'Urban', 'Dramatisch', 'Vintage', 'Lifestyle', 'Fashion', 'Sinnlich'],
  street: ['Urban', 'Kontrastreich', 'Vintage', 'Nachtfotografie', 'Minimalistisch', 'Dokumentarisch', 'Abstrakt'],
  astro: ['Mystisch', 'Dramatisch', 'Ruhig / Abgelegen', 'Weitläufig', 'Futuristisch', 'Minimalistisch'],
  tiere: ['Natürlich', 'Actionreich', 'Geduldig', 'Nahaufnahme', 'Wildnis', 'Ländlich'],
  langzeitbelichtung: ['Dynamisch', 'Mystisch', 'Urban', 'Minimalistisch', 'Abstrakt', 'Fließend'],
  makro: ['Detailreich', 'Abstrakt', 'Natürlich', 'Minimalistisch', 'Texturiert'],
  'lost-place': ['Mystisch', 'Industriell', 'Vintage', 'Verfallen', 'Dramatisch', 'Unheimlich'],
  default: [
    'Modern', 'Minimalistisch', 'Urban', 'Industriell',
    'Natürlich', 'Ländlich', 'Romantisch', 'Mystisch',
    'Futuristisch', 'Vintage', 'Malerisch', 'Dramatisch',
    'Für Drohnenflüge geeignet'
  ]
};

// Fix: Add STYLES export for PlannerStep1Idea component.
const allStyles = Object.values(DYNAMIC_STYLES).flat();
export const STYLES = [...new Set(allStyles)].sort();

export const PHOTO_SUBJECTS = [
    'Landschaft', 'Portrait / Menschen', 'Architektur', 'Streetfotografie', 'Astrofotografie', 'Tierfotografie', 'Auto / Fahrzeug', 'Produkt', 'Event'
];

export const DESIRED_WEATHER = [
    'Klarer Himmel', 'Leicht bewölkt', 'Dramatische Wolken', 'Nebel', 'Regen / Nasse Strassen', 'Schnee'
];

export const DESIRED_LIGHT = [
    'Goldene Stunde (Sonnenaufgang)', 'Goldene Stunde (Sonnenuntergang)', 'Blaue Stunde', 'Helles Tageslicht', 'Weiches / Bewölktes Licht', 'Nacht / Sterne'
];

export const INITIAL_IDEA_STARTERS = [
    {
        id: 'golden-hour-landscape',
        title: 'Goldene Stunde Landschaft',
        description: 'Fange das magische, warme Licht kurz nach Sonnenaufgang oder vor Sonnenuntergang in einer malerischen Landschaft ein.',
        icon: LandscapeIcon,
        prefill: {
            subject: 'Landschaft',
            styles: ['Malerisch', 'Natürlich', 'Dramatisch'],
            keyElements: 'Weiches, warmes Licht am Horizont'
        }
    },
    {
        id: 'urban-nightscape',
        title: 'Urbanes Nacht-Abenteuer',
        description: 'Erkunde die Lichter der Stadt bei Nacht, von leuchtenden Hochhäusern bis hin zu den Lichtspuren des Verkehrs.',
        icon: ArchitectureIcon,
        prefill: {
            subject: 'Architektur',
            styles: ['Urban', 'Modern', 'Futuristisch'],
            keyElements: 'Lichtspuren, leuchtende Gebäude'
        }
    },
    {
        id: 'mystical-portrait',
        title: 'Mystisches Nebel-Portrait',
        description: 'Nutze natürlichen Nebel für ein geheimnisvolles und atmosphärisches Portrait-Shooting in der Natur.',
        icon: PortraitIcon,
        prefill: {
            subject: 'Portrait / Menschen',
            styles: ['Mystisch', 'Romantisch', 'Natürlich'],
            keyElements: 'Person in einer nebligen Waldlandschaft'
        }
    },
    {
        id: 'starry-sky',
        title: 'Sternenklare Nacht',
        description: 'Finde einen Ort mit geringer Lichtverschmutzung, um die Milchstrasse oder faszinierende Sternenlandschaften festzuhalten.',
        icon: AstroIcon,
        prefill: {
            subject: 'Astrofotografie',
            styles: ['Mystisch', 'Dramatisch', 'Ruhig / Abgelegen'],
            keyElements: 'Klare Sicht auf die Milchstrasse'
        }
    }
]


export const TIMES_OF_DAY = [
  { value: 'Morgen', label: 'Morgen' },
  { value: 'Vormittag', label: 'Vormittag' },
  { value: 'Mittag', label: 'Mittag' },
  { value: 'Nachmittag', label: 'Nachmittag' },
  { value: 'Abend', label: 'Abend' },
  { value: 'Nacht', label: 'Nacht' },
];

export const MAX_RADIUS = 100;

export const WEATHER_DETAILS_CONFIG = {
    temperature: true,
    precipitationChance: true,
    windSpeed: true,
};

export const QUICK_SEARCH_LOADING_MESSAGES = [
    "Analysiere deine Kriterien...",
    "Durchsuche Karten nach passenden Orten...",
    "Prüfe die Top-Kandidaten...",
    "Stelle die Ergebnisse für dich zusammen...",
    "Fast fertig..."
];

export const PLANNER_SUGGESTION_LOADING_MESSAGES = [
    "Analysiere deine kreative Vision...",
    "Prüfe Wetterprognosen für die kommenden Tage...",
    "Identifiziere die besten Zeitfenster...",
    "Bereite die Terminvorschläge vor..."
];

export const PLANNER_LOADING_MESSAGES = [
    "Verstehe deine kreative Vision...",
    "Suche den perfekten Spot für deine Idee...",
    "Analysiere Reiseroute und Zeitplan...",
    "Erstelle Wetter- und Lichtprognose...",
    "Stelle deine individuelle Packliste zusammen...",
    "Formuliere exklusive Profi-Tipps...",
    "Finalisiere deinen Shooting-Plan..."
];
