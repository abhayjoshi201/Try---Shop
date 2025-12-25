import { Product } from "../types";

// Mock implementation to replace GoogleGenAI for this demo request
export const getProductRecommendations = async (
  currentProduct: Product,
  allProducts: Product[]
): Promise<string[]> => {
  // Removed delay for instant feedback
  
  // 1. Same Brand Cross-Sell (Strict Priority)
  // Finds other products (different name) from the same brand
  const sameBrandCrossSell = allProducts.filter(p => 
    p.brand === currentProduct.brand &&
    p.name !== currentProduct.name
  );

  // 2. Same Brand Variants (Fallback)
  // Finds other sizes of the same product
  const sameBrandVariants = allProducts.filter(p => 
    p.id !== currentProduct.id && 
    p.brand === currentProduct.brand &&
    p.name === currentProduct.name
  );

  // 3. Similar Category (Competitors)
  const sameCategory = allProducts.filter(p => 
    p.id !== currentProduct.id && 
    p.brand !== currentProduct.brand &&
    p.category === currentProduct.category
  );

  // 4. Fallback (Anything else)
  const others = allProducts.filter(p => 
    p.id !== currentProduct.id && 
    p.category !== currentProduct.category
  );

  // Assemble List: Priority on Brand Cross Sell
  let recommendations = [
      ...sameBrandCrossSell,
      ...sameBrandVariants,
      ...sameCategory,
      ...others
  ];

  // Remove exact duplicates of input ID
  recommendations = recommendations.filter(p => p.id !== currentProduct.id);

  // Dedup by ID
  const uniqueIds = Array.from(new Set(recommendations.map(p => p.id)));
  
  // Return top 3
  return uniqueIds.slice(0, 3);
};

export const chatWithGemini = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return "I am operating in Demo Mode. I can't access real-time AI processing right now, but I can confirm that the Try & Buy system is designed to boost average order value by suggesting relevant items!";
}