// SECURITY WARNING:
// In a production application, NEVER expose your Admin API Access Token in client-side code.
// This is for demonstration/local testing purposes only.

export const SHOPIFY_CONFIG = {
  // Your store domain, e.g., 'my-cool-store.myshopify.com'
  domain: process.env.SHOPIFY_SHOP_DOMAIN || 'your-store.myshopify.com',
  
  // Your Admin API Access Token (starts with shpat_)
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'shpat_YOUR_ACCESS_TOKEN_HERE',
  
  // API Version
  apiVersion: '2024-01',
};
