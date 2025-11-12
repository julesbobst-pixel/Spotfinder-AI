import { GoogleGenAI, Type, Modality } from '@google/genai';
import { SearchCriteria, Coordinates, PhotoSpot, WeatherData, PhotoshootPlan, PlannerCriteria, TimeSlotSuggestion, GeocodedLocation, DetailedSpotInfo, ImageAnalysis } from '../types';
import { PHOTO_SUBJECTS } from '../constants';

// Singleton instance, will be initialized by the App
let ai: GoogleGenAI;

export function initializeGenAI(apiKey: string) {
    if (!apiKey) {
        console.error("API Key is missing for GenAI initialization.");
        return;
    }
    ai = new GoogleGenAI({ apiKey });
}

const weatherSchema = {
  type: Type.OBJECT,
  properties: {
    condition: { type: Type.STRING, description: "Die Wetterbedingung (z.B. Sonnig, Leicht bewölkt, Regen)." },
    temperature: { type: Type.NUMBER, description: "Die Temperatur in Grad Celsius." },
    precipitationChance: { type: Type.NUMBER, description: "Die Regenwahrscheinlichkeit in Prozent." },
    windSpeed: { type: Type.NUMBER, description: "Die Windgeschwindigkeit in km/h." },
  },
  required: ['condition', 'temperature', 'precipitationChance', 'windSpeed']
};

const photoSpotSchema = {
  type: Type.OBJECT,
  properties: {
    spots: {
      type: Type.ARRAY,
      description: "Eine Liste von Foto-Spots.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Eine eindeutige ID für den Spot, z.B. 'brandenburger-tor-berlin'." },
          name: { type: Type.STRING, description: "Der Name des Foto-Spots." },
          address: { type: Type.STRING, description: "Die vollständige, genaue Adresse des Spots (Straße, Hausnummer, PLZ, Stadt)." },
          description: { type: Type.STRING, description: "Eine kurze, ansprechende Beschreibung des Spots (ca. 30-50 Wörter)." },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER, description: "Der Breitengrad." },
              lon: { type: Type.NUMBER, description: "Der Längengrad." },
            },
            required: ['lat', 'lon']
          },
          matchingCriteria: {
            type: Type.ARRAY,
            description: "Eine Liste von 3-5 Stichwörtern, die beschreiben, warum dieser Spot zu den Suchkriterien passt.",
            items: { type: Type.STRING }
          },
          weather: weatherSchema
        },
        required: ['id', 'name', 'address', 'description', 'coordinates', 'matchingCriteria', 'weather']
      }
    }
  },
  required: ['spots']
};

export const findPhotoSpots = async (criteria: SearchCriteria, location: Coordinates): Promise<PhotoSpot[]> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `
      Finde 5-7 Foto-Spots in einem Umkreis von ${criteria.radius} km um den Standort (${location.lat}, ${location.lon}).
      Die Spots sollten zu folgenden Kriterien passen:
      - Medientyp: ${criteria.mediaType}
      - Motive: ${criteria.motivs.join(', ')}
      - Stile/Stimmungen: ${criteria.styles.join(', ')}
      - Tageszeit: ${criteria.timeOfDay}

      Gib für jeden Spot einen Namen, eine kurze Beschreibung (30-50 Wörter), die genaue und vollständige Adresse, die exakten GPS-Koordinaten (lat, lon), eine Liste mit 3-5 passenden Stichwörtern UND eine plausible Wettervorhersage für die angegebene Tageszeit an.
      Die Beschreibung sollte kreativ und inspirierend für Fotografen/Videografen sein.
      Stelle sicher, dass die Spots thematisch zu den angegebenen Motiven und stilen passen.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: photoSpotSchema,
                temperature: 0.7,
            },
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        
        if (result && result.spots) {
            return result.spots as PhotoSpot[];
        }
        return [];

    } catch (error) {
        console.error("Error finding photo spots:", error);
        throw new Error("Fehler bei der Suche nach Foto-Spots. Bitte versuche es erneut.");
    }
};

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const getTextToSpeechAudio = async (text: string): Promise<AudioBuffer | null> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    if (!text) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Lies den folgenden Text auf Deutsch mit einer freundlichen, ruhigen Stimme vor: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Puck' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
            return audioBuffer;
        }
        return null;
    } catch (error) {
        console.error("Error generating text-to-speech audio:", error);
        return null;
    }
};

export const playAudio = (audioBuffer: AudioBuffer) => {
    if (!audioContext || !audioBuffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
};

const timeSlotSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "Eine Liste von 3-4 optimalen Zeitfenstern.",
            items: {
                type: Type.OBJECT,
                properties: {
                    dateTime: { type: Type.STRING, description: "Das genaue Datum und die Uhrzeit im ISO 8601 Format (YYYY-MM-DDTHH:MM:SS)." },
                    reason: { type: Type.STRING, description: "Eine kurze Begründung, warum dieser Zeitpunkt ideal ist (z.B. 'Klare Nacht, ideal für Sterne', 'Prognose für dramatische Wolken zum Sonnenuntergang')." }
                },
                required: ['dateTime', 'reason']
            }
        }
    },
    required: ['suggestions']
};

export const getTimeSlotSuggestions = async (criteria: Omit<PlannerCriteria, 'userLocation' | 'radius'> & {userLocation: Coordinates, radius: number} ): Promise<TimeSlotSuggestion[]> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Basierend auf den folgenden Kriterien für ein Fotoshooting, schlage 3-4 plausible, optimale Zeitfenster in den nächsten 7 Tagen vor.
    Heute ist der ${today}. Deine Vorschläge sollten auf typischen, saisonalen Wetter- und Lichtverhältnissen für die angegebene Region basieren.

    **Shooting-Kriterien:**
    - **Hauptmotiv:** ${criteria.subject}
    - **Stimmung/Stile:** ${criteria.styles.join(', ')}
    - **Gewünschtes Wetter:** ${criteria.desiredWeather.join(', ')}
    - **Gewünschtes Licht:** ${criteria.desiredLight.join(', ')}
    - **Region:** Umkreis von ${criteria.radius}km um die Koordinaten ${criteria.userLocation.lat}, ${criteria.userLocation.lon}.

    Gib für jeden Vorschlag das genaue Datum und die Uhrzeit im ISO-Format und eine kurze, prägnante Begründung an.
    Die Begründung muss sich direkt auf die gewünschten Wetter- und Lichtbedingungen beziehen.
    Beispiel: "Grund: Für diesen Zeitraum ist die Wahrscheinlichkeit für klaren Himmel am höchsten, perfekt für die gewünschte Sternenfotografie."
    `;

    let jsonStr = '';
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: timeSlotSuggestionSchema,
            },
        });
        jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result.suggestions || [];
    } catch (error) {
        console.error("Error getting time slot suggestions:", error);
        if (jsonStr) {
            console.error("Raw Gemini response that failed to parse:", jsonStr);
        }
        throw new Error("Fehler bei der Suche nach Terminvorschlägen.");
    }
};


const photoshootPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Ein kreativer, packender Titel für den Shooting-Plan." },
    spot: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Name des vorgeschlagenen Foto-Spots." },
            description: { type: Type.STRING, description: "Kurze Beschreibung, warum dieser Spot perfekt zur Idee passt." },
            coordinates: {
                type: Type.OBJECT,
                properties: {
                    lat: { type: Type.NUMBER },
                    lon: { type: Type.NUMBER }
                },
                required: ["lat", "lon"]
            }
        },
        required: ["name", "description", "coordinates"]
    },
    travelPlan: {
        type: Type.OBJECT,
        properties: {
            departureTime: { type: Type.STRING, description: "Empfohlene Abfahrtszeit (z.B. '16:45 Uhr')." },
            notes: { type: Type.STRING, description: "Hinweise zur Anreise, Parken oder dem Weg zum Spot." }
        },
        required: ["departureTime", "notes"]
    },
    weatherForecast: {
        type: Type.OBJECT,
        properties: {
            condition: { type: Type.STRING },
            temperature: { type: Type.NUMBER },
            precipitationChance: { type: Type.NUMBER },
            windSpeed: { type: Type.NUMBER },
            notes: { type: Type.STRING, description: "Besondere Hinweise, wie das Wetter die Fotografie beeinflusst." }
        },
        required: ["condition", "temperature", "precipitationChance", "windSpeed", "notes"]
    },
    lightingAnalysis: {
        type: Type.OBJECT,
        properties: {
            condition: { type: Type.STRING, description: "Beschreibung der zu erwartenden Lichtverhältnisse (z.B. 'Weiches Abendlicht der Goldenen Stunde')." },
            lightPollution: { type: Type.STRING, description: "Einschätzung der Lichtverschmutzung für Nachtaufnahmen (z.B. 'Gering', 'Moderat', 'Hoch'). Nur relevant bei Nacht." }
        },
        required: ["condition", "lightPollution"]
    },
    equipmentList: {
        type: Type.ARRAY,
        description: "Eine Liste empfohlener Ausrüstung (Kamera, Objektive, Stativ, Filter, etc.).",
        items: { type: Type.STRING }
    },
    notesAndTips: {
        type: Type.ARRAY,
        description: "3-5 konkrete, kreative Profi-Tipps für das Shooting, die auf Ort, Zeit und Idee zugeschnitten sind.",
        items: { type: Type.STRING }
    },
    creativeVision: {
        type: Type.STRING,
        description: "Ein kurzer, inspirierender Text (2-3 Sätze), der die kreative Vision und Stimmung des Shootings zusammenfasst."
    },
    shotList: {
        type: Type.ARRAY,
        description: "Eine Liste von 3-4 konkreten, umsetzbaren Foto-Ideen oder 'Shots' für den Ort.",
        items: { type: Type.STRING }
    },
    moodImagePrompts: {
        type: Type.ARRAY,
        description: "Eine Liste von genau ZWEI detaillierten, englischen Prompts für ein KI-Bildgenerierungsmodell. Jeder Prompt sollte eine andere Facette der Shooting-Idee visualisieren.",
        items: { type: Type.STRING }
    }
  },
  required: ['title', 'spot', 'travelPlan', 'weatherForecast', 'lightingAnalysis', 'equipmentList', 'notesAndTips', 'creativeVision', 'shotList', 'moodImagePrompts']
};

export const generatePhotoshootPlan = async (criteria: PlannerCriteria, dateTime: string): Promise<PhotoshootPlan> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `
    Du bist ein Experte für Fotografie-Planung und ein Creative Director. Deine Aufgabe ist es, basierend auf den Wünschen eines Nutzers den perfekten Foto-Spot zu finden und einen umfassenden, kreativen Shooting-Plan zu erstellen.

    **Nutzer-Kriterien:**
    - **Standort des Nutzers:** ${criteria.userLocation.lat}, ${criteria.userLocation.lon}
    - **Maximaler Umkreis:** ${criteria.radius} km
    - **Geplanter Zeitpunkt:** ${dateTime}
    - **Shooting-Idee:**
        - Hauptmotiv: ${criteria.subject}
        - Stile: ${criteria.styles.join(', ')}
        - Schlüsselelemente: "${criteria.keyElements}"
        - Gewünschtes Wetter: ${criteria.desiredWeather.join(', ')}
        - Gewünschtes Licht: ${criteria.desiredLight.join(', ')}

    **Deine Aufgaben:**
    1.  **Spot finden:** Finde basierend auf der Idee und den Standortdaten den EINEN am besten geeigneten Foto-Spot im angegebenen Umkreis.
    2.  **Plan erstellen:** Erstelle einen detaillierten Plan für diesen Spot zum angegebenen Zeitpunkt.
    3.  **Kreativkonzept entwickeln:** Füge dem Plan einen kreativen Teil hinzu.

    **Der Plan muss Folgendes beinhalten:**
    - **Organisatorischer Teil:**
        - **Titel:** Ein kreativer Titel für den Plan.
        - **Spot:** Name, Beschreibung (warum er passt) und Koordinaten des gefundenen Spots.
        - **Reiseplan:** Berechne eine realistische Fahrzeit und gib eine empfohlene Abfahrtszeit an. Füge Hinweise zu Parken oder Anreise hinzu.
        - **Wettervorhersage:** Eine detaillierte Vorhersage. Gib auch an, wie das Wetter das Shooting beeinflusst.
        - **Lichtanalyse:** Beschreibe die Lichtverhältnisse. Falls es Nacht ist, beurteile die Lichtverschmutzung.
        - **Ausrüstungsliste:** Empfiehl eine passende Ausrüstung.
        - **Tipps & Hinweise:** Gib 3-5 konkrete, umsetzbare Profi-Tipps.
    - **Kreativer Teil:**
        - **creativeVision:** Fasse die kreative Vision in 2-3 inspirierenden Sätzen zusammen.
        - **shotList:** Erstelle eine Liste mit 3-4 konkreten Foto-Ideen (z.B. "Weitwinkelaufnahme von unten, um die Brücke monumental wirken zu lassen").
        - **moodImagePrompts:** Erstelle genau ZWEI verschiedene, sehr detaillierte, englische Prompts für ein KI-Bildmodell (wie DALL-E oder Midjourney), die die Stimmung visualisieren. Zum Beispiel: "cinematic photo, a lone figure standing on a misty bridge at dawn, golden hour light breaking through the fog, moody atmosphere, highly detailed, 35mm lens --ar 16:9".

    Sei kreativ, präzise und hilfreich.
    `;

    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: photoshootPlanSchema,
                temperature: 0.8,
            },
        });
        
        const jsonStr = response.text.trim();
        const plan = JSON.parse(jsonStr);
        return plan as PhotoshootPlan;
    } catch (error) {
        console.error("Error generating photoshoot plan:", error);
        throw new Error("Fehler bei der Erstellung des Shooting-Plans.");
    }
}

const geocodeSchema = {
  type: Type.OBJECT,
  properties: {
    lat: { type: Type.NUMBER, description: "Der Breitengrad." },
    lon: { type: Type.NUMBER, description: "Der Längengrad." },
    name: { type: Type.STRING, description: "Der von der API verifizierte Name des Ortes, z.B. 'Berlin, Deutschland'."}
  },
  required: ['lat', 'lon', 'name']
};

export const geocodeLocation = async (locationString: string): Promise<GeocodedLocation> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `Wandle den folgenden Ort in geografische Koordinaten um: "${locationString}". Gib auch den verifizierten Namen des Ortes an. Antworte nur mit einem JSON-Objekt, das 'lat', 'lon' und 'name' enthält.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: geocodeSchema,
            },
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        if (result && typeof result.lat === 'number' && typeof result.lon === 'number' && typeof result.name === 'string') {
            return result as GeocodedLocation;
        }
        throw new Error("Ungültige Antwort vom Geocoding-Service erhalten.");
    } catch (error) {
        console.error("Error geocoding location:", error);
        throw new Error("Der Ort konnte nicht gefunden werden. Bitte versuche es genauer.");
    }
};

const reverseGeocodeSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Der Name des Ortes (Stadt, Land) basierend auf den Koordinaten."}
    },
    required: ['name']
};
  
export const reverseGeocode = async (coords: Coordinates): Promise<string> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `Gib den Namen des Ortes (z.B. 'Berlin, Deutschland') für die folgenden geografischen Koordinaten zurück: Breitengrad ${coords.lat}, Längengrad ${coords.lon}. Antworte nur mit einem JSON-Objekt, das 'name' enthält.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: reverseGeocodeSchema,
            },
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        if (result && typeof result.name === 'string') {
            return result.name;
        }
        throw new Error("Ungültiger Ortsname vom Service erhalten.");
    } catch (error) {
        console.error("Error reverse geocoding location:", error);
        // Fallback, return coordinates if name resolution fails
        return `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;
    }
}

const ideaStarterSchema = {
  type: Type.OBJECT,
  properties: {
    starters: {
      type: Type.ARRAY,
      description: "Eine Liste von 4 kreativen und vielfältigen Ideen für ein Fotoshooting.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Ein kurzer, packender Titel für die Idee." },
          description: { type: Type.STRING, description: "Eine inspirierende Beschreibung der Idee in 1-2 Sätzen." },
          subject: { type: Type.STRING, description: `Eines der folgenden Hauptmotive: ${PHOTO_SUBJECTS.join(', ')}` },
          styles: { type: Type.ARRAY, description: "Eine Liste von 2-3 passenden Stilen/Stimmungen.", items: { type: Type.STRING } },
          keyElements: { type: Type.STRING, description: "Ein kurzes Beispiel für Schlüsselelemente." }
        },
        required: ['title', 'description', 'subject', 'styles', 'keyElements']
      }
    }
  },
  required: ['starters']
};

export const getNewIdeaStarters = async (): Promise<any[]> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `
      Erstelle 4 neue, kreative, abwechslungsreiche und inspirierende "Idea Starters" für einen Fotografie-Planer.
      Die Ideen sollten verschiedene Motive und Stimmungen abdecken.
      Vermeide generische Ideen. Sei spezifisch und ausgefallen.
      Gib für jede Idee einen Titel, eine kurze Beschreibung, ein Hauptmotiv (aus der Liste: ${PHOTO_SUBJECTS.join(', ')}), 2-3 passende Stile und beispielhafte Schlüsselelemente an.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: ideaStarterSchema,
                temperature: 0.9,
            },
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result.starters || [];
    } catch (error) {
        console.error("Error getting new idea starters:", error);
        throw new Error("Fehler beim Generieren neuer Ideen.");
    }
};

export const getFollowUpAnswer = async (plan: PhotoshootPlan, question: string): Promise<string> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `
    Du bist ein virtueller Foto-Assistent und Experte für Fotografie-Planung.
    Basierend auf dem folgenden, bereits erstellten Shooting-Plan, beantworte die spezifische Frage des Nutzers.
    Sei dabei besonders hilfreich und gehe auch auf technische Details ein, wenn danach gefragt wird (z.B. Objektive, Kameraeinstellungen, Bildkomposition).
    Antworte kurz, präzise und direkt auf die Frage.

    **Bestehender Shooting-Plan:**
    ${JSON.stringify(plan, null, 2)}

    **Frage des Nutzers:**
    "${question}"

    Deine Expertenantwort:
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                temperature: 0.5,
            },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting follow-up answer:", error);
        throw new Error("Fehler bei der Beantwortung der Frage. Bitte versuche es erneut.");
    }
};

const spotDetailSchema = {
    type: Type.OBJECT,
    properties: {
        address: { type: Type.STRING, description: "Die vollständige, genaue Adresse des Ortes." },
        summary: { type: Type.STRING, description: "Eine kurze Zusammenfassung (ca. 50-70 Wörter), was diesen Ort fotografisch besonders macht." },
        keyAspects: { 
            type: Type.ARRAY, 
            description: "Eine Liste von 3-4 stichpunktartigen, fotografischen Highlights oder Tipps (z.B. 'Perfekt für dramatische Sonnenuntergänge', 'Spiegelungen im Wasser nutzen').",
            items: { type: Type.STRING } 
        },
        travelInfo: {
            type: Type.OBJECT,
            properties: {
                parking: { type: Type.STRING, description: "Kurze Info zu Parkmöglichkeiten." },
                publicTransport: { type: Type.STRING, description: "Kurze Info zur Anbindung an öffentliche Verkehrsmittel." }
            },
            required: ["parking", "publicTransport"]
        },
        bestTimeToVisit: { type: Type.STRING, description: "Die beste Tages- oder Jahreszeit für einen Besuch, mit kurzer Begründung." },
        imagePrompt: { type: Type.STRING, description: "Ein detaillierter, englischer Prompt für ein KI-Bildgenerierungsmodell (z.B. DALL-E), der die Essenz und Stimmung dieses Ortes einfängt. Der Prompt sollte den Fotostil, das Motiv, die Lichtstimmung und wichtige Details enthalten." }
    },
    required: ["address", "summary", "keyAspects", "travelInfo", "bestTimeToVisit", "imagePrompt"]
};


export const getSpotDetails = async (spot: PhotoSpot): Promise<DetailedSpotInfo> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `
    Du bist ein Location Scout für Fotografen. Für den folgenden Ort "${spot.name}" (bekannte Adresse: ${spot.address}), erstelle eine strukturierte, leicht verdauliche Zusammenfassung.
    - **address:** Überprüfe und gib die genaue, vollständige Adresse zurück.
    - **summary:** Eine kurze Zusammenfassung (ca. 50-70 Wörter), was diesen Ort fotografisch besonders macht.
    - **keyAspects:** Eine Liste von 3-4 stichpunktartigen, fotografischen Highlights.
    - **travelInfo:** Ein Objekt mit kurzen Infos zu 'parking' und 'publicTransport'.
    - **bestTimeToVisit:** Die beste Zeit für einen Besuch mit kurzer Begründung.
    - **imagePrompt:** Erstelle einen detaillierten, englischen Prompt für ein KI-Bildgenerierungsmodell, der die Essenz des Ortes einfängt (Stil, Motiv, Licht).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: spotDetailSchema,
            },
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result as DetailedSpotInfo;
    } catch (error) {
        console.error("Error getting spot details:", error);
        throw new Error("Details für diesen Spot konnten nicht geladen werden.");
    }
}

export const generateImageForSpot = async (prompt: string): Promise<string | null> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    if (!prompt) return null;
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });
        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData) {
            return part.inlineData.data;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null; 
    }
}

export const generateMoodImages = async (prompts: string[]): Promise<(string | null)[]> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    if (!prompts || prompts.length === 0) return [];
    
    const imagePromises = prompts.map(prompt => generateImageForSpot(prompt));
    
    try {
        const results = await Promise.all(imagePromises);
        return results;
    } catch (error) {
        console.error("Error generating mood images:", error);
        // Return an array of nulls matching the prompt count on failure
        return prompts.map(() => null);
    }
};

const imageAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      photographicElements: {
        type: Type.ARRAY,
        description: "Eine Liste von 3 wichtigen fotografischen Elementen, die im Bild zu sehen sind (z.B. Komposition, Licht, Stimmung).",
        items: { type: Type.STRING }
      },
      colorPalette: {
        type: Type.ARRAY,
        description: "Eine Liste von 5 dominanten Farben aus dem Bild, als Hex-Codes (z.B. '#AABBCC').",
        items: { type: Type.STRING }
      }
    },
    required: ['photographicElements', 'colorPalette']
};

export const analyzeImage = async (imageBase64: string): Promise<ImageAnalysis> => {
    if (!ai) throw new Error("GenAI client not initialized. Please set API Key.");
    const prompt = `Analysiere dieses Bild aus der Perspektive eines Fotografen. Identifiziere die 3 wichtigsten fotografischen Elemente (wie Komposition, Beleuchtung, Stimmung). Extrahiere außerdem die 5 dominantesten Farben als Hex-Farbcode.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: 'image/png'
                        }
                    },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: imageAnalysisSchema
            }
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result as ImageAnalysis;

    } catch (error) {
        console.error("Error analyzing image:", error);
        throw new Error("Bildanalyse fehlgeschlagen.");
    }
};