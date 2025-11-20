
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Topic, Difficulty } from '../types';

const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

export const generateQuestionByTopic = async (apiKey: string, topic: Topic, difficulty: Difficulty): Promise<Question | null> => {
  const ai = getAI(apiKey);
  
  const prompt = `Sen profesyonel bir İlkyardım Eğitmenisin ve Sınav Hazırlık Uzmanısın.
  Konu: "${topic}"
  Hedef: Kullanıcıyı zorlayacak, detay bilgi gerektiren, T.C. Sağlık Bakanlığı İlkyardım Yönetmeliği'ne uygun soru hazırla.
  
  Lütfen bu konuda, İlkyardımcı Sertifikası sınavı zorluk derecesinde (ZOR SEVİYE) bir soru oluştur.
  
  Kurallar:
  1. Soru dili profesyonel TÜRKÇE olmalı.
  2. Şıklar birbirine yakın ve çeldirici olmalı (Sınav formatı).
  3. Cevap kesinlikle güncel Türkiye İlkyardım protokollerine uygun olmalı.
  4. Açıklama kısmı; doğrusunu öğretici, akılda kalıcı ve net olmalı.
  5. JSON formatında çıktı ver.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Soru metni" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "4 adet şık içeren dizi"
            },
            correctAnswer: { 
              type: Type.INTEGER, 
              description: "Doğru cevabın indexi (0, 1, 2 veya 3)" 
            },
            explanation: { type: Type.STRING, description: "Cevabın detaylı açıklaması" }
          },
          required: ["text", "options", "correctAnswer", "explanation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    if (!data.text) return null;

    return {
      id: `ai-${Date.now()}`,
      topic,
      difficulty,
      text: data.text,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation
    };

  } catch (error) {
    console.error("Error generating question:", error);
    return null;
  }
};

export const generateScenarioImage = async (apiKey: string, questionText: String): Promise<string | null> => {
  const ai = getAI(apiKey);
  try {
    const prompt = `Minimalist vector art icon style, flat design, medical illustration.
    Subject: "${questionText}".
    Style: Clean white background, thick lines, simple colors (Red, Blue, White). 
    Purpose: Mobile app educational icon.
    Important: NO gore, NO realistic blood, NO complex details. Simple and memorable visual summary.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
    if (base64ImageBytes) {
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const getChatResponse = async (apiKey: string, message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const ai = getAI(apiKey);
  
  const systemInstruction = `Sen 'CanKurtaran' uygulamasının dost canlısı ve uzman Yapay Zeka İlkyardım Asistanısın. 
  
  Görevin: Kullanıcılara ilkyardım konularında rehberlik etmek, sorularını cevaplamak ve onları motive etmek.
  
  Kurallar:
  1. Cevapların KISA, NET ve ANLAŞILIR olsun (Mobil uygulama için optimize et).
  2. Her zaman Türkiye İlkyardım Yönetmeliği'ne (112 protokolleri) uygun bilgi ver.
  3. Asla kesin tıbbi teşhis koyma, sadece ilkyardım müdahalesini anlat.
  4. Dilin motive edici, sakinleştirici ve pozitif olsun.
  5. Kullanıcı selam verirse, ilkyardım öğrenmenin hayat kurtarmak için ne kadar önemli olduğunu vurgula.
  6. Cevaplarında maddeler veya emojiler kullanarak okunabilirliği artır.`;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash-lite',
    history: history,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text || "Bir hata oluştu, lütfen tekrar deneyin.";
};

export const parseContentToQuestions = async (apiKey: string, content: string): Promise<Question[]> => {
  const ai = getAI(apiKey);
  
  const prompt = `Aşağıdaki metin bir ilkyardım sınavı PDF'inden veya metninden alınmıştır. Bu metindeki soruları, şıkları ve (varsa) cevap anahtarını analiz et.
  
  Görevin:
  Metindeki her bir soruyu ayrıştır ve JSON formatına çevir.
  
  Önemli:
  1. Eğer metin içinde "Cevap Anahtarı" varsa, doğru şıkkı ona göre belirle.
  2. Eğer cevap anahtarı yoksa, bir İlkyardım Uzmanı olarak en doğru şıkkı sen belirle.
  3. Her soru için eğitici bir 'explanation' (açıklama) yaz (Çünkü PDF'te açıklama yazmaz). Bu çok önemli. Kullanıcı soruyu cevaplayınca bu açıklamayı okuyacak.
  4. 'topic' alanını sorunun içeriğine göre tahmin et (Örn: 'Kanamalar', 'CPR', 'Yanıklar' vb. ama İngilizce enum tipine uygun olmasına gerek yok, Türkçe genel başlık yaz, sistem onu halleder).
  5. En az 5, en fazla 20 soru çıkar.

  Metin:
  "${content.substring(0, 25000)}"
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                        topicGuess: { type: Type.STRING }
                    },
                    required: ["text", "options", "correctAnswer", "explanation"]
                }
            }
        }
    });

    const rawQuestions = JSON.parse(response.text || "[]");
    
    // Map to app structure
    return rawQuestions.map((q: any, index: number) => ({
        id: `imported-${Date.now()}-${index}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: Topic.PDF_EXAM, // Assign to the Import topic
        difficulty: Difficulty.MEDIUM
    }));

  } catch (error) {
      console.error("Error parsing content:", error);
      return [];
  }
};