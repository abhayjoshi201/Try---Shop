import React, { useEffect, useState } from 'react';
import { getProducts, createOrder } from '../services/mockShopify';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';

const CustomerView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: Product; isTryAndBuy: boolean } | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleBuyClick = (product: Product) => {
    setCart({ product, isTryAndBuy: false });
    setOrderPlaced(false);
  };

  const handlePlaceOrder = async () => {
    if (!cart) return;
    setLoading(true);
    await createOrder([{ productId: cart.product.id, quantity: 1 }], cart.isTryAndBuy);
    setLoading(false);
    setOrderPlaced(true);
    setCart(null);
    
    // Reset success message after 3 seconds
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  if (loading && products.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">Loading catalog...</p>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Summer Collection</h2>
        <p className="text-gray-500">Select an item to try at home.</p>
      </div>

      {orderPlaced && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your order has been placed successfully. Switch to 'Store Ops' to process it.</span>
        </div>
      )}

      {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No products found.</div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.size}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">${product.price}</span>
                    <button
                      onClick={() => handleBuyClick(product)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* Checkout Modal */}
      {cart && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Order</h3>
            <div className="flex items-center mb-4">
              <img src={cart.product.image} alt="" className="w-16 h-16 object-cover rounded mr-4" />
              <div>
                <p className="font-semibold">{cart.product.name}</p>
                <p className="text-sm text-gray-500">{cart.product.brand} - {cart.product.size}</p>
                <p className="font-bold">${cart.product.price}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={cart.isTryAndBuy}
                  onChange={(e) => setCart({ ...cart, isTryAndBuy: e.target.checked })}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Try & Buy</span>
                  <span className="block text-xs text-gray-500">We'll send you other sizes and similar styles to try at home!</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCart(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;