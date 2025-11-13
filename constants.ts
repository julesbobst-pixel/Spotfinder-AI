
import React from 'react';
import { LandscapeIcon, ArchitectureIcon, PortraitIcon, StreetIcon, LongExposureIcon, MacroIcon, LostPlaceIcon, WildlifeIcon, AstroIcon } from './components/icons/MotivIcons';

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
  { id: 'natur', label: 'Natur', icon: LandscapeIcon },
  { id: 'wasser', label: 'Wasser', icon: LongExposureIcon },
  { id: 'muster', label: 'Muster & Texturen', icon: MacroIcon },
  { id: 'drohne', label: 'Drohne', icon: ArchitectureIcon },
];

export const DYNAMIC_STYLES: { [key: string]: string[] } = {
  landschaft: ['Malerisch', 'Dramatisch', 'Minimalistisch', 'Natürlich', 'Mystisch', 'Weitläufig', 'Für Drohnenflüge geeignet'],
  architektur: ['Modern', 'Urban', 'Industriell', 'Minimalistisch', 'Futuristisch', 'Vintage', 'Symmetrisch', 'Brutalismus', 'Vogelperspektive'],
  portrait: ['Romantisch', 'Natürlich', 'Urban', 'Dramatisch', 'Vintage', 'Lifestyle', 'Fashion', 'Sinnlich'],
  street: ['Urban', 'Kontrastreich', 'Vintage', 'Nachtfotografie', 'Minimalistisch', 'Dokumentarisch', 'Abstrakt'],
  astro: ['Mystisch', 'Dramatisch', 'Ruhig / Abgelegen', 'Weitläufig', 'Futuristisch', 'Minimalistisch'],
  tiere: ['Natürlich', 'Actionreich', 'Geduldig', 'Nahaufnahme', 'Wildnis', 'Ländlich'],
  langzeitbelichtung: ['Dynamisch', 'Mystisch', 'Urban', 'Minimalistisch', 'Abstrakt', 'Fließend'],
  makro: ['Detailreich', 'Abstrakt', 'Natürlich', 'Minimalistisch', 'Texturiert', 'Geometrisch', 'Organisch'],
  'lost-place': ['Mystisch', 'Industriell', 'Vintage', 'Verfallen', 'Dramatisch', 'Unheimlich'],
  natur: ['Unberührt', 'Wild', 'Ruhig', 'Idyllisch', 'Episch', 'Minimalistisch', 'Malerisch', 'Natürlich'],
  wasser: ['Spiegelungen', 'Fließend', 'Klar', 'Küstennah', 'Maritim', 'Mystisch', 'Ruhig'],
  muster: ['Abstrakt', 'Geometrisch', 'Organisch', 'Rau', 'Detailreich', 'Grafisch', 'Minimalistisch'],
  drohne: ['Vogelperspektive', 'Weitläufig', 'Symmetrisch', 'Grafisch', 'Episch', 'Industriell', 'Urban', 'Landschaftlich'],
  default: [
    'Modern', 'Minimalistisch', 'Urban', 'Industriell',
    'Natürlich', 'Ländlich', 'Romantisch', 'Mystisch',
    'Futuristisch', 'Vintage', 'Malerisch', 'Dramatisch',
    'Für Drohnenflüge geeignet', 'Vogelperspektive'
  ]
};

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

export const PLANNER_LOADING_MESSAGES = [
    "Verstehe deine kreative Vision...",
    "Analysiere Wetter- & Lichtdaten für deinen Zeitraum...",
    "Scanne die Region nach dem perfekten Spot...",
    "Identifiziere den optimalen Moment...",
    "Erstelle ein detailliertes Kreativ-Briefing...",
    "Stelle deine individuelle Packliste zusammen...",
    "Formuliere exklusive Profi-Tipps...",
    "Finalisiere deinen Shooting-Plan..."
];