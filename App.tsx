import React, { useState } from 'react';
import { ShoppingBag, Truck, Package, MessageCircle } from 'lucide-react';
import { Role } from './types';
import CustomerView from './components/CustomerView';
import StoreOpsView from './components/StoreOpsView';
import RiderView from './components/RiderView';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>(Role.CUSTOMER);
  const [showChat, setShowChat] = useState(false);

  // Simple routing based on state
  const renderView = () => {
    switch (currentRole) {
      case Role.CUSTOMER:
        return <CustomerView />;
      case Role.STORE_OPS:
        return <StoreOpsView />;
      case Role.RIDER:
        return <RiderView />;
      default:
        return <CustomerView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                Try & Buy Logistics
              </span>
            </div>
            
            {/* Role Switcher */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setCurrentRole(Role.CUSTOMER)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRole === Role.CUSTOMER ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Customer</span>
              </button>
              <button
                onClick={() => setCurrentRole(Role.STORE_OPS)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRole === Role.STORE_OPS ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Store Ops</span>
              </button>
              <button
                onClick={() => setCurrentRole(Role.RIDER)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRole === Role.RIDER ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Truck className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Rider</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      {/* Chat Bot Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Chat Bot Overlay */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px]">
           <ChatBot onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
};

export default App;