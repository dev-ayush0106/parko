/** @type {import('next').NextConfig} */

const CSP = [
  "default-src 'self'",
  // unsafe-eval: required by Next.js dev hot-reload & some bundler chunks
  // unsafe-inline: required for Next.js hydration scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
  // Google Fonts CSS is loaded via @import in globals.css
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // ImageKit + Unsplash for spot photos; blob/data for OCR previews
  "img-src 'self' data: blob: https://ik.imagekit.io https://images.unsplash.com",
  // Google Fonts actual font files live on gstatic.com
  "font-src 'self' https://fonts.gstatic.com",
  // ImageKit upload API + Razorpay APIs
  "connect-src 'self' https://upload.imagekit.io https://*.razorpay.com https://api.razorpay.com",
  // Razorpay checkout renders in an iframe
  "frame-src https://*.razorpay.com",
  // Tesseract.js spins up a Web Worker via blob URL
  "worker-src blob: 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Block clickjacking
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Legacy XSS filter (still useful for old browsers)
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  // Only send origin on cross-origin requests
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Restrict browser features
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
  // Force HTTPS for 2 years (enable once deployed on HTTPS)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Full CSP
  { key: 'Content-Security-Policy',   value: CSP },
]

const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'ik.imagekit.io'],
  },
  serverExternalPackages: ['razorpay'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
