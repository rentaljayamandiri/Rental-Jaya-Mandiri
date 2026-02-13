import { GoogleGenAI } from "@google/genai";
import { INITIAL_CARS } from "./constants";

export const getCarRecommendation = async (userPrompt: string) => {
  // PENTING: Jangan ubah baris ini, ini adalah cara Vite mengambil API_KEY
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    console.error("API_KEY is missing in environment");
    return "Maaf bosku, sepertinya API Key belum terpasang di Vercel. Silakan tambahkan 'API_KEY' di Settings > Environment Variables lalu Redeploy.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const fleetInfo = INITIAL_CARS.map(c => 
      `- Mobil: ${c.brand} ${c.name}, Kategori: ${c.category}, Harga: Rp${c.pricePerDay.toLocaleString('id-ID')}/hari, Kapasitas: ${c.seats} orang. Fitur: ${c.features.join(', ')}`
    ).join('\n');

    const systemInstruction = `
      Anda adalah asisten AI dari Rental Jaya Mandiri (RJM).
      Tugas Anda: Membantu pelanggan memilih mobil rental yang tepat.
      
      Daftar Armada Kami:
      ${fleetInfo}

      Instruksi:
      1. Jawab dengan ramah menggunakan Bahasa Indonesia yang profesional namun santai.
      2. Berikan saran mobil spesifik berdasarkan jumlah penumpang atau budget yang disebutkan user.
      3. Jika user ingin booking, arahkan mereka untuk menghubungi WhatsApp admin di nomor +62 812-1093-2808.
      4. Jangan memberikan informasi di luar konteks rental mobil RJM.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Saya merekomendasikan Toyota Innova Zenix untuk kenyamanan keluarga Anda. Ada lagi yang ingin ditanyakan?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Waduh, otak AI saya sedang panas bosku. Coba tanya lagi sebentar lagi atau langsung hubungi admin via WhatsApp ya!";
  }
};
