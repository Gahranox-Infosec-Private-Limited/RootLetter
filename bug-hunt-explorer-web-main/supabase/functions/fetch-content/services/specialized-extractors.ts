
// Specialized extractors for different types of security websites

export interface SecurityContent {
  title: string;
  content: string;
  url: string;
  extractedDate: string;
  contentType: string;
  metadata?: any;
}

// CVE.org extractor
export const extractCVEContent = async (baseUrl: string): Promise<SecurityContent[]> => {
  const content: SecurityContent[] = [];
  
  try {
    console.log('Extracting CVE content from CVE.org...');
    
    // Try the resources page
    const resourcesUrl = `${baseUrl}/ResourcesSupport/Resources`;
    const response = await fetch(resourcesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Look for recent CVE entries
      const cvePattern = /<a[^>]*href="([^"]*CVE-[0-9]{4}-[0-9]+[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      let match;
      
      while ((match = cvePattern.exec(html)) !== null && content.length < 20) {
        const cveUrl = match[1].startsWith('http') ? match[1] : `${baseUrl}${match[1]}`;
        const title = match[2].trim();
        
        if (title.includes('CVE-')) {
          content.push({
            title: title,
            content: `CVE Entry: ${title}. Visit the full CVE details for complete vulnerability information.`,
            url: cveUrl,
            extractedDate: new Date().toISOString(),
            contentType: 'cve'
          });
        }
      }
    }
    
    console.log(`Extracted ${content.length} CVE entries`);
    return content;
    
  } catch (error) {
    console.error('Error extracting CVE content:', error);
    return [];
  }
};

// NVD extractor
export const extractNVDContent = async (baseUrl: string): Promise<SecurityContent[]> => {
  const content: SecurityContent[] = [];
  
  try {
    console.log('Extracting NVD vulnerability content...');
    
    // Try the main vulnerabilities page
    const vulnUrl = `${baseUrl}/vuln/search`;
    const response = await fetch(vulnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Look for recent vulnerability entries
      const vulnPattern = /<a[^>]*href="([^"]*\/vuln\/detail\/CVE-[0-9]{4}-[0-9]+)"[^>]*>([^<]+)<\/a>/gi;
      let match;
      
      while ((match = vulnPattern.exec(html)) !== null && content.length < 20) {
        const vulnUrl = match[1].startsWith('http') ? match[1] : `${baseUrl}${match[1]}`;
        const title = match[2].trim();
        
        content.push({
          title: `NVD: ${title}`,
          content: `National Vulnerability Database entry for ${title}. Contains detailed vulnerability analysis and scoring.`,
          url: vulnUrl,
          extractedDate: new Date().toISOString(),
          contentType: 'vulnerability'
        });
      }
    }
    
    console.log(`Extracted ${content.length} NVD vulnerabilities`);
    return content;
    
  } catch (error) {
    console.error('Error extracting NVD content:', error);
    return [];
  }
};

// SAP Notes extractor
export const extractSAPNotes = async (baseUrl: string): Promise<SecurityContent[]> => {
  const content: SecurityContent[] = [];
  
  try {
    console.log('Extracting SAP security notes...');
    
    // Try the notes section
    const notesUrl = `${baseUrl}/notes`;
    const response = await fetch(notesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Look for SAP note numbers and titles
      const notePattern = /<a[^>]*href="([^"]*note[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      let match;
      
      while ((match = notePattern.exec(html)) !== null && content.length < 20) {
        const noteUrl = match[1].startsWith('http') ? match[1] : `${baseUrl}${match[1]}`;
        const title = match[2].trim();
        
        if (title.length > 10) {
          content.push({
            title: `SAP Note: ${title}`,
            content: `SAP Security Note containing important security updates and patches. ${title}`,
            url: noteUrl,
            extractedDate: new Date().toISOString(),
            contentType: 'security_note'
          });
        }
      }
    }
    
    console.log(`Extracted ${content.length} SAP notes`);
    return content;
    
  } catch (error) {
    console.error('Error extracting SAP notes:', error);
    return [];
  }
};

// Cisco Security Center extractor
export const extractCiscoSecurity = async (baseUrl: string): Promise<SecurityContent[]> => {
  const content: SecurityContent[] = [];
  
  try {
    console.log('Extracting Cisco security advisories...');
    
    // Try the security center
    const secUrl = `${baseUrl}/security/center/publicationListing.x`;
    const response = await fetch(secUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Look for security advisories
      const advisoryPattern = /<a[^>]*href="([^"]*advisory[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      let match;
      
      while ((match = advisoryPattern.exec(html)) !== null && content.length < 20) {
        const advisoryUrl = match[1].startsWith('http') ? match[1] : `${baseUrl}${match[1]}`;
        const title = match[2].trim();
        
        if (title.length > 10) {
          content.push({
            title: `Cisco Advisory: ${title}`,
            content: `Cisco Security Advisory providing details about security vulnerabilities and recommended actions. ${title}`,
            url: advisoryUrl,
            extractedDate: new Date().toISOString(),
            contentType: 'security_advisory'
          });
        }
      }
    }
    
    console.log(`Extracted ${content.length} Cisco advisories`);
    return content;
    
  } catch (error) {
    console.error('Error extracting Cisco security content:', error);
    return [];
  }
};

// Main function to detect and extract from specialized security sites
export const extractSpecializedSecurityContent = async (platformUrl: string): Promise<SecurityContent[]> => {
  const hostname = new URL(platformUrl).hostname.toLowerCase();
  
  if (hostname.includes('cve.org')) {
    return await extractCVEContent(platformUrl);
  } else if (hostname.includes('nvd.nist.gov')) {
    return await extractNVDContent(platformUrl);
  } else if (hostname.includes('sap.com')) {
    return await extractSAPNotes(platformUrl);
  } else if (hostname.includes('cisco.com')) {
    return await extractCiscoSecurity(platformUrl);
  }
  
  return [];
};
