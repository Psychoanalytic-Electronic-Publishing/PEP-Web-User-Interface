const crypto = require("crypto");

function verifySignature(message, providedSignature, secretKey) {
  // Create new HMAC instance with same key
  const hmac = crypto.createHmac("sha256", secretKey);

  // Update with original message
  hmac.update(message);

  // Generate expected signature
  const expectedSignature = hmac.digest("hex");

  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (e) {
    return false;
  }
}

// Example usage:
const message = "94.194.109.96";
const secretKey = "bshkdx&*js:(0";
const providedSignature =
  "e99e3d1fa7048568929291c80f52cfdde77546ab2fa93dcb4b3e6db17f1f85d7";

const isValid = verifySignature(message, providedSignature, secretKey);
console.log("Signature is valid:", isValid);
function generateSignature(message, secretKey) {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("hex");
}

// Example usage of generateSignature:
const newMessage = "193.60.231.0";
const newSecretKey = "secret-1234";
const newSignature = generateSignature(newMessage, newSecretKey);
console.log("Generated signature:", newSignature);
