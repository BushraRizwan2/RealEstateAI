/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";

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
    
    if (apiKey === 'undefined') {
       apiKey = '';
    }

    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please supply a valid GEMINI_API_KEY in the app settings to use AI listing generation features.");
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
  type: "OBJECT",
  properties: {
    title: { type: "STRING", description: "A catchy 5-10 word title for the listing" },
    description: { type: "STRING", description: "A professional 2-3 sentence marketing description" },
    priceEstimate: { type: "STRING", description: "Estimated price range (e.g. '$500,000 - $550,000')" },
    type: { type: "STRING", enum: ["Sale", "Rent"] },
    category: { type: "STRING", enum: ["House", "Apartment", "Commercial", "Land"] },
    amenities: { type: "ARRAY", items: { type: "STRING" }, description: "List of 5 visible features" },
    condition: { type: "STRING", enum: ["New", "Excellent", "Good", "Fair"] }
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