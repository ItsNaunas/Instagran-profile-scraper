require('dotenv').config();

/**
 * Loads and validates proxy configuration from environment variables
 * @returns {Object} Proxy configuration object
 * @throws {Error} If required proxy settings are missing
 */
function getProxyConfig() {
  const host = process.env.PROXY_HOST;
  const port = process.env.PROXY_PORT;
  const user = process.env.PROXY_USER;
  const pass = process.env.PROXY_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      'Proxy configuration missing. Please set PROXY_HOST, PROXY_PORT, PROXY_USER, and PROXY_PASS in .env file'
    );
  }

  return {
    host,
    port: parseInt(port, 10),
    user,
    pass,
    // Proxy server string for Puppeteer --proxy-server flag
    server: `http://${host}:${port}`,
  };
}

module.exports = {
  getProxyConfig,
};

