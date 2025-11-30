const express = require('express');
const router = express.Router();
const { scrapeInstagramProfile } = require('./scraper/instagramScraper');

/**
 * GET /scrape/:username
 * Scrapes Instagram profile data for the given username
 * 
 * @route GET /scrape/:username
 * @param {string} username - Instagram username to scrape
 * @returns {Object} JSON response with profile data or error
 */
router.get('/scrape/:username', async (req, res) => {
  const { username } = req.params;

  // Validate username parameter
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid username. Username is required.',
    });
  }

  // Clean username (remove leading @ if present, trim whitespace)
  const cleanUsername = username.replace(/^@/, '').trim();

  if (!cleanUsername) {
    return res.status(400).json({
      error: 'Invalid username. Username cannot be empty.',
    });
  }

  try {
    console.log(`[API] Scraping Instagram profile for: ${cleanUsername}`);
    
    // Scrape the profile
    const profileData = await scrapeInstagramProfile(cleanUsername);

    // Return success response with profile data
    return res.status(200).json(profileData);

  } catch (error) {
    console.error(`[API] Error scraping ${cleanUsername}:`, error.message);

    // Handle "User not found" error specifically
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;

