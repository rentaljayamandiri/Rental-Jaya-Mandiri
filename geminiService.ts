
import { GoogleGenAI } from "@google/genai";
import { INITIAL_CARS } from "./constants";

export const getCarRecommendation = async (userPrompt: string) => {
  // Priority 1: process.env (Vercel/Local)
  // Priority 2: Fallback string (If you want to hardcode for Hostinger, replace 'YOUR_API_KEY_HERE')
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    return "API Key belum terkonfigurasi. Silakan hubungi admin RJM.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const fleetInfo = INITIAL_CARS.map(c => 
    `ID: ${c.id}, Brand: ${c.brand}, Model: ${c.name}, Category: ${c.category}, Price: Rp${c.pricePerDay}/hari, Description: ${c.description}`
  ).join('\n');

  const systemInstruction = `
    Anda adalah asisten rental mobil profesional untuk 'Rental Jaya Mandiri (RJM)'.
    Armada kami saat ini:
    ${fleetInfo}

    Tujuan Anda adalah membantu pengguna menemukan mobil terbaik berdasarkan kebutuhan mereka.
    
    Aturan:
    1. Hanya rekomendasikan mobil dari daftar di atas.
    2. Ramah, profesional, dan gunakan bahasa Indonesia yang baik.
    3. Jelaskan MENGAPA Anda merekomendasikan mobil tersebut.
    4. Berikan jawaban dalam format yang jelas.
    5. Sebutkan harga rentalnya.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Mohon maaf, saya tidak dapat menemukan rekomendasi spesifik. Bisa ceritakan lebih lanjut kebutuhan perjalanan Anda?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Asisten AI sedang beristirahat sejenak. Silakan jelajahi katalog kami secara manual!";
  }
};
