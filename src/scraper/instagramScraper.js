const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getProxyConfig } = require('../utils/proxy');
const { parseFollowers } = require('../utils/followersParser');
const { randomDelay } = require('../utils/sleep');

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

/**
 * Comprehensive rotating user agents array for better stealth and avoiding detection
 * Includes diverse browsers, operating systems, and versions to mimic real users
 */
const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  
  // Chrome on Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  
  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Firefox on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
  
  // Firefox on Linux
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  
  // Edge on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  
  // Opera on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
  
  // Chrome on Android (mobile-like but desktop mode)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

/**
 * Gets a random user agent from the rotating pool
 * Random selection helps avoid pattern detection by Instagram's anti-bot systems
 * 
 * @returns {string} Random user agent string from the pool
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Configures Puppeteer browser with proxy and stealth settings
 * @returns {Promise<Object>} Browser instance
 */
async function createBrowser() {
  const proxyConfig = getProxyConfig();
  const userAgent = getRandomUserAgent();

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${proxyConfig.server}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  return { browser, proxyConfig, userAgent };
}

/**
 * Sets up page with resource blocking and authentication
 * @param {Object} browser - Puppeteer browser instance
 * @param {Object} proxyConfig - Proxy configuration object
 * @param {string} userAgent - User agent string
 * @returns {Promise<Object>} Page instance
 */
async function createPage(browser, proxyConfig, userAgent) {
  const page = await browser.newPage();

  // Authenticate proxy
  await page.authenticate({
    username: proxyConfig.user,
    password: proxyConfig.pass,
  });

  // Set user agent
  await page.setUserAgent(userAgent);

  // Set viewport to mimic real browser
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  // Block unnecessary resources to speed up loading
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    if (
      ['image', 'stylesheet', 'font', 'media'].includes(resourceType)
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  return page;
}

/**
 * Extracts profile data from window._sharedData JSON
 * @param {Object} page - Puppeteer page instance
 * @param {string} username - Instagram username
 * @returns {Promise<Object|null>} Profile data or null
 */
async function extractFromSharedData(page, username) {
  try {
    const sharedData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="text/javascript"]');
      for (const script of scripts) {
        const content = script.textContent || '';
        if (content.includes('window._sharedData')) {
          const match = content.match(/window\._sharedData\s*=\s*({.+?});/);
          if (match) {
            try {
              return JSON.parse(match[1]);
            } catch (e) {
              return null;
            }
          }
        }
      }
      return null;
    });

    if (
      sharedData &&
      sharedData.entry_data &&
      sharedData.entry_data.ProfilePage &&
      sharedData.entry_data.ProfilePage[0] &&
      sharedData.entry_data.ProfilePage[0].graphql &&
      sharedData.entry_data.ProfilePage[0].graphql.user
    ) {
      const user = sharedData.entry_data.ProfilePage[0].graphql.user;
      return {
        fullName: user.full_name || '',
        bio: user.biography || '',
        profilePic: user.profile_pic_url_hd || user.profile_pic_url || '',
        isPrivate: user.is_private || false,
        isVerified: user.is_verified || false,
        followers: user.edge_followed_by?.count || 0,
      };
    }
  } catch (error) {
    console.error('Error extracting from _sharedData:', error.message);
  }
  return null;
}

/**
 * Extracts profile data from application/ld+json metadata
 * @param {Object} page - Puppeteer page instance
 * @returns {Promise<Object|null>} Profile data or null
 */
async function extractFromJsonLd(page) {
  try {
    const jsonLd = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data['@type'] === 'Person' || data['@type'] === 'ProfilePage') {
            return data;
          }
        } catch (e) {
          continue;
        }
      }
      return null;
    });

    if (jsonLd) {
      // Extract followers from description or other fields
      const description = jsonLd.description || '';
      const followerMatch = description.match(/([\d,]+(?:\.\d+)?[KMB]?)\s*(?:followers|Follower)/i);
      
      return {
        fullName: jsonLd.name || jsonLd.alternateName || '',
        bio: description || '',
        profilePic: jsonLd.image || '',
        isPrivate: false, // JSON-LD doesn't indicate privacy
        isVerified: description.includes('Verified') || false,
        followers: followerMatch ? followerMatch[1] : null,
      };
    }
  } catch (error) {
    console.error('Error extracting from JSON-LD:', error.message);
  }
  return null;
}

/**
 * Extracts profile data from rendered HTML as fallback
 * @param {Object} page - Puppeteer page instance
 * @param {string} username - Instagram username
 * @returns {Promise<Object|null>} Profile data or null
 */
async function extractFromHTML(page, username) {
  try {
    const htmlData = await page.evaluate((uname) => {
      const data = {
        fullName: '',
        bio: '',
        profilePic: '',
        isPrivate: false,
        isVerified: false,
        followers: null,
      };

      // Try to find profile picture
      const img = document.querySelector('img[alt*="profile picture"], img[alt*="Profile picture"]');
      if (img) {
        data.profilePic = img.src || '';
      }

      // Try to find full name
      const nameElement = document.querySelector('h2, h1, span[dir="auto"]');
      if (nameElement) {
        data.fullName = nameElement.textContent?.trim() || '';
      }

      // Try to find bio
      const bioElement = document.querySelector('span[dir="auto"]');
      if (bioElement && bioElement.textContent) {
        data.bio = bioElement.textContent.trim();
      }

      // Check for verified badge
      const verifiedElements = document.querySelectorAll('[aria-label*="Verified"], [title*="Verified"]');
      data.isVerified = verifiedElements.length > 0;

      // Try to find followers count
      const metaElements = document.querySelectorAll('meta[property="og:description"]');
      for (const meta of metaElements) {
        const content = meta.getAttribute('content') || '';
        const followerMatch = content.match(/([\d,]+(?:\.\d+)?[KMB]?)\s*(?:Followers|followers)/i);
        if (followerMatch) {
          data.followers = followerMatch[1];
          break;
        }
      }

      // Alternative: look for follower text in page
      const allText = document.body.innerText || '';
      const followerRegex = /([\d,]+(?:\.\d+)?[KMB]?)\s*(?:followers|Followers)/i;
      const match = allText.match(followerRegex);
      if (match && !data.followers) {
        data.followers = match[1];
      }

      // Check for private account indicator
      if (allText.includes('This Account is Private') || allText.includes('private account')) {
        data.isPrivate = true;
      }

      return data;
    }, username);

    return htmlData;
  } catch (error) {
    console.error('Error extracting from HTML:', error.message);
  }
  return null;
}

/**
 * Main scraper function with retry logic
 * Scrapes Instagram profile data for the given username
 * 
 * @param {string} username - Instagram username to scrape
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<Object>} Profile data in specified JSON format
 * @throws {Error} If user not found or scraping fails after all retries
 */
async function scrapeInstagramProfile(username, maxRetries = 3) {
  let lastError = null;
  let browser = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create browser with proxy configuration
      const { browser: browserInstance, proxyConfig, userAgent } = await createBrowser();
      browser = browserInstance;

      // Create and configure page
      const page = await createPage(browser, proxyConfig, userAgent);

      // Navigate to Instagram profile
      const url = `https://www.instagram.com/${username}/`;
      console.log(`[Attempt ${attempt}/${maxRetries}] Navigating to ${url}`);

      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Check if page loaded successfully
      if (!response || response.status() === 404) {
        await browser.close();
        throw new Error('User not found');
      }

      // Wait for page to be fully loaded - wait for JSON-LD or sharedData
      try {
        await page.waitForSelector('script[type="application/ld+json"]', {
          timeout: 10000,
        });
      } catch (e) {
        // If JSON-LD doesn't appear, wait a bit for page to render
        await page.waitForTimeout(2000);
      }

      // Check for "User not found" or "Sorry, this page isn't available"
      const pageTitle = await page.title();
      const pageContent = await page.content();

      if (
        pageTitle.includes("Page Not Found") ||
        pageContent.includes("Sorry, this page isn't available") ||
        pageContent.includes("The link you followed may be broken")
      ) {
        await browser.close();
        throw new Error('User not found');
      }

      // Extract data from multiple sources, prioritizing most reliable
      let profileData = null;

      // Try window._sharedData first (most reliable)
      profileData = await extractFromSharedData(page, username);
      
      // Fallback to JSON-LD
      if (!profileData || !profileData.followers) {
        const jsonLdData = await extractFromJsonLd(page);
        if (jsonLdData) {
          profileData = profileData || {};
          Object.assign(profileData, jsonLdData);
        }
      }

      // Fallback to HTML parsing
      if (!profileData || !profileData.followers) {
        const htmlData = await extractFromHTML(page, username);
        if (htmlData && htmlData.followers) {
          profileData = profileData || {};
          profileData.followers = htmlData.followers;
          if (!profileData.fullName) profileData.fullName = htmlData.fullName;
          if (!profileData.bio) profileData.bio = htmlData.bio;
          if (!profileData.profilePic) profileData.profilePic = htmlData.profilePic;
          if (htmlData.isVerified) profileData.isVerified = htmlData.isVerified;
          if (htmlData.isPrivate) profileData.isPrivate = htmlData.isPrivate;
        }
      }

      // Close browser
      await browser.close();
      browser = null;

      // If we still don't have data, user might not exist
      if (!profileData) {
        throw new Error('User not found');
      }

      // Parse followers count
      let followers = profileData.followers;
      if (typeof followers === 'string') {
        followers = parseFollowers(followers);
      } else if (typeof followers === 'number') {
        followers = followers.toString();
      } else {
        followers = 'unknown';
      }

      // Build final response in exact format specified
      const result = {
        username: username,
        followers: followers.toString(),
        bio: profileData.bio || '',
        fullName: profileData.fullName || '',
        profilePic: profileData.profilePic || '',
        isPrivate: profileData.isPrivate || false,
        isVerified: profileData.isVerified || false,
        scrapedAt: new Date().toISOString(),
      };

      console.log(`[Success] Scraped profile for ${username}`);
      return result;

    } catch (error) {
      lastError = error;

      // Clean up browser on error
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError.message);
        }
        browser = null;
      }

      // If it's a "User not found" error, don't retry
      if (error.message === 'User not found') {
        throw error;
      }

      // Log error and retry if attempts remaining
      console.error(`[Attempt ${attempt}/${maxRetries}] Error:`, error.message);

      if (attempt < maxRetries) {
        console.log(`Retrying in 2-5 seconds...`);
        await randomDelay(2, 5);
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error('Scraping failed after all retries');
}

module.exports = {
  scrapeInstagramProfile,
};

