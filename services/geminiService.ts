import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIResponseGraph } from '../types';

// Define the schema for the structured graph output
const graphSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique short identifier (e.g., 'n1')" },
          label: { type: Type.STRING, description: "Visible text on the whiteboard node" },
          details: { type: Type.STRING, description: "A short summary or definition of this concept" },
          type: { type: Type.STRING, enum: ["default", "input", "output"] }
        },
        required: ["id", "label"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING, description: "ID of the source node" },
          target: { type: Type.STRING, description: "ID of the target node" },
          label: { type: Type.STRING, description: "Relationship label (optional)" }
        },
        required: ["source", "target"]
      }
    }
  },
  required: ["nodes", "edges"]
};

export const generateGraphFromText = async (apiKey: string, text: string): Promise<AIResponseGraph> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const systemPrompt = `
    You are an expert Information Architect. 
    Your task is to analyze the provided text and structure it into a clear, hierarchical Mind Map or Flowchart.
    - Extract key concepts as Nodes.
    - Define logical relationships as Edges.
    - Ensure the 'id's are simple (n1, n2, etc.).
    - Keep labels concise (3-5 words max).
    - Use 'details' for longer explanations.
    - Focus on the main logic flow or topic hierarchy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this text and generate a graph structure:\n\n${text.substring(0, 30000)}`, // Limit context window safety
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: graphSchema,
        temperature: 0.2, // Low temperature for deterministic structure
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIResponseGraph;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const expandGraphSelection = async (
  apiKey: string, 
  originalContext: string, 
  selectedNodesJSON: string, 
  userPrompt: string
): Promise<AIResponseGraph> => {
  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    You are an intelligent Whiteboard Assistant.
    The user has selected specific nodes on a canvas. 
    Your task is to generate *NEW* nodes and edges to append to the graph based on their request.
    
    1. Analyze the 'Selected Nodes' and the 'User Instruction'.
    2. Reference the 'Original Document Context' if needed for accuracy.
    3. Return a JSON containing ONLY the NEW nodes and edges to be added.
    4. Ensure new Node IDs do not conflict with existing ones (start IDs with 'new_').
    5. Connect new nodes to the existing selected nodes where logical.
  `;

  const prompt = `
    Original Document Context: ${originalContext.substring(0, 5000)}...
    
    Selected Nodes Data:
    ${selectedNodesJSON}
    
    User Instruction:
    "${userPrompt}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: graphSchema,
        temperature: 0.7, // Higher creativity for expansion
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIResponseGraph;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Expansion Error:", error);
    throw error;
  }
};