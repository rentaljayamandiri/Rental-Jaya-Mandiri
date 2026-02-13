import { GoogleGenAI } from "@google/genai";
import { INITIAL_CARS } from "./constants";

export const getCarRecommendation = async (userPrompt: string) => {
  // Pastikan API_KEY sudah diset di Environment Variables Vercel
  if (!process.env.API_KEY) {
    return "Maaf, API Key belum terkonfigurasi di server. Silakan pastikan 'API_KEY' sudah ditambahkan di Environment Variables Vercel.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fleetInfo = INITIAL_CARS.map(c => 
      `- Mobil: ${c.brand} ${c.name}, Kategori: ${c.category}, Harga: Rp${c.pricePerDay.toLocaleString('id-ID')}/hari, Kapasitas: ${c.seats} orang. Deskripsi: ${c.description}`
    ).join('\n');

    const systemInstruction = `
      Anda adalah asisten AI ramah dan profesional dari Rental Jaya Mandiri (RJM).
      Berikut adalah daftar armada kami:
      ${fleetInfo}

      Aturan:
      1. Berikan rekomendasi mobil paling cocok berdasarkan kebutuhan user.
      2. Gunakan bahasa Indonesia yang sopan dan membantu.
      3. Selalu sebutkan harga sewanya.
      4. Jika user butuh untuk banyak orang (di atas 7), arahkan ke HiAce Premio.
      5. Jika user butuh kemewahan atau VIP, arahkan ke Toyota Alphard.
      6. Akhiri dengan ajakan untuk menghubungi WhatsApp kami di menu Kontak.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Saya merekomendasikan Toyota Avanza untuk perjalanan Anda yang hemat dan nyaman.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ups, asisten AI kami sedang istirahat sejenak. Silakan langsung hubungi admin via WhatsApp untuk respon cepat!";
  }
};
