import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, File, Star, Plus, Archive, ChevronRight, Search } from 'lucide-react';
import { useVaultStore } from '../store/vaultStore';
import VaultCard from '../components/VaultCard';
import QuickCaptureModal from '../components/QuickCaptureModal';

const VaultHub = () => {
  const navigate = useNavigate();
  const { vaultItems, fetchVaultItems, loading, updateVaultItem, deleteVaultItem } = useVaultStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVaultItems();
  }, [fetchVaultItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vault/all?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleToggleFavorite = async (id, isFavorite) => {
    const formData = new FormData();
    formData.append('isFavorite', isFavorite);
    await updateVaultItem(id, formData);
  };

  const handleDelete = async (id) => {
    await deleteVaultItem(id);
  };

  const stats = {
    notes: vaultItems.filter(item => item.type === 'NOTE').length,
    images: vaultItems.filter(item => item.type === 'IMAGE').length,
    pdfs: vaultItems.filter(item => item.type === 'PDF').length,
    favorites: vaultItems.filter(item => item.isFavorite).length,
  };

  const inboxItems = vaultItems.filter(item => item.isInbox).slice(0, 4);
  const recentItems = vaultItems.slice(0, 4);

  return (
    <div className="p-4 md:p-6 min-h-screen overflow-hidden space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            📚 Vault Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">Store and organize your important Vault</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-medium flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Quick Capture
        </button>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-purple-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-purple-100 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out sm:text-sm shadow-sm"
          placeholder="Search your Vault..."
        />
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate('/vault/all?type=NOTE')}
          className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 bg-blue-50 text-blue-500 rounded-full group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-700">Notes</span>
          <span className="text-xl font-bold text-gray-900">{stats.notes}</span>
        </div>
        <div 
          onClick={() => navigate('/vault/all?type=IMAGE')}
          className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 bg-fuchsia-50 text-fuchsia-500 rounded-full group-hover:scale-110 transition-transform">
            <ImageIcon className="w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-700">Images</span>
          <span className="text-xl font-bold text-gray-900">{stats.images}</span>
        </div>
        <div 
          onClick={() => navigate('/vault/all?type=PDF')}
          className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 bg-orange-50 text-orange-500 rounded-full group-hover:scale-110 transition-transform">
            <File className="w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-700">PDFs</span>
          <span className="text-xl font-bold text-gray-900">{stats.pdfs}</span>
        </div>
        <div 
          onClick={() => navigate('/vault/favorites')}
          className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 bg-yellow-50 text-yellow-500 rounded-full group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-700">Favorites</span>
          <span className="text-xl font-bold text-gray-900">{stats.favorites}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbox Section */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Archive className="w-5 h-5 text-purple-500" /> Inbox
            </h2>
            <button 
              onClick={() => navigate('/vault/inbox')}
              className="text-sm text-purple-600 font-medium hover:text-purple-700 flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>
            ) : inboxItems.length > 0 ? (
              inboxItems.map(item => (
                <VaultCard 
                  key={item._id} 
                  item={item} 
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                  onClick={() => setIsModalOpen(true)} // A more complete implementation would set an editItem here
                />
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                  <Archive className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-gray-500 font-medium">Inbox is empty</p>
                <p className="text-sm text-gray-400 mt-1">Everything is organized. Nice!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Added Section */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Recently Added
            </h2>
            <button 
              onClick={() => navigate('/vault/all')}
              className="text-sm text-purple-600 font-medium hover:text-purple-700 flex items-center"
            >
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
               <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>
            ) : recentItems.length > 0 ? (
              recentItems.map(item => (
                <VaultCard 
                  key={item._id} 
                  item={item} 
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                  onClick={() => setIsModalOpen(true)} 
                />
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-gray-500 font-medium">No Vault yet</p>
                <p className="text-sm text-gray-400 mt-1">Save notes, screenshots and PDFs here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default VaultHub;
