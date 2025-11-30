/**
 * Sleep utility function for delays and retries
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Random delay between min and max seconds (converted to milliseconds)
 * Used for retry logic to avoid rate limiting
 * @param {number} minSeconds - Minimum delay in seconds
 * @param {number} maxSeconds - Maximum delay in seconds
 * @returns {Promise<void>}
 */
function randomDelay(minSeconds = 2, maxSeconds = 5) {
  const minMs = minSeconds * 1000;
  const maxMs = maxSeconds * 1000;
  const delayMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(delayMs);
}

module.exports = {
  sleep,
  randomDelay,
};

