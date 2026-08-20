import axios from 'axios';

/**
 * Real-Time Async Link Validator using HTTP HEAD/GET request
 */
export async function validateJobLink(url, timeoutMs = 3000) {
  if (!url || url === '#' || !url.startsWith('http')) {
    return { isValid: false, status: 0, finalUrl: url };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Try HEAD request first for fast verification
    let response;
    try {
      response = await axios.head(url, {
        signal: controller.signal,
        timeout: timeoutMs,
        maxRedirects: 3,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        validateStatus: (status) => status < 500
      });
    } catch (headErr) {
      // Fallback to GET if HEAD method is disallowed (405)
      response = await axios.get(url, {
        signal: controller.signal,
        timeout: timeoutMs,
        maxRedirects: 3,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        validateStatus: (status) => status < 500
      });
    }

    clearTimeout(timer);

    const isOk = response.status >= 200 && response.status < 400;
    const finalUrl = response.request?.res?.responseUrl || response.config?.url || url;
    const lowerFinal = finalUrl.toLowerCase();

    // Check if redirected to generic "expired", "404", "unavailable", or "closed" error page
    const isExpiredRedirect = 
      lowerFinal.includes('expired') || 
      lowerFinal.includes('404') || 
      lowerFinal.includes('unavailable') || 
      lowerFinal.includes('job-closed') || 
      lowerFinal.includes('removed');

    const isValid = isOk && !isExpiredRedirect;

    return {
      isValid,
      status: response.status,
      finalUrl
    };

  } catch (error) {
    return {
      isValid: false,
      status: error.response?.status || 0,
      finalUrl: url
    };
  }
}

/**
 * Batch Link Verification with Concurrency Control
 */
export async function batchValidateLinks(items = [], concurrency = 5) {
  if (!items.length) return [];

  const verifiedItems = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    
    const chunkPromises = chunk.map(async (item) => {
      const check = await validateJobLink(item.url);
      return {
        ...item,
        linkVerified: check.isValid,
        httpStatus: check.status || 200,
        canonicalUrl: check.finalUrl || item.url
      };
    });

    const validatedChunk = await Promise.all(chunkPromises);
    verifiedItems.push(...validatedChunk);
  }

  return verifiedItems;
}
