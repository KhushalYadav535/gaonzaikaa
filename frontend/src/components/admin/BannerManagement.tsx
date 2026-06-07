import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { FaImage, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimes, FaLink } from 'react-icons/fa';

interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  targetLink: string;
  isActive: boolean;
  priority: number;
}

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetLink: '',
    isActive: true,
    priority: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBanners();
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditMode(true);
      setSelectedBannerId(banner._id);
      setFormData({
        title: banner.title,
        imageUrl: banner.imageUrl,
        targetLink: banner.targetLink,
        isActive: banner.isActive,
        priority: banner.priority
      });
    } else {
      setEditMode(false);
      setSelectedBannerId(null);
      setFormData({
        title: '',
        imageUrl: '',
        targetLink: '',
        isActive: true,
        priority: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && selectedBannerId) {
        const res = await adminAPI.updateBanner(selectedBannerId, formData);
        if (res.data.success) {
          showToast('Banner updated successfully');
          fetchBanners();
          handleCloseModal();
        }
      } else {
        const res = await adminAPI.createBanner(formData);
        if (res.data.success) {
          showToast('Banner created successfully');
          fetchBanners();
          handleCloseModal();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save banner', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const res = await adminAPI.deleteBanner(id);
        if (res.data.success) {
          showToast('Banner deleted successfully');
          fetchBanners();
        }
      } catch (err) {
        showToast('Failed to delete banner', 'error');
      }
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const res = await adminAPI.updateBanner(banner._id, { isActive: !banner.isActive });
      if (res.data.success) {
        showToast(`Banner ${!banner.isActive ? 'activated' : 'deactivated'} successfully`);
        setBanners(banners.map(b => b._id === banner._id ? { ...b, isActive: !banner.isActive } : b));
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaImage className="text-blue-500" /> App Banners
          </h2>
          <p className="text-gray-500 mt-1">Manage the dynamic promotional banners displayed on the customer app home screen.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md transition-colors flex items-center gap-2 font-semibold"
        >
          <FaPlus /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            No banners found. Click "Add Banner" to create one.
          </div>
        ) : (
          banners.map(banner => (
            <div key={banner._id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group transition-all hover:shadow-lg">
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md shadow-sm ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-bold rounded-md shadow-sm bg-black bg-opacity-60 text-white backdrop-blur-sm">
                    Priority: {banner.priority}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">{banner.title}</h3>
                {banner.targetLink && (
                  <a href={banner.targetLink} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1 mb-4 line-clamp-1">
                    <FaLink className="text-xs" /> {banner.targetLink}
                  </a>
                )}
                {!banner.targetLink && <p className="text-sm text-gray-400 mb-4 italic">No link</p>}
                
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleToggleStatus(banner)}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${banner.isActive ? 'text-gray-600 hover:bg-gray-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                  >
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(banner)}
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(banner._id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="bg-blue-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {editMode ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <button onClick={handleCloseModal} className="text-white hover:text-blue-100 transition-colors">
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Diwali Special Offer"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.imageUrl} alt="Preview" className="h-full object-cover w-full" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x150?text=Invalid+Image+URL'; }} />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Link (Optional)</label>
                <input
                  type="text"
                  value={formData.targetLink}
                  onChange={e => setFormData({...formData, targetLink: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="App screen route or website URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority (Higher shows first)</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer h-10">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md transition-colors font-medium flex items-center gap-2"
                >
                  <FaCheckCircle /> {editMode ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl text-white transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <FaCheckCircle className="text-2xl" />
          <span className="font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
