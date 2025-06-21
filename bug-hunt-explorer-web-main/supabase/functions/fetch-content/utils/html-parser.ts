
export const extractTextFromHTML = (html: string): string => {
  // Remove script and style tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  html = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<');
  html = html.replace(/&gt;/g, '>');
  html = html.replace(/&quot;/g, '"');
  html = html.replace(/&#39;/g, "'");
  html = html.replace(/&nbsp;/g, ' ');
  
  // Clean up whitespace
  html = html.replace(/\s+/g, ' ').trim();
  
  return html;
};

export const extractTitle = (html: string): string => {
  // First try Open Graph title
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  if (ogTitleMatch && ogTitleMatch[1]) {
    return extractTextFromHTML(ogTitleMatch[1]).trim();
  }
  
  // Try Twitter title
  const twitterTitleMatch = html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/i);
  if (twitterTitleMatch && twitterTitleMatch[1]) {
    return extractTextFromHTML(twitterTitleMatch[1]).trim();
  }
  
  // Try title tag
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    let title = extractTextFromHTML(titleMatch[1]);
    // Clean title by removing site name
    title = title.split(' | ')[0].split(' - ')[0].split(' – ')[0];
    return title.trim();
  }
  
  // Fallback to h1 tags
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1Match) {
    return extractTextFromHTML(h1Match[1]).trim();
  }
  
  return 'Untitled';
};

export const extractMainContent = (html: string): string => {
  // Look for common content containers
  const contentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*entry[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class="[^"]*blog[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of contentPatterns) {
    const match = html.match(pattern);
    if (match) {
      let content = match[1];
      
      // Remove unwanted elements from content
      content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
      content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
      content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
      content = content.replace(/<div[^>]*class="[^"]*social[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
      content = content.replace(/<div[^>]*class="[^"]*share[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
      content = content.replace(/<div[^>]*class="[^"]*comment[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
      
      const textContent = extractTextFromHTML(content);
      if (textContent.length > 200) {
        return textContent.substring(0, 10000);
      }
    }
  }

  // Try to extract paragraphs directly
  const paragraphs = html.match(/<p[^>]*>([^<]+)<\/p>/gi);
  if (paragraphs && paragraphs.length > 3) {
    const content = paragraphs.map(p => extractTextFromHTML(p)).join(' ');
    if (content.length > 200) {
      return content.substring(0, 10000);
    }
  }

  // Last resort: look for the largest text block in any div
  const divs = html.match(/<div[^>]*>([\s\S]*?)<\/div>/gi);
  if (divs) {
    let bestDiv = '';
    let bestLength = 0;
    
    for (const div of divs) {
      const text = extractTextFromHTML(div);
      if (text.length > bestLength && text.length > 200) {
        bestDiv = text;
        bestLength = text.length;
      }
    }
    
    if (bestDiv) {
      return bestDiv.substring(0, 10000);
    }
  }

  return '';
};

export const extractDate = (html: string, postUrl: string): string => {
  // Look for common date patterns
  const datePatterns = [
    /<meta[^>]*property="article:published_time"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="publish-date"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="date"[^>]*content="([^"]*)"[^>]*>/i,
    /<time[^>]*datetime="([^"]*)"[^>]*>/i,
    /<span[^>]*class="[^"]*date[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*class="[^"]*date[^"]*"[^>]*>([^<]*)<\/div>/i,
  ];

  for (const pattern of datePatterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime()) && date.getFullYear() >= 2020) {
          return date.toISOString();
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }

  // Look for date in URL
  const urlDatePattern = /\/(20\d{2})[\/\-_]?(\d{2})[\/\-_]?(\d{2})\//;
  if (urlDatePattern.test(postUrl)) {
    const matches = postUrl.match(urlDatePattern);
    if (matches) {
      try {
        const date = new Date(`${matches[1]}-${matches[2]}-${matches[3]}`);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (e) {
        // Fall back to current date
      }
    }
  }

  // Fall back to current date
  return new Date().toISOString();
};
