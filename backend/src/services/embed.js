import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

export async function embedText(text) {
  // outputDimensionality truncates via MRL to match the vector(768) schema column
  const result = await model.embedContent({
    content: { parts: [{ text }], role: 'user' },
    outputDimensionality: 768,
  });
  return result.embedding.values;
}
