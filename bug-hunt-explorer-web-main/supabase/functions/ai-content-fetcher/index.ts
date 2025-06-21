
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced content fetcher with multiple strategies
const fetchContentWithStrategy = async (url: string, strategy: string = 'default') => {
  const strategies = {
    default: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    },
    reddit: {
      headers: {
        'User-Agent': 'MyApp/1.0 (by /u/username)',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    },
    medium: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentFetcher/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Referer': 'https://medium.com/',
      }
    },
    api: {
      headers: {
        'User-Agent': 'ContentFetcher/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }
  };

  const config = strategies[strategy] || strategies.default;
  
  try {
    const response = await fetch(url, {
      ...config,
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error(`Failed to fetch ${url} with strategy ${strategy}:`, error.message);
    throw error;
  }
};

// OpenAI function definitions
const functions = [
  {
    name: "fetch_website_content",
    description: "Fetch content from a website URL using appropriate strategy",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to fetch content from"
        },
        strategy: {
          type: "string",
          enum: ["default", "reddit", "medium", "api"],
          description: "The fetching strategy to use based on the website type"
        }
      },
      required: ["url", "strategy"]
    }
  },
  {
    name: "extract_blog_posts",
    description: "Extract individual blog posts from a website or archive page",
    parameters: {
      type: "object",
      properties: {
        baseUrl: {
          type: "string",
          description: "The base URL of the website"
        },
        archiveUrl: {
          type: "string",
          description: "The archive or listing page URL"
        }
      },
      required: ["baseUrl"]
    }
  },
  {
    name: "parse_content_structure",
    description: "Parse and extract structured content from HTML",
    parameters: {
      type: "object",
      properties: {
        html: {
          type: "string",
          description: "The HTML content to parse"
        },
        contentType: {
          type: "string",
          enum: ["blog_post", "article", "archive", "news"],
          description: "The type of content to extract"
        }
      },
      required: ["html", "contentType"]
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { platformId, directUrl, prompt } = await req.json()
    
    const { data: platform, error: platformError } = await supabaseClient
      .from('platforms')
      .select('*')
      .eq('id', platformId)
      .single()

    if (platformError || !platform) {
      throw new Error('Platform not found')
    }

    const targetUrl = directUrl || platform.url;
    const userPrompt = prompt || `Fetch and extract all blog posts and articles from ${targetUrl}. If this is an archive page, extract individual post URLs and fetch their content. Use the most appropriate strategy for this website.`;

    // Call OpenAI with function calling
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
            content: `You are a content extraction specialist. Your job is to fetch and extract blog posts and articles from websites. You have access to multiple fetching strategies and parsing functions. 

For different websites, use these strategies:
- default: Standard websites and blogs
- reddit: Reddit URLs (use JSON API endpoints)
- medium: Medium articles (handle their specific structure)
- api: API endpoints

Always try to extract individual blog posts rather than archive pages. If you encounter an archive page, extract individual post URLs and fetch them separately.`
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        functions: functions,
        function_call: 'auto',
        temperature: 0.1
      }),
    });

    const aiResult = await openAIResponse.json();
    let extractedContent = [];

    // Process function calls from OpenAI
    if (aiResult.choices[0].message.function_call) {
      const functionCall = aiResult.choices[0].message.function_call;
      const functionName = functionCall.name;
      const functionArgs = JSON.parse(functionCall.arguments);

      console.log(`AI requested function: ${functionName}`, functionArgs);

      switch (functionName) {
        case 'fetch_website_content':
          const content = await fetchContentWithStrategy(functionArgs.url, functionArgs.strategy);
          
          // Parse the content based on type
          if (typeof content === 'string') {
            // HTML content - extract posts
            const postData = await extractBlogPostsFromHTML(content, functionArgs.url);
            extractedContent = postData;
          } else {
            // JSON content (e.g., Reddit API)
            extractedContent = await processJSONContent(content, functionArgs.url);
          }
          break;

        case 'extract_blog_posts':
          const archiveContent = await fetchContentWithStrategy(functionArgs.archiveUrl || functionArgs.baseUrl, 'default');
          extractedContent = await extractBlogPostsFromHTML(archiveContent, functionArgs.baseUrl);
          break;

        default:
          console.log('Unknown function requested:', functionName);
      }
    }

    // Save extracted content to database
    const savedContent = [];
    for (const post of extractedContent) {
      const { data: saved, error: saveError } = await supabaseClient
        .from('fetched_content')
        .insert({
          platform_id: platformId,
          title: post.title,
          content: post.content,
          url: post.url,
          content_type: post.contentType || 'blog_post',
          extracted_at: post.extractedDate || new Date().toISOString(),
          metadata: {
            extraction_method: 'ai_function_calling_v1',
            ai_strategy: post.strategy || 'default',
            content_length: post.content?.length || 0,
            title_length: post.title?.length || 0,
            fetched_at: new Date().toISOString(),
            url_source: post.url,
            extraction_quality: 'high',
            direct_url: !!directUrl
          }
        })
        .select()
        .single()

      if (!saveError && saved) {
        savedContent.push(saved)
        console.log(`✓ Saved content: "${post.title}"`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: savedContent,
        count: savedContent.length,
        message: `Successfully extracted ${savedContent.length} items using AI-powered function calling`,
        extractionMethod: 'ai_function_calling_v1'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in AI content fetcher:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Helper function to extract blog posts from HTML
async function extractBlogPostsFromHTML(html: string, baseUrl: string) {
  const posts = [];
  
  // Basic HTML parsing logic (simplified)
  const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  
  const titleMatch = html.match(titleRegex);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
  
  // Extract content (simplified - in real implementation would be more sophisticated)
  const contentRegex = /<article[^>]*>([\s\S]*?)<\/article>|<main[^>]*>([\s\S]*?)<\/main>|<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i;
  const contentMatch = html.match(contentRegex);
  
  let content = '';
  if (contentMatch) {
    content = contentMatch[1] || contentMatch[2] || contentMatch[3] || '';
    content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // If this is a substantial post (not just an archive), add it
  if (content.length > 200 && !title.match(/^\d{4}\/\d{2}$/)) {
    posts.push({
      title: title.substring(0, 300),
      content: content.substring(0, 5000),
      url: baseUrl,
      contentType: 'blog_post',
      extractedDate: new Date().toISOString(),
      strategy: 'ai_enhanced'
    });
  }

  // Extract links to individual posts
  let match;
  while ((match = linkRegex.exec(html)) !== null && posts.length < 10) {
    const linkUrl = match[1];
    const linkText = match[2];
    
    // Check if this looks like a blog post URL
    if (linkUrl.includes('/blog/') || linkUrl.includes('/post/') || linkUrl.includes('/article/')) {
      const fullUrl = linkUrl.startsWith('http') ? linkUrl : new URL(linkUrl, baseUrl).href;
      
      // Fetch individual post (with delay to avoid rate limiting)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const postHtml = await fetchContentWithStrategy(fullUrl, 'default');
        const individualPost = await extractBlogPostsFromHTML(postHtml, fullUrl);
        if (individualPost.length > 0) {
          posts.push(...individualPost);
        }
      } catch (error) {
        console.log(`Failed to fetch individual post ${fullUrl}:`, error.message);
      }
    }
  }

  return posts;
}

// Helper function to process JSON content (e.g., from Reddit API)
async function processJSONContent(jsonData: any, sourceUrl: string) {
  const posts = [];
  
  // Handle Reddit JSON structure
  if (jsonData.data && jsonData.data.children) {
    for (const item of jsonData.data.children) {
      const post = item.data;
      if (post.selftext && post.selftext.length > 100) {
        posts.push({
          title: post.title,
          content: post.selftext,
          url: `https://reddit.com${post.permalink}`,
          contentType: 'reddit_post',
          extractedDate: new Date(post.created_utc * 1000).toISOString(),
          strategy: 'reddit_api'
        });
      }
    }
  }
  
  return posts;
}
