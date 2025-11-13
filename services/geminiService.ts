import { GoogleGenAI, Type, Modality } from '@google/genai';
import { SearchCriteria, Coordinates, PhotoSpot, PhotoshootPlan, PlannerCriteria, GeocodedLocation, GeneratedIdea } from '../types';
import { PHOTO_SUBJECTS } from '../constants';

// Initialize the GoogleGenAI client directly.
// The API key is sourced from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleApiError = (error: any, context: string): Error => {
    console.error(`Error in ${context}:`, error);

    let message = `Ein unerwarteter Fehler ist bei "${context}" aufgetreten. Bitte versuche es erneut.`;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorDetails = error.toString().toLowerCase();
    const isImageContext = context.toLowerCase().includes('bildgenerierung');

    if (errorMessage.includes('api key not valid') || errorMessage.includes('api_key_invalid')) {
        message = 'Dein API-Schlüssel ist ungültig. Bitte überprüfe deinen API-Schlüssel.';
    } else if (isImageContext && (errorDetails.includes("billing required") || errorDetails.includes("enable billing"))) {
        message = 'Die Bildgenerierung erfordert ein Google Cloud Projekt mit aktivierter Abrechnung. Dies ist eine Anforderung von Google, selbst wenn die Nutzung im kostenlosen Rahmen bleibt. Stelle sicher, dass die "Vertex AI API" aktiviert und mit einem Rechnungskonto verknüpft ist.';
    } else if (errorMessage.includes('permission denied') || errorDetails.includes('permission_denied')) {
        message = 'Zugriff verweigert. Stelle sicher, dass dein API-Schlüssel die "Vertex AI API" (für Bilder) und die "Generative Language API" (für Text) in deinem Google Cloud Projekt nutzen darf.';
    } else if (errorMessage.includes('quota')) {
        message = 'Du hast dein Nutzungslimit (Quota) für die API erreicht. Bitte versuche es später erneut oder überprüfe dein Google Cloud-Konto.';
    } else if (errorDetails.includes("failed to fetch")) {
        message = 'Netzwerkfehler. Bitte überprüfe deine Internetverbindung und versuche es erneut.'
    } else if (errorDetails.includes("json")) {
        message = 'Die Antwort der KI war in einem unerwarteten Format. Versuche die Anfrage leicht zu ändern.'
    }
    
    return new Error(message);
};


const weatherSchema = {
  type: Type.OBJECT,
  properties: {
    condition: { type: Type.STRING, description: "Die Wetterbedingung (z.B. Sonnig, Leicht bewölkt, Regen)." },
    temperature: { type: Type.NUMBER, description: "Die Temperatur in Grad Celsius." },
    precipitationChance: { type: Type.NUMBER, description: "Die Regenwahrscheinlichkeit in Prozent." },
    windSpeed: { type: Type.NUMBER, description: "Die Windgeschwindigkeit in km/h." },
    notes: { type: Type.STRING, description: "Eine kurze Anmerkung, wie das Wetter die Fotografie an diesem Ort beeinflusst (z.B. 'Nebel sorgt für mystische Stimmung')." }
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
              lat: { type: Type.NUMBER, description: "Der Breitgrad." },
              lon: { type: Type.NUMBER, description: "Der Längengrad." },
            },
            required: ['lat', 'lon']
          },
          matchingCriteria: {
            type: Type.ARRAY,
            description: "Eine Liste von 3-5 Stichwörtern, die beschreiben, warum dieser Spot zu den Suchkriterien passt.",
            items: { type: Type.STRING }
          },
          weather: weatherSchema,
          keyAspects: { 
            type: Type.ARRAY, 
            description: "Eine Liste von 3 stichpunktartigen, fotografischen Highlights oder Besonderheiten des Ortes.",
            items: { type: Type.STRING } 
          },
          bestTimeToVisit: { type: Type.STRING, description: "Die beste Tages- oder Jahreszeit für einen Besuch, mit kurzer Begründung." },
          photoTips: {
            type: Type.ARRAY,
            description: "Eine Liste von 2-3 spezifischen, umsetzbaren Fotografie-Tipps für diesen Ort (Komposition, Technik usw.). Die Tipps sollen konkret sein ('Was soll ich fotografieren?'), nicht nur wo.",
            items: { type: Type.STRING }
          },
          proTip: { type: Type.STRING, description: "Ein einzigartiger, sehr spezifischer 'Profi-Tipp' oder ein Geheimnis über diesen Ort, das die meisten Leute nicht kennen würden." },
        },
        required: ['id', 'name', 'address', 'description', 'coordinates', 'matchingCriteria', 'weather', 'keyAspects', 'bestTimeToVisit', 'photoTips', 'proTip']
      }
    }
  },
  required: ['spots']
};

export const findPhotoSpots = async (criteria: SearchCriteria, location: Coordinates): Promise<PhotoSpot[]> => {
    const prompt = `
      Finde 5-7 Foto-Spots in einem Umkreis von ${criteria.radius} km um den Standort (${location.lat}, ${location.lon}).
      Die Spots sollten zu folgenden Kriterien passen:
      - Medientyp: ${criteria.mediaType}
      - Motive: ${criteria.motivs.join(', ')}
      - Stile/Stimmungen: ${criteria.styles.join(', ')}
      - Tageszeit: ${criteria.timeOfDay}

      Gib für jeden Spot einen Namen, eine kurze Beschreibung (30-50 Wörter), die genaue Adresse, die exakten GPS-Koordinaten, passende Stichwörter, eine plausible Wettervorhersage, 3 fotografische Highlights ('keyAspects'), die beste Besuchszeit ('bestTimeToVisit'), 2-3 konkrete Fototipps ('photoTips') und einen einzigartigen Profi-Tipp ('proTip') an.
      Die Wettervorhersage muss für die angegebene Tageszeit (${criteria.timeOfDay}) gelten und sollte eine Anmerkung ('notes') enthalten, wie das Wetter die Fotografie an diesem Ort beeinflusst.
      Die Beschreibung sollte kreativ und inspirierend für Fotografen/Videografen sein.
      Die Fototipps und der Profi-Tipp müssen besonders detailliert, nützlich und umsetzbar sein. Sie sollen die Frage "Was soll ich fotografieren?" beantworten, nicht nur "Wo?".
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
        throw handleApiError(error, "der Suche nach Foto-Spots");
    }
};

const photoshootPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Ein kreativer, packender Titel für den Shooting-Plan." },
    dateTime: { type: Type.STRING, description: "Der von dir gewählte, optimale Zeitpunkt für das Shooting im ISO 8601 Format (YYYY-MM-DDTHH:MM:SS)." },
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
        description: "3-5 konkrete, kreative Profi-Tipps für das Shooting. Diese sollen sehr spezifische Anleitungen sein, z.B. zu Kameraeinstellungen, Komposition oder unkonventionellen Perspektiven.",
        items: { type: Type.STRING }
    },
    creativeVision: {
        type: Type.STRING,
        description: "Ein kurzer, inspirierender Text (2-3 Sätze), der die kreative Vision und Stimmung des Shootings zusammenfasst. Er sollte auch begründen, warum der gewählte Zeitpunkt optimal ist."
    },
    shotList: {
        type: Type.ARRAY,
        description: "Eine Liste von 3-4 konkreten, umsetzbaren Foto-Ideen ('Was soll ich fotografieren?'). Jeder Punkt sollte eine spezifische Szene, ein Detail oder eine Komposition beschreiben.",
        items: { type: Type.STRING }
    },
    moodImagePrompts: {
        type: Type.ARRAY,
        description: "Eine Liste von genau ZWEI detaillierten, englischen Prompts für ein KI-Bildgenerierungsmodell. Jeder Prompt sollte eine andere Facette der Shooting-Idee visualisieren.",
        items: { type: Type.STRING }
    }
  },
  required: ['title', 'dateTime', 'spot', 'travelPlan', 'weatherForecast', 'lightingAnalysis', 'equipmentList', 'notesAndTips', 'creativeVision', 'shotList', 'moodImagePrompts']
};

export const generatePhotoshootPlan = async (criteria: PlannerCriteria): Promise<PhotoshootPlan> => {
    const prompt = `
    Du bist ein Experte für Fotografie-Planung und ein Creative Director. Deine Aufgabe ist es, einen hyper-detaillierten und umsetzbaren Shooting-Plan zu erstellen, der auf den anspruchsvollen Wünschen eines Fotografen basiert. Finde nicht nur irgendeinen Ort, sondern finde den **perfekten Moment** an dem **perfekten Ort**.

    **Nutzer-Kriterien:**
    - **Kreatives Konzept:**
        - **Motive:** ${criteria.motivs.join(', ')}
        - **Stile/Stimmungen:** ${criteria.styles.join(', ')}
        - **Wichtige Elemente:** ${criteria.keyElements || 'Keine spezifischen'}
    - **Zeitliche & Umgebungs-Anforderungen:**
        - **Verfügbarer Zeitraum:** Von ${criteria.dateRange.start} bis ${criteria.dateRange.end}
        - **Bevorzugtes Wetter:** ${criteria.desiredWeather?.join(', ') || 'Flexibel'}
        - **Bevorzugtes Licht:** ${criteria.desiredLight?.join(', ') || 'Flexibel'}
    - **Logistische Anforderungen:**
        - **Standort des Nutzers:** ${criteria.userLocation.lat}, ${criteria.userLocation.lon}
        - **Maximaler Umkreis:** ${criteria.radius} km

    **Deine Denk- und Arbeitsschritte (strikt befolgen!):**

    1.  **Saisonale Analyse:** Analysiere den angegebenen Zeitraum (von ${criteria.dateRange.start} bis ${criteria.dateRange.end}). Bestimme die exakte Jahreszeit und die typischen Gegebenheiten dieser Zeit in der Region (z.B. "Spätherbst, kahle Bäume, tief stehende Sonne, hohe Wahrscheinlichkeit für Nebel am Morgen"). **Alle deine Vorschläge MÜSSEN zu dieser Jahreszeit passen.** Schlage keine blühenden Kirschbäume im November vor.

    2.  **Kandidaten-Suche:** Finde basierend auf allen Kriterien (Motive, Stile, Jahreszeit, Umkreis) mental 2-3 potenzielle Orte.

    3.  **Moment-Optimierung (WICHTIGSTER SCHRITT):** Für jeden Kandidaten-Ort, simuliere die Wetter- und Lichtbedingungen innerhalb des verfügbaren Zeitraums. Vergleiche diese Simulation mit den gewünschten Wetter- und Lichtbedingungen des Nutzers. **Wähle den EINEN Spot und den EINEN genauen Zeitpunkt (Datum und Uhrzeit), der die höchste Übereinstimmung zwischen der Realität (Saison, Ort) und der Vision (Wetter, Licht, Stil) des Nutzers bietet.**

    4.  **Plan-Erstellung:** Erstelle den finalen Plan basierend auf deiner Wahl aus Schritt 3.
        - **Begründe deine Wahl:** Erkläre im "Creative Vision"-Feld kurz, warum genau dieser Ort zu genau diesem Zeitpunkt perfekt ist.
        - **Sei hyper-spezifisch:** Deine Tipps und Shot-Listen müssen extrem konkret sein. Nicht "Fotografiere den See", sondern "Positioniere dich am Nordufer eine halbe Stunde vor Sonnenaufgang. Nutze einen Polfilter, um die Spiegelung der nebelverhangenen Berge im Wasser einzufangen. Belichtungszeit ca. 15 Sekunden bei f/11."
        - **Fülle ALLE Felder des JSON-Schemas** mit kreativen, nützlichen und auf deiner Analyse basierenden Informationen. Der \`dateTime\` Wert muss der von dir in Schritt 3 ermittelte optimale Zeitpunkt sein.

    Gib das Ergebnis ausschließlich im geforderten JSON-Format zurück.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: photoshootPlanSchema,
                temperature: 0.8,
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);

        if (result) {
            return result as PhotoshootPlan;
        }
        
        throw new Error("Konnte keinen validen Plan von der KI erhalten.");

    } catch (error) {
        throw handleApiError(error, "der Erstellung des Shooting-Plans");
    }
};

const geocodeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Der verifizierte Name des Ortes (z.B. 'Berlin, Deutschland')." },
        lat: { type: Type.NUMBER, description: "Der Breitgrad." },
        lon: { type: Type.NUMBER, description: "Der Längengrad." },
    },
    required: ['name', 'lat', 'lon']
};

export const geocodeLocation = async (address: string): Promise<GeocodedLocation> => {
    const prompt = `Geocodiere die folgende Adresse und gib den verifizierten Namen und die genauen GPS-Koordinaten (lat, lon) zurück: "${address}"`;
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
        return JSON.parse(jsonStr) as GeocodedLocation;
    } catch (error) {
        throw handleApiError(error, "der Adress-Suche (Geocoding)");
    }
};

export const reverseGeocode = async (coords: Coordinates): Promise<string> => {
    const prompt = `Finde den nächstgelegenen Ort oder die Stadt für die GPS-Koordinaten: Breitengrad ${coords.lat}, Längengrad ${coords.lon}. Gib nur den Namen zurück (z.B. "München, Bayern").`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, "der Standortermittlung (Reverse Geocoding)");
    }
};

const _generateSingleImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("Keine Bilddaten in der Antwort gefunden.");
};

export const generateSpotImage = async (spotName: string, description: string): Promise<string> => {
    const prompt = `Generate a highly realistic, photorealistic image that looks like a high-quality photograph taken by a professional photographer of the location known as "${spotName}". The scene must accurately reflect the description: "${description}". Avoid any artistic, drawn, or stylized elements. The goal is to show what the place actually looks like in a beautiful, well-composed shot.`;
    
    try {
        return await _generateSingleImage(prompt);
    } catch (error) {
        throw handleApiError(error, "der Bildgenerierung");
    }
};

export const generateMoodImages = async (prompts: string[]): Promise<(string | null)[]> => {
    const imagePromises = prompts.map(async (prompt) => {
        try {
            return await _generateSingleImage(prompt);
        } catch (error) {
            console.error(`Failed to generate mood image for prompt: "${prompt}"`, error);
            // Re-throw the handled error to be caught by allSettled
            throw handleApiError(error, `der Bildgenerierung für das Moodboard`);
        }
    });

    const results = await Promise.allSettled(imagePromises);
    
    // Process results to return image data or null for failures
    return results.map(res => {
        if (res.status === 'fulfilled') {
            return res.value;
        }
        // Optionally, you could return the error message here instead of null
        // if you want to display it in the UI.
        console.error("A mood image generation failed:", res.reason);
        return null; 
    });
};

export const getFollowUpAnswer = async (plan: PhotoshootPlan, question: string): Promise<string> => {
    const context = JSON.stringify(plan);
    const prompt = `
      Du bist ein virtueller Foto-Assistent. Ein Nutzer hat bereits einen detaillierten Shooting-Plan erhalten.
      **Hier ist der Kontext des Plans:**
      ${context}

      **Der Nutzer hat nun folgende Folgefrage:**
      "${question}"

      Beantworte die Frage kurz, präzise und hilfreich im Kontext des Plans. Gib nur die Antwort aus, ohne einleitende Sätze wie "Als virtueller Assistent...".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        throw handleApiError(error, "der Beantwortung deiner Frage");
    }
};

const creativeIdeaSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            description: "Eine Liste von 3 kreativen Foto-Ideen.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Ein kurzer, packender Titel für die Idee." },
                    description: { type: Type.STRING, description: "Eine kurze, inspirierende Beschreibung (1-2 Sätze)." },
                    styles: {
                        type: Type.ARRAY,
                        description: "Eine Liste von 2-3 passenden Stilen oder Stimmungen.",
                        items: { type: Type.STRING }
                    },
                    keyElements: { type: Type.STRING, description: "Ein kurzes Beispiel für wichtige Elemente im Bild." }
                },
                required: ['title', 'description', 'styles', 'keyElements']
            }
        }
    },
    required: ['ideas']
};


export const generateCreativeIdeas = async (motivs: string[]): Promise<GeneratedIdea[]> => {
    const prompt = `
      Erstelle 3 verschiedene, kreative und spezifische Fotoshooting-Ideen basierend auf den folgenden Motiven: ${motivs.join(', ')}.
      Die Ideen sollten einzigartiger sein als einfache Konzepte wie "Landschaft bei Sonnenuntergang".
      Gib für jede Idee einen einprägsamen Titel, eine kurze Beschreibung, 2-3 passende Stile/Stimmungen und ein Beispiel für Schlüsselelemente an.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: creativeIdeaSchema,
            },
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);

        if (result && result.ideas) {
            return result.ideas as GeneratedIdea[];
        }
        return [];
    } catch (error) {
        throw handleApiError(error, "der Generierung neuer Ideen");
    }
};