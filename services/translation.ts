// Translation service using multiple free translation APIs as fallback

interface TranslationResult {
  text: string;
  source: 'manual' | 'google' | 'mymemory' | 'libre';
}

// Option 1: Google Translate (unofficial, free tier)
async function translateWithGoogle(text: string, from: string, to: string): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const result = await response.json();
    return result[0]?.[0]?.[0] || null;
  } catch (error) {
    console.error('Google Translate error:', error);
    return null;
  }
}

// Option 2: MyMemory Translation API (free tier: 5000 chars/day)
async function translateWithMyMemory(text: string, from: string, to: string): Promise<string | null> {
  try {
    const langPair = `${from}|${to}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const result = await response.json();
    return result.responseData?.translatedText || null;
  } catch (error) {
    console.error('MyMemory Translate error:', error);
    return null;
  }
}

// Option 3: LibreTranslate (if you have a server)
async function translateWithLibre(text: string, from: string, to: string): Promise<string | null> {
  try {
    // You can use the public instance or self-host
    const url = 'https://libretranslate.de/translate';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text'
      })
    });
    
    if (!response.ok) return null;
    const result = await response.json();
    return result.translatedText || null;
  } catch (error) {
    console.error('LibreTranslate error:', error);
    return null;
  }
}

// Main translation function with fallback
export async function translate(
  text: string, 
  from: string = 'zh', 
  to: string = 'en'
): Promise<TranslationResult> {
  // Skip if text is empty
  if (!text.trim()) {
    return { text: '', source: 'manual' };
  }

  // Try Google Translate first
  const googleResult = await translateWithGoogle(text, from, to);
  if (googleResult) {
    return { text: googleResult, source: 'google' };
  }

  // Fallback to MyMemory
  const myMemoryResult = await translateWithMyMemory(text, from, to);
  if (myMemoryResult) {
    return { text: myMemoryResult, source: 'mymemory' };
  }

  // Fallback to LibreTranslate
  const libreResult = await translateWithLibre(text, from, to);
  if (libreResult) {
    return { text: libreResult, source: 'libre' };
  }

  // If all fail, return original text
  console.warn('All translation services failed, returning original text');
  return { text, source: 'manual' };
}

// Batch translation for announcements
export async function translateAnnouncement(
  title: string,
  content: string,
  from: string = 'zh',
  to: string = 'en'
): Promise<{ title: string; content: string }> {
  const [titleResult, contentResult] = await Promise.all([
    translate(title, from, to),
    translate(content, from, to)
  ]);

  return {
    title: titleResult.text,
    content: contentResult.text
  };
}