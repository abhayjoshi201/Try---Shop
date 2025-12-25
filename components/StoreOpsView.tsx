import React, { useEffect, useState, useCallback } from 'react';
import { getOrders, getProducts, updateOrderItems, updateOrderStatus } from '../services/mockShopify';
import { getProductRecommendations } from '../services/geminiService';
import { Order, OrderStatus, Product, LineItem } from '../types';
import { Package, Sparkles, Plus, Trash2, Tag, BadgeCheck } from 'lucide-react';

const StoreOpsView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const [ordersData, productsData] = await Promise.all([getOrders(), getProducts()]);
    setOrders(ordersData);
    setProducts(productsData);
    
    // Refresh selected order data to keep items in sync
    setSelectedOrder(prev => {
        if (!prev) return null;
        return ordersData.find(o => o.id === prev.id) || prev;
    });
  };

  // Auto-generate recommendations when selectedOrder changes
  useEffect(() => {
      if (selectedOrder && products.length > 0) {
          generateRecommendations(selectedOrder, products);
      }
  }, [selectedOrder?.id, products.length]);

  const generateRecommendations = async (order: Order, currentProducts: Product[]) => {
    const primaryLineItem = order.items.find(i => !i.isTryAndBuyExtra) || order.items[0];
    if (!primaryLineItem) return;

    const primaryProduct = currentProducts.find(p => p.id === primaryLineItem.productId);

    if (primaryProduct) {
        const recommendedIds = await getProductRecommendations(primaryProduct, currentProducts);
        
        const currentIds = new Set(order.items.map(i => i.productId));
        // Filter out items already in the cart
        const newIds = recommendedIds.filter(id => !currentIds.has(id));
        const recommendedProducts = currentProducts.filter(p => newIds.includes(p.id));
        
        setRecommendations(recommendedProducts);
    }
  };

  const handleAddItem = async (productToAdd: Product) => {
    if (!selectedOrder) return;
    
    const existingItemIndex = selectedOrder.items.findIndex(i => i.productId === productToAdd.id);
    let newItems = [...selectedOrder.items];

    if (existingItemIndex > -1) {
        newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + 1
        };
    } else {
        newItems.push({
            productId: productToAdd.id,
            quantity: 1,
            isTryAndBuyExtra: true // Assuming manually added items in Ops view are suggestions/extras
        });
    }

    setLoading(true);
    await updateOrderItems(selectedOrder.id, newItems);
    await fetchData();
    setLoading(false);
  };

  const handleRemoveItem = async (indexToRemove: number) => {
    if (!selectedOrder) return;
    const newItems = selectedOrder.items.filter((_, idx) => idx !== indexToRemove);
    setLoading(true);
    await updateOrderItems(selectedOrder.id, newItems);
    await fetchData();
    setLoading(false);
  };

  const handleMarkPacked = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    await updateOrderStatus(selectedOrder.id, OrderStatus.OUT_FOR_DELIVERY);
    setSelectedOrder(null); 
    setRecommendations([]);
    await fetchData(); 
    setLoading(false);
  };

  const getMissingSizes = (product: Product, currentOrderItems: LineItem[]) => {
      const variants = products.filter(p => 
          p.name === product.name && 
          p.brand === product.brand &&
          p.id !== product.id
      );
      
      const currentItemIds = currentOrderItems.map(i => i.productId);
      return variants.filter(v => !currentItemIds.includes(v.id));
  };

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PLACED);
  
  // Calculate primary product for current selection to check for Brand Matching
  const primaryLineItem = selectedOrder?.items.find(i => !i.isTryAndBuyExtra) || selectedOrder?.items[0];
  const primaryProduct = primaryLineItem ? products.find(p => p.id === primaryLineItem.productId) : null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Order List */}
      <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-700">Incoming Orders</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {pendingOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pending orders.</p>
          ) : (
            pendingOrders.map(order => (
              <div
                key={order.id}
                onClick={() => { setSelectedOrder(order); setRecommendations([]); }}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedOrder?.id === order.id
                    ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-900 truncate max-w-[150px]">{order.id}</span>
                  {order.isTryAndBuy && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                      TRY & BUY
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{order.customerName}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Detail & Packing Station */}
      <div className="w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {selectedOrder ? (
          <>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order {selectedOrder.id}</h2>
                <p className="text-sm text-gray-500">Processing for {selectedOrder.customerName}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleMarkPacked}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 shadow-sm disabled:opacity-50"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Mark Packed
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Recommendations Area - Auto Visible */}
              {recommendations.length > 0 ? (
                  <div className="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-bold text-indigo-900 flex items-center">
                            <div className="bg-indigo-600 rounded-full p-1 mr-2">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            AI Recommended Picks
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {recommendations.map(rec => {
                              // Re-calculate brand match safely
                              const isSameBrand = primaryProduct && rec.brand === primaryProduct.brand;
                              
                              return (
                                  <div key={rec.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
                                      {isSameBrand && (
                                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold flex items-center shadow-sm z-10">
                                              <BadgeCheck className="w-3 h-3 mr-1" />
                                              Same Brand
                                          </div>
                                      )}
                                      <div className="flex items-center mb-3 mt-2">
                                          <img src={rec.image} className="w-12 h-12 rounded-lg object-cover mr-3 border border-gray-100" alt=""/>
                                          <div className="overflow-hidden">
                                              <p className="text-sm font-bold text-gray-900 truncate">{rec.name}</p>
                                              <p className="text-xs text-gray-500">{rec.brand} • {rec.size}</p>
                                          </div>
                                      </div>
                                      <div className="mt-auto pt-2 border-t border-gray-50">
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-xs font-bold text-gray-900">${rec.price}</span>
                                             {isSameBrand && <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">High Match</span>}
                                         </div>
                                         <button 
                                            onClick={() => handleAddItem(rec)}
                                            className="w-full text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 rounded-md font-bold flex justify-center items-center transition-colors"
                                          >
                                              <Plus className="w-3 h-3 mr-1"/> Add to Package
                                          </button>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ) : (
                <div className="mb-6 p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
                   Searching for recommendations...
                </div>
              )}

              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Items to Pack</h3>
                <span className="text-sm text-gray-500">Total Value: ${selectedOrder.totalValue}</span>
              </div>
              
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  const missingSizes = getMissingSizes(product, selectedOrder.items);

                  return (
                    <div key={`${item.productId}-${idx}`} className={`p-4 rounded-lg border ${item.isTryAndBuyExtra ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center" />
                        </div>
                        <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                                <h4 className="text-base font-medium text-gray-900">{product.name}</h4>
                                <p className="text-sm font-medium text-gray-900">${product.price}</p>
                            </div>
                            <p className="text-sm text-gray-500">{product.brand} | Size: {product.size}</p>
                            {item.isTryAndBuyExtra && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                    Added for Trial
                                </span>
                            )}
                        </div>
                        <div className="ml-4">
                            <button 
                                onClick={() => handleRemoveItem(idx)}
                                className="text-red-400 hover:text-red-600 p-2"
                                title="Remove item"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </div>

                      {/* Manual Add Size Controls */}
                      {missingSizes.length > 0 && (
                          <div className="mt-3 ml-20 flex flex-wrap gap-2 items-center">
                              <span className="text-xs text-gray-400 flex items-center"><Tag className="w-3 h-3 mr-1"/> Add Size:</span>
                              {missingSizes.map(variant => (
                                  <button
                                    key={variant.id}
                                    onClick={() => handleAddItem(variant)}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600 flex items-center"
                                  >
                                      <Plus className="w-3 h-3 mr-1" />
                                      {variant.size}
                                  </button>
                              ))}
                          </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Package className="w-16 h-16 mb-4 text-gray-200" />
            <p>Select an order to begin packing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOpsView;