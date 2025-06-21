
import { extractTitle, extractMainContent, extractDate } from '../utils/html-parser.ts';
import { extractSpecializedSecurityContent, SecurityContent } from './specialized-extractors.ts';

export interface BlogPost {
  title: string;
  content: string;
  url: string;
  extractedDate: string;
  contentType: string;
}

export const extractBlogPost = async (postUrl: string): Promise<BlogPost | null> => {
  try {
    console.log(`Extracting content from: ${postUrl}`);
    
    // Enhanced headers to avoid bot detection
    const response = await fetch(postUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'Referer': new URL(postUrl).origin
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      console.log(`Failed to fetch ${postUrl}: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    
    const title = extractTitle(html);
    const content = extractMainContent(html);
    const extractedDate = extractDate(html, postUrl);

    // More lenient validation for security content
    const hasMinimumContent = content.length > 200; // Much more lenient
    const hasValidTitle = title.length > 5 && title.length < 500; // More flexible
    
    // Determine content type based on URL
    let contentType = 'general';
    if (postUrl.includes('/blog/')) contentType = 'blog_post';
    else if (postUrl.includes('/advisory/') || postUrl.includes('/advisories/')) contentType = 'security_advisory';
    else if (postUrl.includes('/cve/')) contentType = 'cve';
    else if (postUrl.includes('/vuln/')) contentType = 'vulnerability';
    else if (postUrl.includes('/notes/')) contentType = 'security_note';
    else if (postUrl.includes('/research/')) contentType = 'research';
    else if (postUrl.includes('/publications/')) contentType = 'publication';
    else if (postUrl.includes('/bulletins/')) contentType = 'bulletin';

    // Check for content indicators - more flexible for security content
    const hasContentIndicators = 
      content.includes('vulnerability') ||
      content.includes('security') ||
      content.includes('advisory') ||
      content.includes('CVE-') ||
      content.includes('published') ||
      content.includes('updated') ||
      content.includes('released') ||
      content.includes('affected') ||
      content.includes('description') ||
      content.includes('solution') ||
      content.includes('workaround') ||
      content.includes('mitigation') ||
      html.includes('<article') ||
      html.includes('class="post') ||
      html.includes('class="content') ||
      html.includes('id="content') ||
      postUrl.includes('/blog/') ||
      postUrl.includes('/advisory/') ||
      postUrl.includes('/notes/') ||
      postUrl.includes('/cve/');

    // More lenient date validation - allow content from last 2 months
    const dateObj = new Date(extractedDate);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const hasRecentDate = dateObj > twoMonthsAgo;

    console.log(`Content validation for "${title}":`, {
      contentLength: content.length,
      titleLength: title.length,
      hasMinimumContent,
      hasValidTitle,
      hasContentIndicators,
      hasRecentDate,
      contentType,
      extractedDate,
      url: postUrl
    });

    // Very lenient validation - accept most content that looks legitimate
    if (
      hasMinimumContent && 
      hasValidTitle && 
      hasContentIndicators
    ) {
      console.log(`✓ Successfully validated content: "${title}" (${content.length} chars, type: ${contentType})`);
      return {
        title: title.substring(0, 500),
        content: content.substring(0, 20000), // Increased content limit
        url: postUrl,
        extractedDate: extractedDate,
        contentType: contentType
      };
    }

    console.log(`⚠ Content validation failed for: "${title}" - Not valid content`);
    return null;

  } catch (error) {
    console.error(`Error extracting ${postUrl}:`, error.message);
    return null;
  }
};

export const extractMultipleBlogPosts = async (urls: string[]): Promise<BlogPost[]> => {
  const blogPosts: BlogPost[] = [];
  
  console.log(`Starting extraction of ${urls.length} URLs`);
  
  // Process more URLs for better coverage
  for (let i = 0; i < Math.min(urls.length, 40); i++) { // Increased from 25 to 40
    const postUrl = urls[i];
    
    console.log(`Processing URL ${i + 1}/${Math.min(urls.length, 40)}: ${postUrl}`);
    
    // Add delay between requests to avoid rate limiting
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Slightly reduced delay
    }
    
    const post = await extractBlogPost(postUrl);
    
    if (post) {
      // Less strict duplicate detection - only check exact URL matches
      const isDuplicate = blogPosts.some(existing => existing.url === post.url);

      if (!isDuplicate) {
        blogPosts.push(post);
        console.log(`✓ Successfully extracted: "${post.title}" (${post.content.length} chars, type: ${post.contentType})`);
      } else {
        console.log(`⚠ Duplicate URL skipped: "${post.title}"`);
      }
    }
    
    // Continue until we have enough quality posts or processed all URLs
    if (blogPosts.length >= 30) { // Increased limit
      console.log(`Reached maximum limit of 30 posts, stopping extraction`);
      break;
    }
  }

  console.log(`Extraction complete. Successfully extracted ${blogPosts.length} unique content items`);
  return blogPosts;
};

// New function to handle specialized security content extraction
export const extractSpecializedContent = async (platformUrl: string): Promise<BlogPost[]> => {
  console.log(`Attempting specialized extraction for: ${platformUrl}`);
  
  const specializedContent = await extractSpecializedSecurityContent(platformUrl);
  
  // Convert SecurityContent to BlogPost format
  const blogPosts: BlogPost[] = specializedContent.map(item => ({
    title: item.title,
    content: item.content,
    url: item.url,
    extractedDate: item.extractedDate,
    contentType: item.contentType
  }));
  
  console.log(`Specialized extraction completed. Found ${blogPosts.length} items`);
  return blogPosts;
};

export const extractSingleBlogPost = async (url: string): Promise<BlogPost | null> => {
  console.log(`Extracting single content item from: ${url}`);
  return await extractBlogPost(url);
};
