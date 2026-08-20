/**
 * URL Sanitization & Canonical Resolver Algorithm
 */
export function resolveCanonicalUrl(rawUrl, domain = 'books', baseUrl = 'https://books.toscrape.com') {
  if (!rawUrl || typeof rawUrl !== 'string') return '#';

  try {
    // 1. Resolve relative paths against target base URL
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    let resolved = new URL(rawUrl, cleanBase);

    // 2. Domain-specific canonicalization rules
    if (domain === 'linkedin_jobs') {
      const jobIdMatch = resolved.pathname.match(/\d{7,12}/) || resolved.search.match(/\d{7,12}/);
      if (jobIdMatch) {
        return `https://www.linkedin.com/jobs/view/${jobIdMatch[0]}`;
      }
      return 'https://www.linkedin.com/jobs';
    }

    if (domain === 'books') {
      let path = resolved.pathname;
      if (path.includes('catalogue/')) {
        path = path.substring(path.indexOf('catalogue/'));
      } else if (!path.startsWith('catalogue/')) {
        path = `catalogue/${path.replace(/^\//, '')}`;
      }
      return `https://books.toscrape.com/${path}`;
    }

    if (domain === 'flights') {
      return 'https://www.google.com/travel/flights';
    }

    // 3. Strip tracking & legacy archive query params for generic/custom URLs
    const cleanParams = new URLSearchParams();
    const trackingKeys = ['trk', 'refId', 'trackingId', 'utm_source', 'utm_medium', 'utm_campaign', 'archive_id', 'session_id', 'historic_token'];
    
    resolved.searchParams.forEach((value, key) => {
      if (!trackingKeys.includes(key.toLowerCase())) {
        cleanParams.append(key, value);
      }
    });

    resolved.search = cleanParams.toString();
    return resolved.toString();

  } catch (err) {
    console.warn(`[URL Resolver Warning] Could not parse URL "${rawUrl}": ${err.message}`);
    return rawUrl;
  }
}

/**
 * Freshness & Date Validation Engine
 */
export function validateFreshness(postedDateStr, maxDaysOld = 30) {
  if (!postedDateStr) {
    return {
      isFresh: true,
      isArchived: false,
      daysOld: 1,
      formattedDate: 'Recent'
    };
  }

  const str = String(postedDateStr).toLowerCase().trim();

  // Regex parsing for relative dates (e.g. "2 days ago", "17 years ago", "3 weeks ago", "4 hours ago")
  let daysOld = 1;

  if (str.includes('hour') || str.includes('min') || str.includes('today') || str.includes('just now')) {
    daysOld = 0;
  } else if (str.includes('day')) {
    const match = str.match(/(\d+)\s*day/);
    daysOld = match ? parseInt(match[1]) : 1;
  } else if (str.includes('week')) {
    const match = str.match(/(\d+)\s*week/);
    daysOld = match ? parseInt(match[1]) * 7 : 7;
  } else if (str.includes('month')) {
    const match = str.match(/(\d+)\s*month/);
    daysOld = match ? parseInt(match[1]) * 30 : 30;
  } else if (str.includes('year')) {
    const match = str.match(/(\d+)\s*year/);
    daysOld = match ? parseInt(match[1]) * 365 : 365;
  } else {
    // Attempt standard Date parsing
    const parsedDate = new Date(postedDateStr);
    if (!isNaN(parsedDate.getTime())) {
      const diffMs = Date.now() - parsedDate.getTime();
      daysOld = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  const isArchived = daysOld > maxDaysOld;
  const isFresh = !isArchived;

  let formattedDate = 'Recent';
  if (daysOld === 0) formattedDate = 'Today';
  else if (daysOld === 1) formattedDate = '1 day ago';
  else if (daysOld < 30) formattedDate = `${daysOld} days ago`;
  else if (daysOld < 365) formattedDate = `${Math.floor(daysOld / 30)} month(s) ago`;
  else formattedDate = `${Math.floor(daysOld / 365)} year(s) ago (${new Date().getFullYear() - Math.floor(daysOld / 365)})`;

  return {
    isFresh,
    isArchived,
    daysOld,
    formattedDate
  };
}
