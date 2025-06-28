import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { platformId, directUrl, prompt } = await req.json()
    
    console.log(`Starting content fetch for platform: ${platformId}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Enhanced security platforms configuration with improved selectors for daily news
    const securityPlatforms = {
      'thehackernews': { 
        name: 'The Hacker News', 
        url: 'https://thehackernews.com',
        selectors: {
          articles: '.story-block, .clear.home-right .body-post, article, .story-link',
          title: '.home-title, .story-title, h2, h3',
          content: '.home-desc, .story-desc, .excerpt, p',
          link: 'a[href*="/2025/"]'
        }
      },
      'darkreading': { 
        name: 'Dark Reading', 
        url: 'https://www.darkreading.com',
        selectors: {
          articles: '.ListPreview-item, .story-package, .content-item, .river-well',
          title: '.ListPreview-title, .headline, h3, h2',
          content: '.ListPreview-description, .dek, .summary, p',
          link: 'a[href*="/article/"]'
        }
      },
      'securityweek': { 
        name: 'SecurityWeek', 
        url: 'https://www.securityweek.com',
        selectors: {
          articles: '.post, .news-item, .story, .article-item',
          title: '.post-title, .entry-title, h2, h3',
          content: '.post-excerpt, .excerpt, .summary, p',
          link: 'a[href*="/news/"]'
        }
      },
      'krebsonsecurity': { 
        name: 'Krebs on Security', 
        url: 'https://krebsonsecurity.com',
        selectors: {
          articles: '.post, .entry, article, .hentry',
          title: '.entry-title, .post-title, h1, h2',
          content: '.entry-summary, .excerpt, p',
          link: 'a[href*="krebsonsecurity.com"]'
        }
      },
      'cso': { 
        name: 'CSO', 
        url: 'https://www.csoonline.com',
        selectors: {
          articles: '.river-well, .listing-item, article, .item',
          title: '.headline, .river-well h3, h2',
          content: '.dek, .summary, .excerpt, p',
          link: 'a[href*="/article/"]'
        }
      },
      'infosecurity': { 
        name: 'Infosecurity Magazine', 
        url: 'https://www.infosecurity-magazine.com',
        selectors: {
          articles: '.news-item, .item, .post, .article',
          title: '.title, .headline, h3, h2',
          content: '.description, .summary, .excerpt, p',
          link: 'a[href*="/news/"]'
        }
      },
      'cybersecuritydive': { 
        name: 'Cybersecurity Dive', 
        url: 'https://cybersecuritydive.com',
        selectors: {
          articles: '.feed__item, .story, .news-item',
          title: '.headline__text, .feed__title, h3',
          content: '.deck, .feed__excerpt, .summary',
          link: 'a[href*="/news/"]'
        }
      },
      'cyberscoop': { 
        name: 'CyberScoop', 
        url: 'https://www.cyberscoop.com',
        selectors: {
          articles: '.post-item, .story-item, article',
          title: '.entry-title, .post-title, h2',
          content: '.post-excerpt, .excerpt, .summary',
          link: 'a[href*="cyberscoop.com"]'
        }
      },
      'threatpost': { 
        name: 'Threatpost', 
        url: 'https://threatpost.com',
        selectors: {
          articles: '.post, .story, .news-item',
          title: '.entry-title, .post-title, h2',
          content: '.post-excerpt, .excerpt, .summary',
          link: 'a[href*="threatpost.com"]'
        }
      },
      'schneier': { 
        name: 'Schneier on Security', 
        url: 'https://www.schneier.com',
        selectors: {
          articles: '.entry, .post, .blog-post',
          title: '.entry-title, .post-title, h2',
          content: '.entry-content, .content, p',
          link: 'a[href*="schneier.com"]'
        }
      },
      'troyhunt': { 
        name: 'Troy Hunt Blog', 
        url: 'https://www.troyhunt.com',
        selectors: {
          articles: '.post, .blog-post, article',
          title: '.post-title, .entry-title, h1, h2',
          content: '.post-excerpt, .excerpt, .content',
          link: 'a[href*="troyhunt.com"]'
        }
      },
      'wired': { 
        name: 'Wired Security', 
        url: 'https://www.wired.com/category/security',
        selectors: {
          articles: '.archive-item-component, .summary-item, article',
          title: '.archive-item-component__title, .summary-item__hed, h3',
          content: '.archive-item-component__desc, .summary-item__dek, .excerpt',
          link: 'a[href*="/story/"]'
        }
      },
      'helpnetsecurity': { 
        name: 'Help Net Security', 
        url: 'https://www.helpnetsecurity.com',
        selectors: {
          articles: '.post, .news-item, article',
          title: '.entry-title, .post-title, h2',
          content: '.post-excerpt, .excerpt, .summary',
          link: 'a[href*="helpnetsecurity.com"]'
        }
      },
      'cybercrimemagazine': { 
        name: 'Cybercrime Magazine', 
        url: 'https://cybercrimemagazine.com',
        selectors: {
          articles: '.post, .story, .news-item',
          title: '.entry-title, .post-title, h2',
          content: '.post-excerpt, .excerpt, .summary',
          link: 'a[href*="cybercrimemagazine.com"]'
        }
      }
    }
    
    // Check if this is a hardcoded security platform or database platform
    let platform;
    let isHardcodedPlatform = false;
    
    if (securityPlatforms[platformId]) {
      platform = securityPlatforms[platformId];
      isHardcodedPlatform = true;
    } else {
      // Try to fetch from database
      const { data: dbPlatform, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', platformId)
        .single();
      
      if (error || !dbPlatform) {
        throw new Error(`Platform ${platformId} not found in database or hardcoded platforms`);
      }
      
      platform = {
        name: dbPlatform.name,
        url: dbPlatform.url,
        selectors: {
          articles: 'article, .post, .news-item, .story',
          title: 'h1, h2, h3, .title, .headline',
          content: '.content, .excerpt, .summary, p',
          link: 'a'
        }
      };
    }

    const targetUrl = directUrl || platform.url;
    console.log(`Fetching content from: ${targetUrl} (hardcoded: ${isHardcodedPlatform})`);

    let extractedContent = [];

    // Try AI extraction first if available
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (openAIApiKey) {
      console.log('Using AI-powered extraction for daily security news');
      try {
        const aiContent = await extractDailySecurityNews(targetUrl, openAIApiKey, platformId, platform);
        if (aiContent && aiContent.length > 0) {
          extractedContent = aiContent;
          console.log(`AI extracted ${aiContent.length} daily security news items successfully`);
        }
      } catch (aiError) {
        console.error('AI extraction failed, falling back to enhanced scraping:', aiError.message);
      }
    } else {
      console.log('No OpenAI API key found, using enhanced scraping only');
    }

    // If AI failed or no API key, use enhanced scraping
    if (extractedContent.length === 0) {
      console.log('Using enhanced content extraction as fallback');
      extractedContent = await enhancedContentExtraction(targetUrl, platform, platformId);
    }

    console.log(`Total extracted ${extractedContent.length} items`);

    if (extractedContent.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Unable to extract daily security content from ${platform.name}. The website may be using anti-scraping measures or has updated its structure.`,
          items: 0,
          debug: {
            platform: platformId,
            url: targetUrl,
            hasOpenAI: !!openAIApiKey,
            isHardcodedPlatform
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Save extracted content to database with proper platform_id handling
    const savedContent = [];
    for (const post of extractedContent) {
      try {
        const { data: saved, error: saveError } = await supabase
          .from('fetched_content')
          .insert({
            platform_id: isHardcodedPlatform ? platformId : platformId, // Use string for hardcoded, UUID for database
            title: post.title,
            content: post.content,
            url: post.url,
            content_type: post.contentType || 'security_news',
            extracted_at: post.extractedDate || new Date().toISOString(),
            metadata: {
              extraction_method: post.extractionMethod || 'ai_daily_news_v6',
              strategy: post.strategy || 'daily_security_focus',
              content_length: post.content?.length || 0,
              title_length: post.title?.length || 0,
              fetched_at: new Date().toISOString(),
              url_source: post.url,
              platform_config: platform.name,
              is_hardcoded_platform: isHardcodedPlatform
            }
          })
          .select()
          .single()

        if (!saveError && saved) {
          savedContent.push(saved)
          console.log(`✓ Saved daily news: "${post.title.substring(0, 50)}..."`)
        } else {
          console.error('Error saving content:', saveError)
        }
      } catch (error) {
        console.error('Error in save operation:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: savedContent,
        items: savedContent.length,
        message: `Successfully extracted ${savedContent.length} daily security news items from ${platform.name}`,
        extractionMethod: extractedContent[0]?.extractionMethod || 'ai_daily_news_v6'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in content fetcher:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        message: `Failed to extract content: ${error.message}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Enhanced AI extraction specifically for daily security news
async function extractDailySecurityNews(targetUrl: string, openAIApiKey: string, platformId: string, platform: any) {
  try {
    console.log('Starting AI extraction for daily security news...');
    
    // Fetch the page content with better headers
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${targetUrl}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} characters of HTML for daily news extraction`);
    
    // Enhanced AI prompt specifically for daily security news
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert cybersecurity news extractor. Extract ONLY recent daily security news articles from the provided HTML. Focus on:

1. Recent articles published today or within the last few days
2. Cybersecurity-related content (vulnerabilities, breaches, threats, security tools, etc.)
3. Skip old articles, advertisements, navigation items, or promotional content
4. Extract actual article titles and meaningful summaries
5. Include full URLs when possible

Return ONLY a valid JSON array of recent security articles:
[
  {
    "title": "Exact article title here",
    "content": "Detailed article summary or excerpt (3-5 sentences with key security details)",
    "url": "Complete article URL here"
  }
]

Requirements:
- Focus on articles with URLs containing /2025/ or current year
- Prioritize vulnerability reports, security incidents, threat analysis
- Extract 5-15 of the most recent and relevant articles
- Ensure JSON is valid and parseable
- Include substantive content summaries with security context
- Skip duplicate or similar articles`
          },
          {
            role: 'user',
            content: `Extract recent daily cybersecurity news articles from this ${platform.name} webpage. Focus on articles published today or in the last few days. HTML content (first 60000 chars):\n\n${html.substring(0, 60000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const aiResult = await openAIResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      console.log('No content returned from AI for daily news extraction');
      return [];
    }

    console.log('AI daily news response:', aiContent.substring(0, 500));

    // Parse and validate the AI response
    try {
      let jsonContent = aiContent.trim();
      
      // Clean the response to extract just the JSON
      jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON array boundaries
      const startIndex = jsonContent.indexOf('[');
      const endIndex = jsonContent.lastIndexOf(']');
      
      if (startIndex !== -1 && endIndex !== -1) {
        jsonContent = jsonContent.substring(startIndex, endIndex + 1);
      }
      
      const parsedContent = JSON.parse(jsonContent);
      
      if (Array.isArray(parsedContent)) {
        const validArticles = parsedContent
          .filter(item => 
            item.title && 
            item.content && 
            item.title.length > 10 && 
            item.content.length > 20 &&
            // Filter for recent security content
            (item.title.toLowerCase().includes('security') ||
             item.title.toLowerCase().includes('cyber') ||
             item.title.toLowerCase().includes('vulnerability') ||
             item.title.toLowerCase().includes('breach') ||
             item.title.toLowerCase().includes('hack') ||
             item.title.toLowerCase().includes('threat') ||
             item.title.toLowerCase().includes('malware') ||
             item.content.toLowerCase().includes('security') ||
             item.content.toLowerCase().includes('cyber'))
          )
          .map(item => ({
            title: item.title.trim(),
            content: item.content.trim(),
            url: item.url || targetUrl,
            contentType: 'security_news',
            extractedDate: new Date().toISOString(),
            extractionMethod: 'ai_daily_news_v6',
            strategy: 'daily_security_focus'
          }));
        
        console.log(`AI extracted ${validArticles.length} valid daily security articles`);
        return validArticles;
      }
    } catch (parseError) {
      console.error('Failed to parse AI JSON response for daily news:', parseError.message);
      console.log('Raw AI response:', aiContent);
    }

    return [];
  } catch (error) {
    console.error('AI daily news extraction error:', error.message);
    throw error;
  }
}

// Enhanced content extraction with improved patterns for daily news
async function enhancedContentExtraction(targetUrl: string, platform: any, platformId: string) {
  try {
    console.log('Starting enhanced content extraction for daily security news...');
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML content for daily news, length: ${html.length}`);
    
    // Extract content with focus on recent security news
    let posts = extractDailySecurityPatterns(html, targetUrl, platform, platformId);
    
    return posts;
  } catch (error) {
    console.error('Enhanced daily news extraction failed:', error);
    return [];
  }
}

// Pattern extraction focused on daily security news
function extractDailySecurityPatterns(html: string, baseUrl: string, platform: any, platformId: string) {
  const posts = [];
  
  try {
    // Security keywords for daily news filtering
    const securityKeywords = ['vulnerability', 'breach', 'security', 'cyber', 'hack', 'threat', 'malware', 'ransomware', 'phishing', 'exploit', 'zero-day', 'CVE', 'attack', 'incident'];
    const currentYear = new Date().getFullYear();
    
    // Enhanced patterns for recent security articles
    const dailyNewsPatterns = [
      // Look for recent article containers
      /<(?:article|div|section)[^>]*(?:class|id)="[^"]*(?:post|story|news|item|article|recent)[^"]*"[^>]*>([\s\S]*?)<\/(?:article|div|section)>/gi,
      // Look for headlines with current year or recent dates
      /<h[1-6][^>]*>([^<]*(?:2025|security|cyber|vulnerability|breach|threat)[^<]*)<\/h[1-6]>/gi,
      // Look for links with current year in URL
      /<a[^>]*href="[^"]*2025[^"]*"[^>]*>([^<]*(?:security|cyber|vulnerability|breach|threat)[^<]*)<\/a>/gi,
    ];
    
    let allMatches = [];
    
    for (const pattern of dailyNewsPatterns) {
      const matches = [...html.matchAll(pattern)];
      allMatches = allMatches.concat(matches);
      console.log(`Daily news pattern found ${matches.length} potential matches`);
    }
    
    console.log(`Total potential daily security articles found: ${allMatches.length}`);
    
    // Process matches for recent security content
    const processedTitles = new Set();
    
    for (let i = 0; i < Math.min(allMatches.length, 20); i++) {
      const match = allMatches[i];
      const content = match[1] || match[0];
      
      if (!content || content.length < 20) continue;
      
      // Extract title from the content
      const title = extractTitleFromContent(content);
      if (!title || title.length < 15 || processedTitles.has(title.toLowerCase())) continue;
      
      // Filter for security relevance and recency
      const isSecurityRelated = securityKeywords.some(keyword => 
        title.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
      );
      
      // Check for recent content indicators
      const isRecent = content.includes(currentYear.toString()) || 
                      content.includes('2025') || 
                      content.toLowerCase().includes('today') ||
                      content.toLowerCase().includes('latest') ||
                      content.toLowerCase().includes('new');
      
      if (!isSecurityRelated) continue;
      
      processedTitles.add(title.toLowerCase());
      
      // Extract meaningful content
      const articleContent = extractContentFromMatch(content) || 
        `Recent cybersecurity news from ${new URL(baseUrl).hostname}: ${title}. This article covers current security developments, threats, and industry insights relevant to cybersecurity professionals.`;
      
      // Extract URL with focus on recent articles
      const url = extractUrlFromContent(content, baseUrl) || baseUrl;
      
      posts.push({
        title: cleanText(title).substring(0, 300),
        content: cleanText(articleContent).substring(0, 1500),
        url: url,
        contentType: determineContentType(title, articleContent),
        extractedDate: new Date().toISOString(),
        extractionMethod: 'daily_patterns_v6',
        strategy: `daily_security_${platformId}`,
        isRecent: isRecent
      });
      
      console.log(`✓ Extracted daily security article: "${title.substring(0, 50)}..."`);
    }
    
  } catch (error) {
    console.error('Error in daily security pattern extraction:', error);
  }
  
  return posts;
}

// Helper functions
function extractTitleFromContent(content: string): string | null {
  // Remove HTML tags and clean up
  let title = content.replace(/<[^>]*>/g, '').trim();
  
  // Take the first meaningful sentence or phrase
  const sentences = title.split(/[.!?]/);
  if (sentences.length > 0 && sentences[0].length > 10) {
    return sentences[0].trim();
  }
  
  // Take the first 100 characters if no clear sentence
  return title.substring(0, 100).trim();
}

function extractContentFromMatch(content: string): string | null {
  // Look for paragraph tags or description-like content
  const paragraphMatch = content.match(/<p[^>]*>([^<]+)<\/p>/i);
  if (paragraphMatch && paragraphMatch[1].length > 20) {
    return paragraphMatch[1];
  }
  
  // Look for text after common description patterns
  const descPatterns = [
    /(?:description|summary|excerpt)["'][^>]*>([^<]+)</i,
    /<span[^>]*>([^<]{20,})<\/span>/i,
    /<div[^>]*>([^<]{20,})<\/div>/i,
  ];
  
  for (const pattern of descPatterns) {
    const match = content.match(pattern);
    if (match && match[1].length > 20) {
      return match[1];
    }
  }
  
  return null;
}

function extractUrlFromContent(content: string, baseUrl: string): string {
  const urlMatch = content.match(/href=["']([^"']+)["']/);
  if (urlMatch && urlMatch[1]) {
    const url = urlMatch[1];
    try {
      return url.startsWith('http') ? url : new URL(url, baseUrl).toString();
    } catch {
      return baseUrl;
    }
  }
  return baseUrl;
}

// Utility functions (keeping existing ones)
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#[0-9]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function determineContentType(title: string, content: string): string {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  
  if (titleLower.includes('cve-') || contentLower.includes('cve-')) {
    return 'vulnerability'
  }
  if (titleLower.includes('vulnerability') || contentLower.includes('vulnerability')) {
    return 'vulnerability'
  }
  if (titleLower.includes('advisory') || contentLower.includes('security advisory')) {
    return 'security_advisory'
  }
  if (titleLower.includes('breach') || contentLower.includes('data breach') ||
      titleLower.includes('hack') || contentLower.includes('hacked')) {
    return 'security_incident'
  }
  if (titleLower.includes('malware') || contentLower.includes('malware') ||
      titleLower.includes('ransomware') || contentLower.includes('ransomware')) {
    return 'malware_analysis'
  }
  if (titleLower.includes('threat') || contentLower.includes('threat intelligence')) {
    return 'threat_intelligence'
  }
  
  return 'security_news'
}
