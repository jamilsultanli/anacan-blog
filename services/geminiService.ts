import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({ apiKey });
};

export async function getAiParentingAdvice(question: string): Promise<string> {
  const ai = getGeminiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sən Anacan.az platformasının ağıllı köməkçisisən. Analara dəstək məqsədilə verilən suala müasir, mehriban və elmi əsaslı cavab ver. Sual: ${question}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    return response.text || "Bağışlayın, hazırda cavab verə bilmirəm. Zəhmət olmasa bir az sonra yenidən yoxlayın.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sistemdə xəta baş verdi. Zəhmət olmasa internet bağlantınızı yoxlayın.";
  }
}

// Translation function
export async function translateBlogPost(
  title: string,
  content: string,
  fromLocale: 'az' | 'ru',
  toLocale: 'az' | 'ru'
): Promise<{ title: string; content: string; excerpt: string }> {
  const ai = getGeminiClient();
  
  try {
    const fromLang = fromLocale === 'az' ? 'Azərbaycan dili' : 'Rus dili';
    const toLang = toLocale === 'az' ? 'Azərbaycan dili' : 'Rus dili';
    
    const prompt = `Sən Anacan.az platformasının peşəkar tərcüməçisisən. Aşağıdakı bloq yazısını ${fromLang} dilindən ${toLang} dilinə tərcümə et.

BLOQ BAŞLIĞI (${fromLang}):
${title}

BLOQ MƏZMUNU (${fromLang}):
${content.substring(0, 8000)}

TƏLƏBLƏR:
1. Başlığı tərcümə et (orijinal mənanı saxla, SEO-optimizasiyalı olsun)
2. Məzmunu tərcümə et (HTML taglarını qoruyun, məzmunu peşəkar şəkildə tərcümə edin)
3. Qısa xülasə (excerpt) yarad (200-250 simvol, məqalənin əsas məzmununu əhatə edir)
4. Bloq üslubunu qoruyun (canayaxın, analara yönəldilmiş)
5. Peşəkar və təbii tərcümə (sözlük tərcüməsi deyil, məntiqi tərcümə)

Cavabı JSON formatında ver:
{
  "title": "Tərcümə olunmuş başlıq",
  "content": "Tərcümə olunmuş məzmun (HTML ilə)",
  "excerpt": "Qısa xülasə (200-250 simvol)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 8000,
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || title,
        content: parsed.content || content,
        excerpt: parsed.excerpt || content.substring(0, 250),
      };
    }
    
    // Fallback
    return {
      title,
      content,
      excerpt: content.substring(0, 250),
    };
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
}

// SEO Content Generation Functions
export interface SEOContentRequest {
  topic: string;
  locale: 'az' | 'ru';
  keywords?: string[];
  targetLength?: number;
}

export interface SEOContentResponse {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  suggestions: string[];
}

export interface BlogTitleOption {
  title: string;
  description: string;
  focusKeyword: string;
}

export interface FullBlogPostResponse {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  keywords: string[];
  tags: string[];
  slug: string;
  readTime: number;
  h1: string;
  h2s: string[];
}

// Generate multiple title options for a topic
export async function generateTitleOptions(
  topic: string,
  locale: 'az' | 'ru'
): Promise<BlogTitleOption[]> {
  const ai = getGeminiClient();
  
  try {
    const prompt = `Sən Anacan.az platformasının peşəkar bloq yazıçısısən. "${topic}" mövzusu üçün 5 fərqli, cəlbedici və SEO-optimizasiyalı başlıq variantı yarat.

Dil: ${locale === 'az' ? 'Azərbaycan dili' : 'Rus dili'}
Mövzu: ${topic}

Hər başlıq üçün:
- Başlıq (50-70 simvol, SEO-optimizasiyalı, cəlbedici)
- Qısa təsvir (bu başlığın nə haqqında olacağını izah edən 1-2 cümlə)
- Əsas açar söz (bu başlıq üçün əsas SEO açar sözü)

Cavabı JSON formatında ver:
{
  "titles": [
    {
      "title": "Başlıq 1",
      "description": "Təsvir 1",
      "focusKeyword": "açar söz 1"
    },
    {
      "title": "Başlıq 2",
      "description": "Təsvir 2",
      "focusKeyword": "açar söz 2"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 2000,
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.titles || [];
    }
    
    return [];
  } catch (error) {
    console.error("Title Options Generation Error:", error);
    return [];
  }
}

// Generate full professional blog post
export async function generateFullBlogPost(
  topic: string,
  selectedTitle: string,
  focusKeyword: string,
  locale: 'az' | 'ru',
  targetLength?: number
): Promise<FullBlogPostResponse> {
  const ai = getGeminiClient();
  
  try {
    const wordCount = targetLength || 1500;
    const language = locale === 'az' ? 'Azərbaycan dili' : 'Rus dili';
    
    const prompt = `Sən Anacan.az platformasının peşəkar bloq yazıçısısən. Aşağıdakı mövzu və başlıq üçün tam, peşəkar, canayaxın və SEO-optimizasiyalı bloq yazısı hazırla.

Mövzu: ${topic}
Başlıq: ${selectedTitle}
Əsas Açar Söz: ${focusKeyword}
Dil: ${language}
Hədəf uzunluq: ${wordCount} söz

BLOQ YAZISI TƏLƏBLƏRİ:

1. ÜSLUB:
   - Peşəkar amma canayaxın, dostluq üslubunda
   - Analara və gözlənilən analara müraciət
   - Elmi əsaslı amma anlaşılır dil
   - Əmin edici və dəstəkləyici ton
   - Anacan.az platformasının ruhuna uyğun

2. STRUKTUR:
   - Giriş (cəlbedici, mövzuya giriş, oqunuçunun diqqətini çəkir)
   - Əsas hissələr (H2 başlıqları ilə 3-5 bölmə)
   - Hər bölmədə H3 alt-başlıqları (zəruri olduqda)
   - Nəticə (xülasə və praktik məsləhətlər)
   - HTML formatında strukturlu (p, h2, h3, ul, li, strong tagları)

3. SEO OPTİMİZASİYASI:
   - Meta Title (50-60 simvol, açar sözləri ehtiva edir)
   - Meta Description (150-160 simvol, cəlbedici, açar sözləri ehtiva edir)
   - Excerpt (200-250 simvol, məqalənin qısa xülasəsi)
   - Əsas başlıq H1 formatında
   - Alt başlıqlar H2 və H3 formatında
   - Açar sözlər təbii şəkildə mətnə daxil edilmiş
   - 10-15 SEO açar söz
   - 5-8 etiket (tags)

4. MƏZMUN KEYFİYYƏTİ:
   - Faktik məlumatlar
   - Praktik məsləhətlər
   - Müasir yanaşmalar
   - Oxucuya faydalı məzmun
   - Məntiqli strukturlu paragraflar
   - Oxunuşu asan, axıcı dil

Cavabı JSON formatında ver:
{
  "title": "${selectedTitle}",
  "metaTitle": "SEO meta title (50-60 simvol)",
  "metaDescription": "SEO meta description (150-160 simvol)",
  "excerpt": "Qısa xülasə (200-250 simvol)",
  "content": "HTML formatında tam məzmun (giriş, əsas hissələr, nəticə)",
  "keywords": ["açar söz 1", "açar söz 2", ...],
  "tags": ["etiket 1", "etiket 2", ...],
  "slug": "url-friendly-slug",
  "readTime": 5,
  "h1": "Əsas başlıq",
  "h2s": ["Alt başlıq 1", "Alt başlıq 2", ...]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Calculate read time based on content length
      const wordCount = parsed.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
      
      return {
        title: parsed.title || selectedTitle,
        metaTitle: parsed.metaTitle || selectedTitle.substring(0, 60),
        metaDescription: parsed.metaDescription || '',
        excerpt: parsed.excerpt || '',
        content: parsed.content || '',
        keywords: parsed.keywords || [],
        tags: parsed.tags || [],
        slug: parsed.slug || generateSlug(selectedTitle),
        readTime: parsed.readTime || readTime,
        h1: parsed.h1 || selectedTitle,
        h2s: parsed.h2s || [],
      };
    }
    
    // Fallback
    return {
      title: selectedTitle,
      metaTitle: selectedTitle.substring(0, 60),
      metaDescription: '',
      excerpt: '',
      content: `<h1>${selectedTitle}</h1><p>Bloq yazısı yaradılarkən xəta baş verdi.</p>`,
      keywords: [],
      tags: [],
      slug: generateSlug(selectedTitle),
      readTime: 5,
      h1: selectedTitle,
      h2s: [],
    };
  } catch (error) {
    console.error("Full Blog Post Generation Error:", error);
    throw error;
  }
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

export async function generateSEOContent(request: SEOContentRequest): Promise<SEOContentResponse> {
  const ai = getGeminiClient();
  
  try {
    const prompt = `Sən Anacan.az platformasının SEO mütəxəssisisən. Aşağıdakı mövzu üçün mükəmməl SEO optimizasiyalı kontent hazırla:

Mövzu: ${request.topic}
Dil: ${request.locale === 'az' ? 'Azərbaycan dili' : 'Rus dili'}
Açar sözlər: ${request.keywords?.join(', ') || 'avtomatik təyin olunacaq'}
Hədəf uzunluq: ${request.targetLength || 1000} söz

Tələblər:
1. SEO-optimizasiyalı başlıq (50-60 simvol, açar sözləri ehtiva etməlidir)
2. Meta description (150-160 simvol, cəlbedici və açar sözləri ehtiva etməlidir)
     Yüksək keyfiyyətli, informativ məzmun (H1, H2, H3 strukturu ilə)
4. 5-10 açar söz siyahısı
5. SEO təklifləri

Cavabı JSON formatında ver:
{
  "title": "...",
  "metaDescription": "...",
  "content": "...",
  "keywords": ["...", "..."],
  "suggestions": ["...", "..."]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    });

    const text = response.text || '';
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      title: request.topic,
      metaDescription: text.substring(0, 160),
      content: text,
      keywords: request.keywords || [],
      suggestions: []
    };
  } catch (error) {
    console.error("Gemini SEO Content Generation Error:", error);
    throw error;
  }
}

export async function optimizeMetaDescription(
  content: string,
  locale: 'az' | 'ru',
  keywords?: string[]
): Promise<string> {
  const ai = getGeminiClient();
  
  try {
    const prompt = `Aşağıdakı məzmun üçün SEO-optimizasiyalı meta description yaz (150-160 simvol, ${locale === 'az' ? 'Azərbaycan dilində' : 'Rus dilində'}):

Məzmun: ${content.substring(0, 500)}
${keywords ? `Açar sözlər: ${keywords.join(', ')}` : ''}

Meta description cəlbedici, informativ və açar sözləri ehtiva etməlidir.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    return response.text?.trim() || '';
  } catch (error) {
    console.error("Meta Description Optimization Error:", error);
    throw error;
  }
}

export async function optimizeTitle(
  currentTitle: string,
  locale: 'az' | 'ru',
  keywords?: string[]
): Promise<string> {
  const ai = getGeminiClient();
  
  try {
    const prompt = `Aşağıdakı başlığı SEO üçün optimallaşdır (50-60 simvol, ${locale === 'az' ? 'Azərbaycan dilində' : 'Rus dilində'}):

Cari başlıq: ${currentTitle}
${keywords ? `Açar sözlər: ${keywords.join(', ')}` : ''}

Başlıq SEO-optimizasiyalı, cəlbedici və açar sözləri ehtiva etməlidir.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      }
    });

    return response.text?.trim() || currentTitle;
  } catch (error) {
    console.error("Title Optimization Error:", error);
    throw error;
  }
}

export async function generateKeywords(
  topic: string,
  locale: 'az' | 'ru'
): Promise<string[]> {
  const ai = getGeminiClient();
  
  try {
    const prompt = `"${topic}" mövzusu üçün SEO açar sözləri təklif et (${locale === 'az' ? 'Azərbaycan dilində' : 'Rus dilində'}). 10-15 açar söz ver, JSON array formatında.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return [];
  } catch (error) {
    console.error("Keyword Generation Error:", error);
    return [];
  }
}

export async function analyzeContentSEO(
  content: string,
  title: string,
  metaDescription: string,
  locale: 'az' | 'ru'
): Promise<{
  score: number;
  issues: string[];
  suggestions: string[];
}> {
  const ai = getGeminiClient();
  
  try {
    const prompt = `Aşağıdakı kontenti SEO baxımından analiz et və qiymətləndir (0-100):

Başlıq: ${title}
Meta Description: ${metaDescription}
Məzmun: ${content.substring(0, 1000)}
Dil: ${locale === 'az' ? 'Azərbaycan dili' : 'Rus dili'}

JSON formatında cavab ver:
{
  "score": 85,
  "issues": ["problem 1", "problem 2"],
  "suggestions": ["təklif 1", "təklif 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 1000,
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      score: 70,
      issues: [],
      suggestions: []
    };
  } catch (error) {
    console.error("SEO Analysis Error:", error);
    return {
      score: 0,
      issues: ['Analiz zamanı xəta baş verdi'],
      suggestions: []
    };
  }
}
