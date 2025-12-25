import React, { useEffect, useState } from 'react';
import { getOrders, getProducts, completeDelivery } from '../services/mockShopify';
import { Order, OrderStatus, Product } from '../types';
import { Truck, MapPin, CheckCircle, RotateCcw } from 'lucide-react';

const RiderView: React.FC = () => {
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [keptStatus, setKeptStatus] = useState<{[key: string]: boolean}>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [allOrders, allProducts] = await Promise.all([getOrders(), getProducts()]);
    // Filter for orders out for delivery
    setActiveDeliveries(allOrders.filter(o => o.status === OrderStatus.OUT_FOR_DELIVERY));
    setProducts(allProducts);
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    const initialStatus: {[key: string]: boolean} = {};
    order.items.forEach(item => {
        initialStatus[item.productId] = false; // Default to return unless marked kept
    });
    setKeptStatus(initialStatus);
  };

  const toggleItemKept = (productId: string) => {
    setKeptStatus(prev => ({
        ...prev,
        [productId]: !prev[productId]
    }));
  };

  const handleComplete = async () => {
    if (!selectedOrder) return;
    setProcessing(true);
    
    const keptItemsList = Object.entries(keptStatus).map(([pid, kept]) => ({
        productId: pid,
        kept: kept as boolean
    }));

    await completeDelivery(selectedOrder.id, keptItemsList);
    setProcessing(false);
    setSelectedOrder(null);
    fetchData();
  };

  if (selectedOrder) {
     const totalKeptValue = selectedOrder.items.reduce((acc, item) => {
         if (keptStatus[item.productId]) {
             const p = products.find(prod => prod.id === item.productId);
             return acc + (p ? p.price * item.quantity : 0);
         }
         return acc;
     }, 0);

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="text-white">
                    <h2 className="text-xl font-bold">Delivery: {selectedOrder.id}</h2>
                    <p className="text-indigo-200 text-sm">{selectedOrder.customerName}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-indigo-200 hover:text-white">Back</button>
            </div>
            
            <div className="p-6">
                <p className="mb-4 text-gray-600">Mark items the customer is keeping:</p>
                <div className="space-y-4 mb-8">
                    {selectedOrder.items.map((item, idx) => {
                         const product = products.find(p => p.id === item.productId);
                         if (!product) return null;
                         const isKept = keptStatus[item.productId];

                         return (
                            <div key={idx} 
                                onClick={() => toggleItemKept(item.productId)}
                                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${isKept ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${isKept ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}`}>
                                        {isKept && <CheckCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex items-center">
                                        <img src={product.image} className="w-10 h-10 object-cover rounded mr-3" alt="" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            <p className="text-sm text-gray-500">{product.size} - ${product.price}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-medium">
                                    {isKept ? <span className="text-green-600">Keeping</span> : <span className="text-orange-500 flex items-center"><RotateCcw className="w-3 h-3 mr-1"/> Returning</span>}
                                </div>
                            </div>
                         );
                    })}
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold text-gray-700">Total to Collect:</span>
                        <span className="text-2xl font-bold text-indigo-600">${totalKeptValue.toFixed(2)}</span>
                    </div>
                    
                    <button
                        onClick={handleComplete}
                        disabled={processing}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : 'Complete Delivery & Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Truck className="w-6 h-6 mr-3 text-indigo-600" />
        Active Deliveries
      </h2>
      
      {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">All deliveries completed!</p>
          </div>
      ) : (
          <div className="grid gap-4 md:grid-cols-2">
              {activeDeliveries.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
                            <p className="text-sm text-gray-500">Order: {order.id}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              {order.items.length} items
                          </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-6">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">123 Mock Street, Tech City</span>
                      </div>
                      <button 
                        onClick={() => handleSelectOrder(order)}
                        className="w-full py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                          Start Delivery
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default RiderView;