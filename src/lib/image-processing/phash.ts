import sharp from "sharp";

/**
 * Compute a simple perceptual hash using average hash algorithm.
 * Resizes image to 8x8 grayscale, computes average, and creates binary hash.
 */
export async function computePHash(buffer: Buffer): Promise<string> {
  const pixels = await sharp(buffer)
    .resize(8, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer();

  const avg =
    pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

  let hash = "";
  for (let i = 0; i < pixels.length; i++) {
    hash += pixels[i] >= avg ? "1" : "0";
  }

  // Convert binary string to hex
  let hex = "";
  for (let i = 0; i < hash.length; i += 4) {
    hex += parseInt(hash.substring(i, i + 4), 2).toString(16);
  }

  return hex;
}

/**
 * Compute Hamming distance between two hex hash strings.
 * Returns the number of differing bits.
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return Infinity;

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    // Count bits in xor
    let bits = xor;
    while (bits) {
      distance += bits & 1;
      bits >>= 1;
    }
  }
  return distance;
}
