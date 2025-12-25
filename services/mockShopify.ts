import { MOCK_PRODUCTS, MOCK_CUSTOMER_NAMES } from '../constants';
import { Order, OrderStatus, Product, LineItem } from '../types';

// In-memory store
let orders: Order[] = [];
let products: Product[] = [...MOCK_PRODUCTS];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProducts = async (): Promise<Product[]> => {
  await delay(300);
  return [...products];
};

export const getOrders = async (): Promise<Order[]> => {
  await delay(300);
  return [...orders];
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
    await delay(100);
    return orders.find(o => o.id === id);
}

// Logic to find specific size variations (One up, one down)
const findTryAndBuyVariants = (product: Product, allProducts: Product[]): Product[] => {
  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  // For numeric sizes, we assume strict equality for now, or simple parsing
  
  const variants = allProducts.filter(p => 
    p.name === product.name && 
    p.brand === product.brand && 
    p.id !== product.id &&
    p.stock > 0
  );

  const currentSizeIndex = SIZES.indexOf(product.size);
  let targetSizes: string[] = [];

  if (currentSizeIndex !== -1) {
      // Standard sizes
      if (currentSizeIndex > 0) targetSizes.push(SIZES[currentSizeIndex - 1]);
      if (currentSizeIndex < SIZES.length - 1) targetSizes.push(SIZES[currentSizeIndex + 1]);
  } else {
      // Numeric check
      const currentVal = parseInt(product.size);
      if (!isNaN(currentVal)) {
          targetSizes.push((currentVal - 2).toString());
          targetSizes.push((currentVal + 2).toString());
      }
  }

  // Filter variants that match target sizes
  const specificVariants = variants.filter(v => targetSizes.includes(v.size));

  // If we found specific up/down, return them. Otherwise return all available variants (fallback)
  return specificVariants.length > 0 ? specificVariants : variants;
};

// Logic to find similar styles (Same category or brand)
const findSimilarStyles = (product: Product, allProducts: Product[], limit = 3): Product[] => {
  // 1. Same brand, same category
  const sameBrandCategory = allProducts.filter(p => 
    p.id !== product.id && 
    p.name !== product.name &&
    p.brand === product.brand &&
    p.category === product.category &&
    p.stock > 0
  );

  // 2. Same category, different brand (competitor)
  const sameCategory = allProducts.filter(p => 
    p.id !== product.id && 
    p.name !== product.name &&
    p.brand !== product.brand &&
    p.category === product.category &&
    p.stock > 0
  );

  // Combine and dedupe
  const combined = [...sameBrandCategory, ...sameCategory];
  const unique = Array.from(new Set(combined.map(p => p.id)))
      .map(id => combined.find(p => p.id === id)!)
      .slice(0, limit);

  return unique;
};

export const createOrder = async (items: { productId: string; quantity: number }[], isTryAndBuy: boolean): Promise<Order> => {
  await delay(500);
  
  const newOrderItems: LineItem[] = items.map(i => ({
    productId: i.productId,
    quantity: i.quantity,
    isTryAndBuyExtra: false
  }));

  // AUTOMATION: Try & Buy Logic
  if (isTryAndBuy) {
    items.forEach(item => {
      const originalProduct = products.find(p => p.id === item.productId);
      if (originalProduct) {
        // 1. Add size variations (One up/down)
        const sizeVars = findTryAndBuyVariants(originalProduct, products);
        sizeVars.forEach(p => {
          // Check if already added
          if (!newOrderItems.find(i => i.productId === p.id)) {
            newOrderItems.push({
                productId: p.id,
                quantity: 1,
                isTryAndBuyExtra: true
            });
          }
        });

        // 2. Add 2-3 similar designs
        const similarStyles = findSimilarStyles(originalProduct, products, 3);
        similarStyles.forEach(p => {
           if (!newOrderItems.find(i => i.productId === p.id)) {
                newOrderItems.push({
                    productId: p.id,
                    quantity: 1,
                    isTryAndBuyExtra: true
                });
           }
        });
      }
    });
  }

  const orderValue = newOrderItems.reduce((acc, item) => {
     const p = products.find(prod => prod.id === item.productId);
     return acc + (p ? p.price * item.quantity : 0);
  }, 0);

  const newOrder: Order = {
    id: `ORD-${Math.floor(Math.random() * 10000)}`,
    customerName: MOCK_CUSTOMER_NAMES[Math.floor(Math.random() * MOCK_CUSTOMER_NAMES.length)],
    createdAt: new Date().toISOString(),
    status: OrderStatus.PLACED,
    isTryAndBuy,
    items: newOrderItems,
    totalValue: orderValue
  };

  orders = [newOrder, ...orders];
  return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
  await delay(300);
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  const updatedOrder = { ...orders[index], status };
  orders[index] = updatedOrder;
  return updatedOrder;
};

export const updateOrderItems = async (orderId: string, newItems: LineItem[]): Promise<Order | null> => {
  await delay(300);
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

   const orderValue = newItems.reduce((acc, item) => {
     const p = products.find(prod => prod.id === item.productId);
     return acc + (p ? p.price * item.quantity : 0);
  }, 0);

  const updatedOrder = { ...orders[index], items: newItems, totalValue: orderValue };
  orders[index] = updatedOrder;
  return updatedOrder;
};

export const completeDelivery = async (orderId: string, keptItems: {productId: string, kept: boolean}[]): Promise<Order | null> => {
    await delay(500);
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const order = orders[index];
    const updatedItems = order.items.map(item => {
        const keptInfo = keptItems.find(k => k.productId === item.productId);
        return {
            ...item,
            kept: keptInfo ? keptInfo.kept : false
        };
    });

    // Calculate final paid value
    const finalPaid = updatedItems.reduce((acc, item) => {
        if (!item.kept) return acc;
        const p = products.find(prod => prod.id === item.productId);
        return acc + (p ? p.price * item.quantity : 0);
    }, 0);

    // Update Inventory
    updatedItems.forEach(item => {
        if (item.kept) {
            const prodIndex = products.findIndex(p => p.id === item.productId);
            if (prodIndex > -1) {
                products[prodIndex] = { ...products[prodIndex], stock: products[prodIndex].stock - item.quantity };
            }
        }
    });

    const completedOrder: Order = {
        ...order,
        status: OrderStatus.COMPLETED,
        items: updatedItems,
        finalPaidValue: finalPaid
    };

    orders[index] = completedOrder;
    return completedOrder;
}