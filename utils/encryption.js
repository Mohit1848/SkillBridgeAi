const crypto = require("crypto");

const NONCE_LENGTH = 16;
const DEFAULT_SECRET = "dev-only-tee-secret-change-me";

function getSharedSecret() {
  return Buffer.from(process.env.TEE_SHARED_SECRET || DEFAULT_SECRET, "utf8");
}

function buildKeystream(secretBuffer, nonceBuffer, length) {
  const blocks = [];
  let generated = 0;
  let counter = 0;

  while (generated < length) {
    const counterBuffer = Buffer.allocUnsafe(4);
    counterBuffer.writeUInt32BE(counter, 0);
    const block = crypto
      .createHash("sha256")
      .update(secretBuffer)
      .update(nonceBuffer)
      .update(counterBuffer)
      .digest();

    blocks.push(block);
    generated += block.length;
    counter += 1;
  }

  return Buffer.concat(blocks).subarray(0, length);
}

function xorBuffers(left, right) {
  const output = Buffer.allocUnsafe(left.length);

  for (let index = 0; index < left.length; index += 1) {
    output[index] = left[index] ^ right[index];
  }

  return output;
}

function encryptPayload(plainText) {
  const payloadBuffer = Buffer.from(String(plainText), "utf8");
  const secret = getSharedSecret();
  const nonce = crypto.randomBytes(NONCE_LENGTH);
  const keystream = buildKeystream(secret, nonce, payloadBuffer.length);
  const cipherBuffer = xorBuffers(payloadBuffer, keystream);
  const mac = crypto
    .createHmac("sha256", secret)
    .update(nonce)
    .update(cipherBuffer)
    .digest("hex");

  return {
    version: 1,
    algorithm: "xor-sha256-hmac-demo",
    nonce: nonce.toString("base64"),
    ciphertext: cipherBuffer.toString("base64"),
    mac
  };
}

function decryptPayload(envelope) {
  const secret = getSharedSecret();
  const parsedEnvelope = typeof envelope === "string" ? JSON.parse(envelope) : envelope;
  const nonce = Buffer.from(parsedEnvelope.nonce, "base64");
  const cipherBuffer = Buffer.from(parsedEnvelope.ciphertext, "base64");
  const expectedMac = crypto
    .createHmac("sha256", secret)
    .update(nonce)
    .update(cipherBuffer)
    .digest("hex");

  if (
    !parsedEnvelope.mac ||
    !crypto.timingSafeEqual(Buffer.from(parsedEnvelope.mac, "hex"), Buffer.from(expectedMac, "hex"))
  ) {
    throw new Error("Encrypted payload integrity check failed.");
  }

  const keystream = buildKeystream(secret, nonce, cipherBuffer.length);
  const plainBuffer = xorBuffers(cipherBuffer, keystream);

  return plainBuffer.toString("utf8");
}

module.exports = {
  encryptPayload,
  decryptPayload
};
