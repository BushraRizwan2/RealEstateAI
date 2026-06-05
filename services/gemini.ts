/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_MODEL = 'gemini-3-pro-preview';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    let apiKey = '';
    try {
       apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    } catch (e) {
       // Catch error if process is undefined
    }
    if (!apiKey) {
      console.warn("Gemini API key is not configured. AI Analysis features will require configuring the key.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface PropertyAnalysis {
  title: string;
  description: string;
  priceEstimate: string;
  type: 'Sale' | 'Rent';
  category: 'House' | 'Apartment' | 'Commercial' | 'Land';
  amenities: string[];
  condition: 'New' | 'Excellent' | 'Good' | 'Fair';
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy 5-10 word title for the listing" },
    description: { type: Type.STRING, description: "A professional 2-3 sentence marketing description" },
    priceEstimate: { type: Type.STRING, description: "Estimated price range (e.g. '$500,000 - $550,000')" },
    type: { type: Type.STRING, enum: ["Sale", "Rent"] },
    category: { type: Type.STRING, enum: ["House", "Apartment", "Commercial", "Land"] },
    amenities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 5 visible features" },
    condition: { type: Type.STRING, enum: ["New", "Excellent", "Good", "Fair"] }
  },
  required: ["title", "description", "priceEstimate", "type", "category", "amenities", "condition"]
};

export async function analyzeProperty(fileBase64: string, mimeType: string): Promise<PropertyAnalysis> {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { 
            text: "You are a Real Estate Expert. Analyze this image to create a listing. Determine if it looks like a rental or sale based on quality/staging. Estimate price based on luxury level. List amenities visible." 
          },
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as PropertyAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}