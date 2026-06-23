import Anthropic from '@anthropic-ai/sdk';
import { products } from '../shared/products.js';

const MAX_PREFERENCES_LENGTH = 500;

const SYSTEM_PROMPT = `You are a product recommendation assistant. Given a catalog of products and user preferences, recommend the best matching products ONLY from the provided catalog.

Return JSON with this shape:
{
  "recommendedIds": [number],
  "explanation": "brief explanation of why these products match"
}

Rules:
- recommendedIds must contain 1 to 4 product ids from the catalog
- Only include products that genuinely match the user's preferences
- Consider price constraints, category, and features mentioned by the user
- If nothing matches well, return the closest alternatives and explain why
- Return only valid JSON, no markdown`;

function parseJsonResponse(text) {
  const trimmed = text.trim();
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = jsonBlock ? jsonBlock[1].trim() : trimmed;
  return JSON.parse(payload);
}

async function getRecommendations(preferences) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackRecommendations(preferences);
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const productCatalog = products.map(({ id, name, category, price, description, tags }) => ({
      id,
      name,
      category,
      price,
      description,
      tags,
    }));

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `User preferences: "${preferences}"

Product catalog:
${JSON.stringify(productCatalog, null, 2)}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock?.text) {
      throw new Error('Empty response from AI');
    }

    const parsed = parseJsonResponse(textBlock.text);
    const recommendedIds = Array.isArray(parsed.recommendedIds) ? parsed.recommendedIds : [];
    const validIds = new Set(products.map((p) => p.id));
    const filteredIds = recommendedIds.filter((id) => validIds.has(id));

    if (filteredIds.length === 0) {
      return fallbackRecommendations(preferences, 'AI returned no valid matches. Showing best local matches.');
    }

    return {
      recommendedIds: filteredIds,
      explanation: parsed.explanation || 'Here are products that match your preferences.',
      source: 'anthropic',
    };
  } catch (error) {
    console.error('AI recommendation failed:', error.message);
    return fallbackRecommendations(
      preferences,
      'AI service unavailable. Showing best local matches instead.',
    );
  }
}

function fallbackRecommendations(preferences, customExplanation) {
  const query = preferences.toLowerCase();
  const priceMatch = query.match(/(?:under|below|less than|max|maximum)\s*\$?\s*(\d+)/i);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

  const categoryKeywords = {
    phone: ['phone', 'smartphone', 'mobile', 'iphone', 'android'],
    laptop: ['laptop', 'notebook', 'computer', 'macbook'],
    headphones: ['headphone', 'earbud', 'earphone', 'audio', 'airpod'],
    tablet: ['tablet', 'ipad'],
    watch: ['watch', 'smartwatch', 'fitness tracker', 'wearable'],
  };

  let matchedCategory = null;
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => query.includes(keyword))) {
      matchedCategory = category;
      break;
    }
  }

  const scored = products.map((product) => {
    let score = 0;

    if (matchedCategory && product.category === matchedCategory) score += 3;
    if (maxPrice !== null && product.price <= maxPrice) score += 2;
    if (maxPrice !== null && product.price > maxPrice) score -= 5;

    for (const tag of product.tags) {
      if (query.includes(tag)) score += 1;
    }

    if (query.includes('budget') || query.includes('cheap') || query.includes('affordable')) {
      if (product.tags.includes('budget')) score += 2;
    }

    if (query.includes('premium') || query.includes('flagship')) {
      if (product.tags.includes('premium')) score += 2;
    }

    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const categoryMatches = matchedCategory
    ? scored.filter(({ product, score }) => product.category === matchedCategory && score > 0)
    : [];

  const recommendations =
    categoryMatches.length > 0
      ? categoryMatches.slice(0, 3)
      : scored.filter((item) => item.score > 0).slice(0, 3).length > 0
        ? scored.filter((item) => item.score > 0).slice(0, 3)
        : scored.slice(0, 3);

  const defaultExplanation = process.env.ANTHROPIC_API_KEY
    ? 'Could not parse AI response. Showing best local matches instead.'
    : 'Running in local mode (no ANTHROPIC_API_KEY). Add your API key for AI-powered recommendations.';

  return {
    recommendedIds: recommendations.map(({ product }) => product.id),
    explanation: customExplanation || defaultExplanation,
    source: 'fallback',
  };
}

export function registerApiRoutes(app) {
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/products', (_req, res) => {
    res.json(products);
  });

  app.post('/api/recommend', async (req, res) => {
    const { preferences } = req.body ?? {};

    if (!preferences?.trim()) {
      return res.status(400).json({ error: 'Preferences are required.' });
    }

    if (preferences.trim().length > MAX_PREFERENCES_LENGTH) {
      return res.status(400).json({
        error: `Preferences must be ${MAX_PREFERENCES_LENGTH} characters or fewer.`,
      });
    }

    try {
      const result = await getRecommendations(preferences.trim());
      res.json(result);
    } catch (error) {
      console.error('Recommendation error:', error.message);
      res.status(500).json({ error: 'Failed to generate recommendations.' });
    }
  });
}
