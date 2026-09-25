
import crypto from 'crypto';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSignature(message: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export {requireEnv, createSignature, safeEqual}

