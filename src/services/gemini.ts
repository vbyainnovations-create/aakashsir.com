import { GoogleGenAI } from "@google/genai";


export async function getPhysicsContent(chapter: string, grade: string, type: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Fetching physics content for:", { chapter, grade, type });
  console.log("API Key type:", typeof apiKey);
  console.log("API Key exists:", !!apiKey);
  
  if (!apiKey || typeof apiKey !== 'string') {
    console.error("GEMINI_API_KEY is not defined or not a string.");
    return "Configuration error: API Key is missing or invalid. Please check your settings in AI Studio.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert Physics teacher for CBSE Class ${grade}.
    Provide high-quality, comprehensive content for the chapter "${chapter}" in the category "${type}".
    
    Category Requirements:
    - theory: Detailed, in-depth explanation of all core concepts.
    - derivation: Step-by-step mathematical derivations for all major formulas.
    - practice: A diverse set of 10-15 questions with detailed solutions.
    - assignment: A comprehensive assignment following the latest CBSE pattern (MCQs, Assertion-Reason, Case Study, 2/3/5 mark questions).

    CRITICAL FORMATTING RULES:
    1. Use Markdown for structure.
    2. Use LaTeX for ALL mathematical formulas and equations ($...$ for inline, $$...$$ for block).
    3. For any diagrams or illustrations, provide clear textual descriptions or simple ASCII representations.
    4. Ensure the content is strictly aligned with the latest CBSE Class ${grade} syllabus.
  `;

  try {
    console.log("Sending prompt to Gemini...");
    // Using simpler contents format as per guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    console.log("Response received from Gemini API");
    
    if (!response || !response.text) {
      console.error("Invalid or empty response from Gemini API:", response);
      throw new Error("Empty or invalid response from Gemini API");
    }
    
    const text = response.text;
    console.log("Successfully extracted text from Gemini response (length:", text.length, ")");
    return text;
  } catch (error) {
    console.error("Detailed error fetching physics content:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return `Failed to load content. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;
  }
}
