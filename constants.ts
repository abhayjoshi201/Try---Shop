import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  // T-Shirts (UrbanBasic)
  { id: 'p1', name: 'Classic White Tee', brand: 'UrbanBasic', category: 'T-Shirt', size: 'S', price: 25, stock: 10, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80' },
  { id: 'p2', name: 'Classic White Tee', brand: 'UrbanBasic', category: 'T-Shirt', size: 'M', price: 25, stock: 15, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80' },
  { id: 'p3', name: 'Classic White Tee', brand: 'UrbanBasic', category: 'T-Shirt', size: 'L', price: 25, stock: 8, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80' },
  
  // New UrbanBasic Items for Cross-Sell
  { id: 'p25', name: 'Essential Hoodie', brand: 'UrbanBasic', category: 'Hoodie', size: 'M', price: 45, stock: 20, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80' },
  { id: 'p26', name: 'Comfy Joggers', brand: 'UrbanBasic', category: 'Pants', size: 'M', price: 35, stock: 12, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=500&q=80' },

  { id: 'p4', name: 'Graphic Band Tee', brand: 'RockVibe', category: 'T-Shirt', size: 'S', price: 35, stock: 5, image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=500&q=80' },
  { id: 'p15', name: 'Graphic Band Tee', brand: 'RockVibe', category: 'T-Shirt', size: 'M', price: 35, stock: 5, image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=500&q=80' },
  { id: 'p16', name: 'Graphic Band Tee', brand: 'RockVibe', category: 'T-Shirt', size: 'L', price: 35, stock: 5, image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=500&q=80' },

  // Jeans
  { id: 'p5', name: 'Slim Fit Denim', brand: 'DenimCo', category: 'Jeans', size: '30', price: 60, stock: 12, image: 'https://cdn05.nnnow.com/web-images/large/styles/T99NVUUD0FM/1741269995472/1.jpg' },
  { id: 'p6', name: 'Slim Fit Denim', brand: 'DenimCo', category: 'Jeans', size: '32', price: 60, stock: 10, image: 'https://cdn05.nnnow.com/web-images/large/styles/T99NVUUD0FM/1741269995472/1.jpg' },
  { id: 'p7', name: 'Slim Fit Denim', brand: 'DenimCo', category: 'Jeans', size: '34', price: 60, stock: 7, image: 'https://cdn05.nnnow.com/web-images/large/styles/T99NVUUD0FM/1741269995472/1.jpg' },
  { id: 'p8', name: 'Ripped Jeans', brand: 'RebelWear', category: 'Jeans', size: '30', price: 75, stock: 4, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80' },
  { id: 'p17', name: 'Ripped Jeans', brand: 'RebelWear', category: 'Jeans', size: '32', price: 75, stock: 4, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80' },
  { id: 'p18', name: 'Ripped Jeans', brand: 'RebelWear', category: 'Jeans', size: '34', price: 75, stock: 4, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80' },

  // Dresses
  { id: 'p9', name: 'Summer Floral Dress', brand: 'ChicStyle', category: 'Dress', size: 'S', price: 45, stock: 20, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80' },
  { id: 'p10', name: 'Summer Floral Dress', brand: 'ChicStyle', category: 'Dress', size: 'M', price: 45, stock: 18, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80' },
  { id: 'p11', name: 'Summer Floral Dress', brand: 'ChicStyle', category: 'Dress', size: 'L', price: 45, stock: 15, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80' },
  { id: 'p12', name: 'Evening Black Dress', brand: 'LuxeLife', category: 'Dress', size: 'S', price: 120, stock: 3, image: 'https://clothsvilla.com/cdn/shop/products/BlackPromDressesV-NeckPuffySleevesA-LineEveningGownforWedding_1_1024x1024.jpg?v=1697220843' },
  { id: 'p13', name: 'Evening Black Dress', brand: 'LuxeLife', category: 'Dress', size: 'M', price: 120, stock: 3, image: 'https://clothsvilla.com/cdn/shop/products/BlackPromDressesV-NeckPuffySleevesA-LineEveningGownforWedding_1_1024x1024.jpg?v=1697220843' },
  { id: 'p14', name: 'Evening Black Dress', brand: 'LuxeLife', category: 'Dress', size: 'L', price: 120, stock: 3, image: 'https://clothsvilla.com/cdn/shop/products/BlackPromDressesV-NeckPuffySleevesA-LineEveningGownforWedding_1_1024x1024.jpg?v=1697220843' },

  // Jackets
  { id: 'p19', name: 'Leather Biker Jacket', brand: 'RebelWear', category: 'Jacket', size: 'M', price: 150, stock: 5, image: 'https://cdn-images.farfetch-contents.com/17/81/19/24/17811924_37690679_2048.jpg' },
  { id: 'p21', name: 'Leather Biker Jacket', brand: 'RebelWear', category: 'Jacket', size: 'L', price: 150, stock: 5, image: 'https://cdn-images.farfetch-contents.com/17/81/19/24/17811924_37690679_2048.jpg' },
  { id: 'p22', name: 'Leather Biker Jacket', brand: 'RebelWear', category: 'Jacket', size: 'XL', price: 150, stock: 5, image: 'https://cdn-images.farfetch-contents.com/17/81/19/24/17811924_37690679_2048.jpg' },

  { id: 'p20', name: 'Denim Jacket', brand: 'DenimCo', category: 'Jacket', size: 'M', price: 80, stock: 8, image: 'https://assets.myntassets.com/w_360,q_50,,dpr_2,fl_progressive,f_webp/assets/images/24029950/2023/9/14/25593876-d014-4759-a2d7-0b79bb8b15c31694682882090-US-Polo-Assn-Denim-Co-Men-Jackets-6881694682881533-1.jpg' },
  { id: 'p23', name: 'Denim Jacket', brand: 'DenimCo', category: 'Jacket', size: 'L', price: 80, stock: 8, image: 'https://assets.myntassets.com/w_360,q_50,,dpr_2,fl_progressive,f_webp/assets/images/24029950/2023/9/14/25593876-d014-4759-a2d7-0b79bb8b15c31694682882090-US-Polo-Assn-Denim-Co-Men-Jackets-6881694682881533-1.jpg' },
  { id: 'p24', name: 'Denim Jacket', brand: 'DenimCo', category: 'Jacket', size: 'XL', price: 80, stock: 8, image: 'https://assets.myntassets.com/w_360,q_50,,dpr_2,fl_progressive,f_webp/assets/images/24029950/2023/9/14/25593876-d014-4759-a2d7-0b79bb8b15c31694682882090-US-Polo-Assn-Denim-Co-Men-Jackets-6881694682881533-1.jpg' },

];

export const MOCK_CUSTOMER_NAMES = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince'];