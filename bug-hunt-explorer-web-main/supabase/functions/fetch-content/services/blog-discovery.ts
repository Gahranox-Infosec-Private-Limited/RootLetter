
const BLOG_LISTING_PATHS = [
  '/blog',
  '/news',
  '/articles', 
  '/insights',
  '/resources/blog',
  '/resource-center/blog',
  '/press',
  '/updates',
  '/security-blog',
  '/threat-research',
  '/research',
  '/advisories',
  '/security/center',
  '/notes',
  '/publications',
  '/vulnerabilities',
  '/bulletins',
  '/alerts'
];

// Enhanced patterns for individual blog posts and security content
const INDIVIDUAL_POST_PATTERNS = [
  // Generic blog post patterns with dates
  /href=["']([^"']*\/blog\/[^"']*20[2-9][0-9][^"']*\/?)["']/gi,
  /href=["']([^"']*\/blog\/[a-z0-9-]{8,}\/?)["']/gi,
  
  // Security advisory patterns
  /href=["']([^"']*\/advisory\/[^"']+)["']/gi,
  /href=["']([^"']*\/advisories\/[^"']+)["']/gi,
  /href=["']([^"']*\/security\/[^"']*20[2-9][0-9][^"']+)["']/gi,
  
  // CVE and vulnerability patterns
  /href=["']([^"']*\/cve\/[^"']+)["']/gi,
  /href=["']([^"']*\/vuln\/[^"']+)["']/gi,
  /href=["']([^"']*\/nvd\/[^"']+)["']/gi,
  
  // Note and bulletin patterns
  /href=["']([^"']*\/notes?\/[^"']+)["']/gi,
  /href=["']([^"']*\/bulletin[s]?\/[^"']+)["']/gi,
  
  // Research and publication patterns
  /href=["']([^"']*\/research\/[^"']*[a-z0-9-]{8,}[^"']+)["']/gi,
  /href=["']([^"']*\/publications?\/[^"']+)["']/gi,
  
  // Article patterns with specific structure
  /href=["']([^"']*\/articles?\/[^"']*20[2-9][0-9][^"']+)["']/gi,
  /href=["']([^"']*\/post[s]?\/[^"']*20[2-9][0-9][^"']+)["']/gi,
];

export const findBlogPostUrls = async (listingUrl: string): Promise<string[]> => {
  try {
    console.log(`Scanning content listing: ${listingUrl}`);
    
    const response = await fetch(listingUrl, {
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
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      console.log(`Failed to fetch ${listingUrl}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const urls = new Set<string>();
    const baseUrl = new URL(listingUrl).origin;

    // Use multiple patterns to find content URLs
    for (const pattern of INDIVIDUAL_POST_PATTERNS) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let url = match[1];
        
        // Clean up the URL
        url = url.replace(/\/$/, '');
        
        // Skip unwanted URLs - but be more lenient
        if (
          url.includes('#') || 
          url.includes('mailto:') || 
          url.includes('javascript:') || 
          url.includes('search') ||
          url.includes('feed') || 
          url.includes('.pdf') || 
          url.includes('.doc') ||
          url.includes('.jpg') || 
          url.includes('.png') || 
          url.includes('.gif') ||
          url === listingUrl || 
          url === baseUrl ||
          url.endsWith('.com') ||
          url.endsWith('.com/')
        ) {
          continue;
        }

        // Convert relative URLs to absolute
        if (url.startsWith('/')) {
          url = baseUrl + url;
        } else if (!url.startsWith('http')) {
          continue;
        }

        // Only include URLs from the same domain
        try {
          const urlDomain = new URL(url).hostname;
          const baseDomain = new URL(listingUrl).hostname;
          if (urlDomain === baseDomain) {
            urls.add(url);
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Enhanced content link detection with more flexible patterns
    const contentLinkPatterns = [
      // Look for links with specific content structure
      /<a[^>]+href=["']([^"']+)["'][^>]*>/gi,
    ];

    for (const pattern of contentLinkPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let url = match[1];
        
        if (url.startsWith('/')) {
          url = baseUrl + url;
        }
        
        // More flexible filtering for security content
        if (
          url.startsWith('http') && 
          (url.includes('/blog/') ||
           url.includes('/advisory/') ||
           url.includes('/advisories/') ||
           url.includes('/security/') ||
           url.includes('/notes/') ||
           url.includes('/cve/') ||
           url.includes('/vuln/') ||
           url.includes('/research/') ||
           url.includes('/publications/') ||
           url.includes('/bulletins/') ||
           url.includes('/articles/')) &&
          !url.includes('#') && 
          !url.includes('search') &&
          !url.includes('feed') &&
          url !== baseUrl
        ) {
          try {
            const urlDomain = new URL(url).hostname;
            const baseDomain = new URL(listingUrl).hostname;
            if (urlDomain === baseDomain) {
              urls.add(url);
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    const uniqueUrls = Array.from(urls).slice(0, 50); // Increased limit
    console.log(`Found ${uniqueUrls.length} potential content URLs from ${listingUrl}`);
    
    // Log first few URLs for debugging
    if (uniqueUrls.length > 0) {
      console.log('Sample URLs found:', uniqueUrls.slice(0, 5));
    }
    
    return uniqueUrls;
    
  } catch (error) {
    console.error(`Error scanning ${listingUrl}:`, error.message);
    return [];
  }
};

export const discoverBlogUrls = async (platformUrl: string): Promise<string[]> => {
  const baseUrl = new URL(platformUrl).origin;
  const contentListingUrls = BLOG_LISTING_PATHS.map(path => `${baseUrl}${path}`);
  
  // Also try the main platform URL and common security paths
  contentListingUrls.push(platformUrl);
  contentListingUrls.push(`${baseUrl}/security`);
  contentListingUrls.push(`${baseUrl}/publications`);
  
  let allContentUrls: string[] = [];

  // Find content URLs from listing pages
  for (const listingUrl of contentListingUrls) {
    const urls = await findBlogPostUrls(listingUrl);
    allContentUrls = [...allContentUrls, ...urls];
    
    // Small delay to avoid being rate limited
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Stop when we have enough URLs from proper content listings
    if (allContentUrls.length > 30) {
      break;
    }
  }

  // If still no URLs found, try RSS/XML feeds and sitemaps
  if (allContentUrls.length === 0) {
    console.log('No content URLs found from listing pages, trying feeds and sitemaps...');
    
    const feedUrls = [
      `${baseUrl}/feed/`,
      `${baseUrl}/rss/`,
      `${baseUrl}/blog/feed/`,
      `${baseUrl}/blog/rss/`,
      `${baseUrl}/feed.xml`,
      `${baseUrl}/rss.xml`,
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
    ];
    
    for (const feedUrl of feedUrls) {
      try {
        const feedResponse = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
          }
        });
        
        if (feedResponse.ok) {
          const feedText = await feedResponse.text();
          const urlMatches = feedText.match(/<link[^>]*>([^<]+)<\/link>|<guid[^>]*>([^<]+)<\/guid>|<loc>([^<]+)<\/loc>/g);
          
          if (urlMatches) {
            const feedUrls = urlMatches
              .map(match => {
                const linkMatch = match.match(/<link[^>]*>([^<]+)<\/link>/);
                const guidMatch = match.match(/<guid[^>]*>([^<]+)<\/guid>/);
                const locMatch = match.match(/<loc>([^<]+)<\/loc>/);
                return linkMatch ? linkMatch[1] : (guidMatch ? guidMatch[1] : (locMatch ? locMatch[1] : null));
              })
              .filter(url => url && url.startsWith('http'))
              .slice(0, 20);
            
            allContentUrls = [...allContentUrls, ...feedUrls];
            console.log(`Found ${feedUrls.length} URLs from feed: ${feedUrl}`);
            break;
          }
        }
      } catch (e) {
        console.log(`Feed not accessible: ${feedUrl}`);
      }
    }
  }

  // Remove duplicates and filter out unwanted URLs
  const finalUrls = Array.from(new Set(allContentUrls)).filter(url => {
    return (
      url !== baseUrl &&
      url !== `${baseUrl}/` &&
      !url.endsWith('/blog') &&
      !url.endsWith('/news') &&
      !url.endsWith('/security') &&
      !url.includes('/page/') &&
      !url.includes('/category/') &&
      !url.includes('/tag/')
    );
  });

  console.log(`Final URL list (${finalUrls.length} unique content URLs):`, finalUrls.slice(0, 10));
  return finalUrls;
};
