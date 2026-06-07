import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Toast from './Toast';
import { FaCog, FaSave, FaCloudShowersHeavy, FaBolt, FaMotorcycle } from 'react-icons/fa';

export default function SystemSettings() {
  const [config, setConfig] = useState({
    isRainModeActive: false,
    surgeFeeType: 'flat',
    surgeFeeValue: 0,
    isPeakHoursActive: false,
    deliveryCharge: 8,
    customerDeliveryFee: 20,
    freeDeliveryThreshold: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await adminAPI.getConfig();
      if (res.data.success && res.data.data) {
        setConfig({
          ...config,
          ...res.data.data
        });
      }
    } catch (err) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminAPI.updateConfig(config);
      if (res.data.success) {
        showToast('Settings updated successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCog className="text-gray-600" /> System Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">Configure global application settings and fees</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Delivery Charges Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaMotorcycle className="text-blue-500" />
              Delivery Settings
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Delivery Fee (₹ per order)
              </label>
              <div className="text-xs text-gray-500 mb-2">This is the amount charged to the customer for delivery.</div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={config.customerDeliveryFee}
                  onChange={e => setConfig({...config, customerDeliveryFee: Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Delivery Earnings (₹ per order)
              </label>
              <div className="text-xs text-gray-500 mb-2">Platform earning component from the delivery charge per order.</div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={config.deliveryCharge}
                  onChange={e => setConfig({...config, deliveryCharge: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Delivery Threshold (₹)
              </label>
              <div className="text-xs text-gray-500 mb-2">Order amount above which delivery is free. Set to 0 to disable.</div>
              <div className="relative md:w-1/2">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={config.freeDeliveryThreshold}
                  onChange={e => setConfig({...config, freeDeliveryThreshold: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Surge Fee Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaBolt className="text-yellow-500" />
              Surge Pricing Configuration
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={config.isRainModeActive}
                onChange={e => setConfig({...config, isRainModeActive: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-bold text-gray-700">Enable Surge Mode</span>
            </label>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surge Fee Type</label>
              <select 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                value={config.surgeFeeType}
                onChange={e => setConfig({...config, surgeFeeType: e.target.value})}
              >
                <option value="flat">Flat Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surge Fee Value
              </label>
              <div className="relative">
                {config.surgeFeeType === 'flat' && <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>}
                <input 
                  type="number" 
                  min="0"
                  step="0.1"
                  className={`w-full border border-gray-200 rounded-lg py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${config.surgeFeeType === 'flat' ? 'pl-8 pr-3' : 'px-3'}`}
                  value={config.surgeFeeValue}
                  onChange={e => setConfig({...config, surgeFeeValue: Number(e.target.value)})}
                />
                {config.surgeFeeType === 'percentage' && <span className="absolute right-3 top-2.5 text-gray-500 font-medium">%</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : <FaSave />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}
