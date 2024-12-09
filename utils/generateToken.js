const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token.
 * @param {Object} payload - The data to encode in the token.
 * @param {string} [expiresIn="30d"] - The token expiration time.
 * @returns {string} - The generated JWT token.
 */
const generateToken = (payload, expiresIn = "30d") => {
  try {
    // Ensure the JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not defined in the environment variables."
      );
    }

    // Generate and return the token
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  } catch (err) {
    console.error("Error generating token:", err);
    throw err;
  }
};

module.exports = generateToken;
