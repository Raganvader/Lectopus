// services/translate.ts
const DEEPL_ENDPOINT = "https://api-free.deepl.com/v2/translate";
const API_KEY = process.env.EXPO_PUBLIC_DEEPL_API_KEY!;

export async function translateText({
  text,
  targetLang = "TR",
}: {
  text: string;
  targetLang?: string;
}): Promise<string> {
  if (!text) return "";

  try {
    const res = await fetch(DEEPL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang,
      }),
    });

    if (!res.ok) {
      console.warn("DeepL API hata:", res.status);
      return text; // hata olursa orijinal metni döndür
    }

    const data = await res.json();
    return data?.translations?.[0]?.text ?? text;
  } catch (err) {
    console.error("DeepL translate error:", err);
    return text;
  }
}
