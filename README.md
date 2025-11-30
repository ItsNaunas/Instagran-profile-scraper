# Instagram Scraper API

A production-ready Node.js Instagram scraper API using Puppeteer with IPRoyal Residential Rotating Proxies. This scraper works without requiring Instagram login credentials by leveraging stealth techniques and residential proxies.

## Features

- ✅ No Instagram login required
- ✅ Uses IPRoyal Residential Rotating Proxies
- ✅ Stealth mode with puppeteer-extra-plugin-stealth
- ✅ Automatic retry logic with exponential backoff
- ✅ Resource blocking for faster scraping (images, CSS, fonts, media)
- ✅ Multiple data extraction methods (window._sharedData, JSON-LD, HTML parsing)
- ✅ Robust follower count parsing (handles K, M, B suffixes)
- ✅ Production-ready error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Puppeteer** - Headless browser automation
- **puppeteer-extra** - Enhanced Puppeteer functionality
- **puppeteer-extra-plugin-stealth** - Stealth plugin to avoid detection
- **dotenv** - Environment variable management
- **axios** - HTTP client (available for future use)
- **cors** - Cross-origin resource sharing

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory with your proxy credentials:

   ```env
   # IPRoyal Residential Rotating Proxy Configuration
   PROXY_HOST=geo.iproyal.com
   PROXY_PORT=12321
   PROXY_USER=your_proxy_username
   PROXY_PASS=your_proxy_password

   # Server Configuration
   PORT=3000
   ```

   **Important:** Replace `your_proxy_username` and `your_proxy_password` with your actual IPRoyal proxy credentials.

## How to Run

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on port 3000 (or the port specified in your `.env` file).

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PROXY_HOST` | IPRoyal proxy hostname | Yes | - |
| `PROXY_PORT` | IPRoyal proxy port | Yes | - |
| `PROXY_USER` | IPRoyal proxy username | Yes | - |
| `PROXY_PASS` | IPRoyal proxy password | Yes | - |
| `PORT` | Server port | No | 3000 |

## How the Proxy Works

This scraper uses **IPRoyal Residential Rotating Proxies** to mask your IP address and appear as a legitimate residential user. Here's how it works:

1. **Proxy Configuration**: The proxy settings are loaded from your `.env` file
2. **Browser Launch**: Puppeteer is configured with the `--proxy-server` flag pointing to your IPRoyal proxy
3. **Authentication**: After creating a page, the scraper authenticates using `page.authenticate()` with your credentials
4. **Request Routing**: All HTTP requests from the browser go through the proxy, rotating through different residential IPs

### Proxy Authentication Flow

```javascript
// 1. Browser launched with proxy server
--proxy-server=http://geo.iproyal.com:12321

// 2. Page authenticated with credentials
await page.authenticate({
  username: PROXY_USER,
  password: PROXY_PASS
});
```

## API Endpoints

### GET /scrape/:username

Scrapes Instagram profile data for the specified username.

**URL Parameters:**
- `username` (string, required) - Instagram username (without @ symbol)

**Success Response (200 OK):**
```json
{
  "username": "alex_stroud_realtor_htx",
  "followers": "12540",
  "bio": "Real Estate Professional | Houston Area",
  "fullName": "Alex Stroud",
  "profilePic": "https://instagram.com/...",
  "isPrivate": false,
  "isVerified": true,
  "scrapedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

User not found (404):
```json
{
  "error": "User not found"
}
```

Server error (500):
```json
{
  "error": "Internal server error"
}
```

### GET /health

Health check endpoint to verify the server is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /

Returns API information and available endpoints.

## Example Usage

### Using cURL

```bash
curl http://localhost:3000/scrape/alex_stroud_realtor_htx
```

### Using JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/scrape/alex_stroud_realtor_htx');
const data = await response.json();
console.log(data);
```

### Using Axios

```javascript
const axios = require('axios');

axios.get('http://localhost:3000/scrape/alex_stroud_realtor_htx')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });
```

## Follower Count Parsing

The scraper intelligently parses follower counts in various formats:

- `"2.1K"` → `2100`
- `"3.4M"` → `3400000`
- `"12,540"` → `12540`
- `"1,204"` → `1204`
- `null` or invalid → `"unknown"`

The parser handles:
- K suffix (thousands)
- M suffix (millions)
- B suffix (billions)
- Comma separators
- Decimal points
- Invalid/null values

## Rate Limiting and Anti-Bot Measures

### Instagram Rate Limits

Instagram implements various anti-bot measures and rate limiting:

- **Request Frequency**: Instagram may temporarily block IPs that make too many requests in a short time
- **Account Detection**: Repeated scraping may trigger Instagram's bot detection systems
- **Temporary Blocks**: Instagram may show "Try Again Later" or block access temporarily

### Recommendations

1. **Use Residential Proxies**: IPRoyal Residential Rotating Proxies help avoid detection by using real residential IP addresses

2. **Rotate User Agents**: The scraper already includes random user agent rotation. You can customize the user agents in `src/scraper/instagramScraper.js`:
   ```javascript
   const USER_AGENTS = [
     'Your custom user agent 1',
     'Your custom user agent 2',
     // ... more user agents
   ];
   ```

3. **Implement Delays**: The scraper includes automatic retry delays (2-5 seconds). Consider adding delays between separate scraping requests:
   ```javascript
   const { randomDelay } = require('./src/utils/sleep');
   await randomDelay(3, 8); // Wait 3-8 seconds between requests
   ```

4. **Respect Rate Limits**: Don't scrape the same profile repeatedly in quick succession

5. **Monitor for Blocks**: Watch for error patterns that might indicate rate limiting

6. **Use Different Proxies**: Ensure your IPRoyal plan provides IP rotation to avoid using the same IP repeatedly

## Error Handling

The scraper includes comprehensive error handling:

- **Retry Logic**: Automatically retries up to 3 times with 2-5 second delays
- **User Not Found**: Specifically handles non-existent accounts
- **Proxy Errors**: Gracefully handles proxy connection issues
- **Timeout Protection**: 30-second timeout for page loads
- **Browser Cleanup**: Ensures browsers are closed even on errors

## Project Structure

```
ig-scraper-api/
├── src/
│   ├── scraper/
│   │   └── instagramScraper.js    # Main scraping logic
│   ├── utils/
│   │   ├── proxy.js                # Proxy configuration
│   │   ├── followersParser.js      # Follower count parser
│   │   └── sleep.js                # Delay utilities
│   ├── server.js                   # Express server setup
│   └── routes.js                   # API route handlers
├── .env                            # Environment variables (create this)
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Troubleshooting

### "Proxy configuration missing" Error

Make sure your `.env` file exists and contains all required proxy variables:
- `PROXY_HOST`
- `PROXY_PORT`
- `PROXY_USER`
- `PROXY_PASS`

### "User not found" Error

- Verify the username is correct (without @ symbol)
- Check if the account exists and is accessible
- The account might be private (private accounts cannot be scraped without login)

### Connection Timeout Errors

- Verify your proxy credentials are correct
- Check your internet connection
- Ensure IPRoyal proxy service is active
- Try increasing timeout values in `instagramScraper.js`

### Rate Limiting Issues

- Add longer delays between requests
- Use more diverse user agents
- Ensure IPRoyal is rotating IPs properly
- Reduce scraping frequency

## License

MIT

## Disclaimer

This scraper is for educational and legitimate business purposes only. Please:

- Respect Instagram's Terms of Service
- Don't abuse the API or scrape excessively
- Be aware of legal implications in your jurisdiction
- Use responsibly and ethically

## Support

For issues related to:
- **Proxy Configuration**: Contact IPRoyal support
- **Instagram Access**: Check Instagram's status and your account
- **Scraper Bugs**: Open an issue in the repository

