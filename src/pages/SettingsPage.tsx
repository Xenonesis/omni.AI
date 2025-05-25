import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SettingsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  
  const handlePriorityChange = (key: 'prioritizePrice' | 'prioritizeSpeed' | 'prioritizeReputation', value: boolean) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { [key]: value }
    });
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-neutral-800 mb-6">Settings</h1>
          
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-medium text-neutral-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary-600" />
              Search Preferences
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-neutral-700 mb-2">Deal Priorities</h3>
                <p className="text-sm text-neutral-500 mb-4">
                  Set your priorities for deal recommendations.
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.userPreferences.prioritizePrice}
                      onChange={(e) => handlePriorityChange('prioritizePrice', e.target.checked)}
                      className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-neutral-700">Prioritize lowest prices</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.userPreferences.prioritizeSpeed}
                      onChange={(e) => handlePriorityChange('prioritizeSpeed', e.target.checked)}
                      className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-neutral-700">Prioritize fastest delivery</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.userPreferences.prioritizeReputation}
                      onChange={(e) => handlePriorityChange('prioritizeReputation', e.target.checked)}
                      className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-neutral-700">Prioritize seller reputation</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-neutral-700 mb-2">Price Range (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-500 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min $"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-500 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max $"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-neutral-700 mb-2">Email Notifications</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-neutral-700">Send me email reports for all searches</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <Button 
                variant="primary" 
                icon={<Save size={18} />}
                className="w-full sm:w-auto"
              >
                Save Preferences
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-medium text-neutral-800 mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <h3 className="font-medium text-neutral-700 mb-2">Data & Privacy</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-neutral-700">Save search history</span>
                </label>
                
                <button className="text-sm text-primary-600 hover:text-primary-700 transition-colors mt-2">
                  Clear all search history
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <Button 
                variant="primary"
                className="w-full sm:w-auto"
              >
                Update Account
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;