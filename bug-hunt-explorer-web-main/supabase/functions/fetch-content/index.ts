
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { discoverBlogUrls } from './services/blog-discovery.ts'
import { extractMultipleBlogPosts, extractSingleBlogPost, extractSpecializedContent } from './services/content-extractor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to detect if this is a specialized security website
const isSpecializedSecuritySite = (url: string): boolean => {
  const hostname = new URL(url).hostname.toLowerCase();
  return (
    hostname.includes('cve.org') ||
    hostname.includes('nvd.nist.gov') ||
    hostname.includes('sap.com') ||
    hostname.includes('cisco.com')
  );
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { platformId, directUrl } = await req.json()
    
    const { data: platform, error: platformError } = await supabaseClient
      .from('platforms')
      .select('*')
      .eq('id', platformId)
      .single()

    if (platformError || !platform) {
      throw new Error('Platform not found')
    }

    let blogContent = [];
    let extractionMethod = '';
    let message = '';

    // Check if we have a direct URL to extract
    if (directUrl) {
      console.log(`Extracting single blog post from direct URL: ${directUrl}`);
      
      const singlePost = await extractSingleBlogPost(directUrl);
      
      if (singlePost) {
        blogContent = [singlePost];
        extractionMethod = 'direct_url_extraction_v1';
        message = `Successfully extracted blog post from direct URL`;
      } else {
        message = `Failed to extract content from the provided URL`;
      }
    } else {
      // Check if this is a specialized security website
      if (isSpecializedSecuritySite(platform.url)) {
        console.log(`Detected specialized security website: ${platform.url}`);
        
        blogContent = await extractSpecializedContent(platform.url);
        extractionMethod = 'specialized_security_extraction_v1';
        message = `Successfully extracted ${blogContent.length} security items from ${platform.name} using specialized extraction`;
      } else {
        // Original discovery-based extraction for regular blog sites
        console.log(`Extracting individual blog posts from: ${platform.url}`);

        const blogUrls = await discoverBlogUrls(platform.url);
        
        if (blogUrls.length === 0) {
          console.log('No blog URLs found for this platform');
          return new Response(
            JSON.stringify({ 
              success: true, 
              content: [],
              count: 0,
              message: `No blog posts found for ${platform.name}`,
              extractionMethod: 'individual_blog_post_extraction_v7'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }

        blogContent = await extractMultipleBlogPosts(blogUrls);
        extractionMethod = 'individual_blog_post_extraction_v7';
        message = `Successfully extracted ${blogContent.length} unique blog posts from ${platform.name}`;
      }
    }

    // Check for existing content before saving to avoid duplicates
    const { data: existingContent } = await supabaseClient
      .from('fetched_content')
      .select('url, title')
      .eq('platform_id', platformId);

    const existingUrls = new Set(existingContent?.map(item => item.url) || []);
    const existingTitles = new Set(existingContent?.map(item => item.title.toLowerCase()) || []);

    // Store each blog post separately, but only if it's not a duplicate
    const savedContent = [];
    
    for (const post of blogContent) {
      // Skip if URL or title already exists
      if (existingUrls.has(post.url) || existingTitles.has(post.title.toLowerCase())) {
        console.log(`⚠ Skipping duplicate: "${post.title}"`);
        continue;
      }

      const { data: saved, error: saveError } = await supabaseClient
        .from('fetched_content')
        .insert({
          platform_id: platformId,
          title: post.title,
          content: post.content,
          url: post.url,
          content_type: post.contentType,
          extracted_at: post.extractedDate,
          metadata: {
            extraction_method: extractionMethod
          }
        })
        .select()
        .single()

      if (!saveError && saved) {
        savedContent.push(saved)
        console.log(`✓ Saved new blog post: "${post.title}"`)
      } else {
        console.error(`✗ Failed to save: "${post.title}"`, saveError?.message)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: savedContent,
        count: savedContent.length,
        message: savedContent.length > 0 ? message : `No new content found - ${blogContent.length} posts were already in database`,
        extractionMethod: extractionMethod
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching content:', error)
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
