
import { GoogleGenAI, Type } from "@google/genai";
import { EntityType, Match, PropertyEntity, Platform } from "../types";

const getAIClient = () => {
  const customKey = localStorage.getItem('estate_sync_custom_api_key');
  const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey as string });
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
          contact: { type: Type.STRING, description: 'Phone number or @username found' },
          timestamp: { type: Type.STRING, description: 'Date and Time of message if found' },
          rawText: { type: Type.STRING, description: 'The EXACT original message text' },
          username: { type: Type.STRING, description: 'Telegram @username if available' },
        },
        required: ['type', 'propertyType', 'community', 'price', 'contact', 'rawText', 'timestamp'],
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

export const extractEntitiesFromChunk = async (chunkText: string, groupName: string, platform: Platform): Promise<PropertyEntity[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Analyze this ${platform} chat snippet from the group: "${groupName}". 
      Identify properties offered (UNITS) and client leads (REQUIREMENTS).
      
      IMPORTANT:
      1. Look for the Date and Time prefixing the messages.
      2. If multiple messages are in a chunk, extract the correct timestamp for each.
      3. Capture the EXACT raw message text for each entity.
      4. For Telegram, extract @usernames if they appear as the sender or in text.
      
      Snippet:
      ${chunkText}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_SCHEMA,
    }
  });

  const rawData = JSON.parse(response.text || '{"entities":[]}');
  return rawData.entities.map((entity: any, index: number) => ({
    ...entity,
    id: `${entity.type.toLowerCase()}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
    groupName: groupName,
    platform: platform
  }));
};

export const matchEntities = async (units: PropertyEntity[], requirements: PropertyEntity[]): Promise<Match[]> => {
  if (units.length === 0 || requirements.length === 0) return [];
  
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      Compare these Units against Lead Requirements. Match them based on Community, Budget/Price, and Size.
      
      UNITS (Inventory):
      ${JSON.stringify(units.slice(-50))}
      
      REQUIREMENTS (Leads):
      ${JSON.stringify(requirements.slice(-50))}
      
      Return a JSON array of high-potential matches.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: MATCHING_SCHEMA,
    }
  });

  return JSON.parse(response.text || '[]');
};
