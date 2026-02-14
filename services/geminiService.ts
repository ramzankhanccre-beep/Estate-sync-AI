
import { GoogleGenAI, Type } from "@google/genai";
import { EntityType, ExtractionResult, Match, PropertyEntity } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: 'Either UNIT or REQUIREMENT' },
          propertyType: { type: Type.STRING, description: 'e.g. Apartment, Villa, Office' },
          community: { type: Type.STRING, description: 'Community or building name' },
          price: { type: Type.NUMBER, description: 'Numeric price or budget' },
          size: { type: Type.STRING, description: 'Bedrooms or square footage' },
          contact: { type: Type.STRING, description: 'Phone number found' },
          rawText: { type: Type.STRING, description: 'Original snippet' },
        },
        required: ['type', 'propertyType', 'community', 'price', 'contact', 'rawText'],
      }
    }
  }
};

const MATCHING_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      unitId: { type: Type.STRING },
      requirementId: { type: Type.STRING },
      score: { type: Type.NUMBER, description: 'Score from 1 to 10' },
      reasoning: { type: Type.STRING, description: 'Explanation for the score' },
    },
    required: ['unitId', 'requirementId', 'score', 'reasoning'],
  }
};

export const extractEntities = async (chatText: string): Promise<ExtractionResult> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Analyze the following WhatsApp chat export. 
      Identify properties being offered (UNITS) and clients looking for properties (REQUIREMENTS).
      Extract structured data. WhatsApp formats vary, handle [DD/MM/YY, HH:MM:SS] and MM/DD/YY formats.
      
      Chat Text:
      ${chatText.slice(0, 30000)} // Basic chunking to fit context
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_SCHEMA,
    }
  });

  const rawData = JSON.parse(response.text || '{"entities":[]}');
  const units: PropertyEntity[] = [];
  const requirements: PropertyEntity[] = [];

  rawData.entities.forEach((entity: any, index: number) => {
    const formatted: PropertyEntity = {
      ...entity,
      id: `${entity.type.toLowerCase()}-${Date.now()}-${index}`,
    };
    if (entity.type === 'UNIT') units.push(formatted);
    else requirements.push(formatted);
  });

  return { units, requirements };
};

export const matchEntities = async (units: PropertyEntity[], requirements: PropertyEntity[]): Promise<Match[]> => {
  if (units.length === 0 || requirements.length === 0) return [];
  
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      You are a Real Estate Matchmaking AI. 
      Compare these available Units against these Client Requirements.
      
      UNITS:
      ${JSON.stringify(units)}
      
      REQUIREMENTS:
      ${JSON.stringify(requirements)}
      
      Rules:
      - Score 10: 100% match (Same community, type, and price within budget).
      - Score 5-9: Mostly matching, but price slightly outside budget.
      - Score 1-4: Same community but unit size or price gap is significant.
      
      Return a JSON array of top matches.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: MATCHING_SCHEMA,
    }
  });

  return JSON.parse(response.text || '[]');
};
