import { Order, OrderStatus, Product, LineItem } from '../types';

// Dynamic configuration getter
const getShopifyConfig = () => {
  return {
    domain: localStorage.getItem('shopify_domain') || process.env.SHOPIFY_SHOP_DOMAIN || '',
    accessToken: localStorage.getItem('shopify_token') || process.env.SHOPIFY_ACCESS_TOKEN || '',
    apiVersion: '2024-01'
  };
};

const getGraphqlUrl = () => {
  const { domain, apiVersion } = getShopifyConfig();
  return `https://${domain}/admin/api/${apiVersion}/graphql.json`;
};

// --- GraphQL Queries & Mutations ---

const GET_PRODUCTS_QUERY = `
  query GetProducts {
    products(first: 50) {
      edges {
        node {
          id
          title
          vendor
          productType
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;

const GET_ORDERS_QUERY = `
  query GetOrders {
    orders(first: 20, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          tags
          totalPriceSet {
            shopMoney {
              amount
            }
          }
          customer {
            displayName
          }
          lineItems(first: 20) {
            edges {
              node {
                product {
                  id
                  title
                  vendor
                  productType
                }
                variant {
                  id
                  title
                  price
                }
                quantity
                customAttributes {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($order: OrderInput!) {
    orderCreate(order: $order) {
      order {
        id
        name
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_TAGS_MUTATION = `
  mutation UpdateOrderTags($id: ID!, $tags: String!) {
    orderUpdate(input: {id: $id, tags: $tags}) {
      order {
        id
        tags
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// --- Helper Functions ---

async function shopifyRequest(query: string, variables = {}) {
  const { domain, accessToken } = getShopifyConfig();

  // Validate Credentials
  if (!domain || domain.includes('your-store') || !accessToken || accessToken.includes('YOUR_ACCESS_TOKEN')) {
    throw new Error("MISSING_CREDS");
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
  };

  try {
    const response = await fetch(getGraphqlUrl(), {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
       // Handle 401 Unauthorized explicitly
       if (response.status === 401) {
           throw new Error("INVALID_CREDS");
       }
       const text = await response.text();
       console.error("Shopify API HTTP Error", response.status, text);
       throw new Error(`Shopify API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
      console.error("Shopify API Error", json.errors);
      throw new Error(json.errors[0].message);
    }
    return json.data;
  } catch (error: any) {
    if (error.message === "MISSING_CREDS") throw error;
    if (error.message === "INVALID_CREDS") throw error;

    if (error.message && error.message.includes('Failed to fetch')) {
        console.error("CORS Error or Network Issue.");
        throw new Error("CORS_ERROR");
    }
    throw error;
  }
}

function mapShopifyProductToApp(node: any): Product[] {
  const products: Product[] = [];
  const imageUrl = node.images?.edges?.[0]?.node?.url || 'https://via.placeholder.com/300';

  node.variants.edges.forEach((v: any) => {
    products.push({
      id: v.node.id, 
      name: node.title,
      brand: node.vendor,
      category: node.productType,
      size: v.node.title, 
      price: parseFloat(v.node.price),
      stock: v.node.inventoryQuantity,
      image: imageUrl
    });
  });

  return products;
}

function mapShopifyOrderToApp(node: any): Order {
  let status = OrderStatus.PLACED;
  if (node.tags.includes('STATUS_PACKED')) status = OrderStatus.PACKED;
  if (node.tags.includes('STATUS_OUT_FOR_DELIVERY')) status = OrderStatus.OUT_FOR_DELIVERY;
  if (node.tags.includes('STATUS_COMPLETED')) status = OrderStatus.COMPLETED;

  const isTryAndBuy = node.tags.includes('TRY_AND_BUY');

  const items: LineItem[] = node.lineItems.edges.map((edge: any) => {
    const li = edge.node;
    const isExtra = li.customAttributes.some((attr: any) => attr.key === 'TryAndBuyExtra' && attr.value === 'true');
    
    return {
      productId: li.variant?.id || 'unknown',
      quantity: li.quantity,
      isTryAndBuyExtra: isExtra,
      kept: false 
    };
  });

  return {
    id: node.id,
    customerName: node.customer?.displayName || 'Guest',
    createdAt: node.createdAt,
    status,
    isTryAndBuy,
    items,
    totalValue: parseFloat(node.totalPriceSet?.shopMoney?.amount || '0')
  };
}

// --- Logic Re-used from Mock for Recommendations ---

const findTryAndBuyVariants = (product: Product, allProducts: Product[]): Product[] => {
  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const variants = allProducts.filter(p => 
    p.name === product.name && 
    p.brand === product.brand && 
    p.id !== product.id &&
    p.stock > 0
  );

  const currentSizeIndex = SIZES.indexOf(product.size);
  let targetSizes: string[] = [];

  if (currentSizeIndex !== -1) {
      if (currentSizeIndex > 0) targetSizes.push(SIZES[currentSizeIndex - 1]);
      if (currentSizeIndex < SIZES.length - 1) targetSizes.push(SIZES[currentSizeIndex + 1]);
  } else {
     return variants.slice(0, 2);
  }

  const specificVariants = variants.filter(v => targetSizes.includes(v.size));
  return specificVariants.length > 0 ? specificVariants : variants;
};

const findSimilarStyles = (product: Product, allProducts: Product[], limit = 3): Product[] => {
  const sameCategory = allProducts.filter(p => 
    p.id !== product.id && 
    p.name !== product.name &&
    p.category === product.category &&
    p.stock > 0
  );
  return sameCategory.slice(0, limit);
};


// --- Exported Services ---

export const getProducts = async (): Promise<Product[]> => {
  try {
    const data = await shopifyRequest(GET_PRODUCTS_QUERY);
    let allProducts: Product[] = [];
    data.products.edges.forEach((edge: any) => {
      allProducts = [...allProducts, ...mapShopifyProductToApp(edge.node)];
    });
    return allProducts;
  } catch (e: any) {
    console.error("Failed to fetch products", e.message);
    throw e; // Re-throw to be handled by UI
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const data = await shopifyRequest(GET_ORDERS_QUERY);
    return data.orders.edges.map((edge: any) => mapShopifyOrderToApp(edge.node));
  } catch (e: any) {
    console.error("Failed to fetch orders", e.message);
    throw e;
  }
};

export const createOrder = async (items: { productId: string; quantity: number }[], isTryAndBuy: boolean): Promise<Order | null> => {
  try {
    const allProducts = await getProducts();
    
    // 1. Prepare Line Items
    const finalItems: { variantId: string, quantity: number, customAttributes: {key:string, value:string}[] }[] = [];

    items.forEach(item => {
      finalItems.push({
        variantId: item.productId,
        quantity: item.quantity,
        customAttributes: []
      });

      // 2. Automation Logic
      if (isTryAndBuy) {
        const originalProduct = allProducts.find(p => p.id === item.productId);
        if (originalProduct) {
          const sizeVars = findTryAndBuyVariants(originalProduct, allProducts);
          sizeVars.forEach(p => {
            if (!finalItems.find(i => i.variantId === p.id)) {
              finalItems.push({ variantId: p.id, quantity: 1, customAttributes: [{key: 'TryAndBuyExtra', value: 'true'}] });
            }
          });

          const similarStyles = findSimilarStyles(originalProduct, allProducts, 2);
          similarStyles.forEach(p => {
            if (!finalItems.find(i => i.variantId === p.id)) {
              finalItems.push({ variantId: p.id, quantity: 1, customAttributes: [{key: 'TryAndBuyExtra', value: 'true'}] });
            }
          });
        }
      }
    });

    const tags = isTryAndBuy ? "TRY_AND_BUY" : "";

    const variables = {
      order: {
        lineItems: finalItems,
        tags: tags,
        financialStatus: "PENDING"
      }
    };

    const result = await shopifyRequest(CREATE_ORDER_MUTATION, variables);
    if(result.orderCreate?.userErrors?.length > 0) {
        console.error("Order Create Errors", result.orderCreate.userErrors);
        throw new Error("Failed to create order");
    }
    return {
        id: result.orderCreate.order.id,
        customerName: "New Customer",
        createdAt: new Date().toISOString(),
        status: OrderStatus.PLACED,
        isTryAndBuy,
        items: [], 
        totalValue: 0
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
  let tag = "";
  if (status === OrderStatus.PACKED) tag = "STATUS_PACKED";
  if (status === OrderStatus.OUT_FOR_DELIVERY) tag = "STATUS_OUT_FOR_DELIVERY";
  
  try {
      await shopifyRequest(UPDATE_TAGS_MUTATION, { id: orderId, tags: tag });
      return null; 
  } catch (e) {
      console.error(e);
      return null;
  }
};

export const updateOrderItems = async (orderId: string, newItems: LineItem[]): Promise<Order | null> => {
  console.warn("Editing active orders via API is restricted in this demo view.");
  return null;
};

export const completeDelivery = async (orderId: string, keptItems: {productId: string, kept: boolean}[]): Promise<Order | null> => {
    await shopifyRequest(UPDATE_TAGS_MUTATION, { id: orderId, tags: "STATUS_COMPLETED" });
    console.log("Processing returns for:", keptItems.filter(k => !k.kept));
    return null;
}
