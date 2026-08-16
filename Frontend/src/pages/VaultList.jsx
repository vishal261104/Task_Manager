import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, File, Star, ArrowLeft, Search, Archive, Plus } from 'lucide-react';
import { useVaultStore } from '../store/vaultStore';
import VaultCard from '../components/VaultCard';
import QuickCaptureModal from '../components/QuickCaptureModal';

const VaultList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vaultItems, fetchVaultItems, loading, updateVaultItem, deleteVaultItem } = useVaultStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Parse path and query params to determine mode and filters
  const searchParams = new URLSearchParams(location.search);
  const typeFilter = searchParams.get('type');
  const searchFilter = searchParams.get('search') || '';

  const isInbox = location.pathname.includes('/inbox');
  const isFavorites = location.pathname.includes('/favorites');
  const isAll = location.pathname.includes('/all');

  useEffect(() => {
    fetchVaultItems();
  }, [fetchVaultItems]);

  const [localSearch, setLocalSearch] = useState(searchFilter);

  useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      navigate(`${location.pathname}?search=${encodeURIComponent(localSearch)}${typeFilter ? `&type=${typeFilter}` : ''}`);
    } else {
      navigate(`${location.pathname}${typeFilter ? `?type=${typeFilter}` : ''}`);
    }
  };

  const filteredItems = useMemo(() => {
    return vaultItems.filter(item => {
      // Base path filters
      if (isInbox && !item.isInbox) return false;
      if (isFavorites && !item.isFavorite) return false;
      // If it's "All" and we want to exclude Inbox items from the main view unless specified, we could do that.
      // But usually "All" means all. Let's say "All" means everything.

      // Query params filters
      if (typeFilter && item.type !== typeFilter) return false;

      // Search filter
      if (localSearch) {
        const query = localSearch.toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(query);
        const inDesc = item.description?.toLowerCase().includes(query);
        const inTags = item.tags?.some(tag => tag.name.toLowerCase().includes(query));
        if (!inTitle && !inDesc && !inTags) return false;
      }

      return true;
    });
  }, [vaultItems, isInbox, isFavorites, typeFilter, localSearch]);

  const handleToggleFavorite = async (id, isFavorite) => {
    const formData = new FormData();
    formData.append('isFavorite', isFavorite);
    await updateVaultItem(id, formData);
  };

  const handleDelete = async (id) => {
    await deleteVaultItem(id);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditItem(null);
    setIsModalOpen(false);
  };

  let pageTitle = 'All Vault';
  let pageIcon = <FileText className="w-6 h-6 text-purple-600" />;
  if (isInbox) {
    pageTitle = 'Inbox';
    pageIcon = <Archive className="w-6 h-6 text-purple-600" />;
  } else if (isFavorites) {
    pageTitle = 'Favorites';
    pageIcon = <Star className="w-6 h-6 text-yellow-500" />;
  } else if (typeFilter === 'NOTE') {
    pageTitle = 'Notes';
  } else if (typeFilter === 'IMAGE') {
    pageTitle = 'Images';
  } else if (typeFilter === 'PDF') {
    pageTitle = 'PDFs';
  }

  return (
    <div className="p-4 md:p-6 min-h-screen overflow-hidden space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/Vault')}
            className="p-2 bg-white rounded-lg border border-purple-100 text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {pageIcon}
            <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">
              {filteredItems.length}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-medium flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Quick Capture
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Filters bar */}
        {isAll && (
          <div className="flex gap-2 overflow-x-auto pb-2 flex-nowrap w-full md:w-auto scrollbar-hide">
            <button 
              onClick={() => navigate(`/Vault/all${searchFilter ? `?search=${searchFilter}` : ''}`)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${!typeFilter ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-purple-100 hover:bg-purple-50'}`}
            >
              All Types
            </button>
            <button 
              onClick={() => navigate(`/Vault/all?type=NOTE${searchFilter ? `&search=${searchFilter}` : ''}`)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${typeFilter === 'NOTE' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-purple-100 hover:bg-blue-50'}`}
            >
              <FileText className="w-4 h-4" /> Notes
            </button>
            <button 
              onClick={() => navigate(`/Vault/all?type=IMAGE${searchFilter ? `&search=${searchFilter}` : ''}`)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${typeFilter === 'IMAGE' ? 'bg-fuchsia-500 text-white border-fuchsia-500' : 'bg-white text-gray-600 border-purple-100 hover:bg-fuchsia-50'}`}
            >
              <ImageIcon className="w-4 h-4" /> Images
            </button>
            <button 
              onClick={() => navigate(`/Vault/all?type=PDF${searchFilter ? `&search=${searchFilter}` : ''}`)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${typeFilter === 'PDF' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-purple-100 hover:bg-orange-50'}`}
            >
              <File className="w-4 h-4" /> PDFs
            </button>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs ml-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-purple-100 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search..."
          />
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredItems.map(item => (
            <VaultCard 
              key={item._id} 
              item={item} 
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
              onClick={openEditModal}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-purple-100 shadow-sm">
          {isInbox ? (
            <>
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <Archive className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Inbox is empty</h3>
              <p className="text-gray-500">Everything is organized. Nice!</p>
            </>
          ) : isFavorites ? (
            <>
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">No favorites yet</h3>
              <p className="text-gray-500">Star important Vault items to find them quickly.</p>
            </>
          ) : searchFilter ? (
            <>
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">No results found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Your Vault Hub is empty</h3>
              <p className="text-gray-500 mb-6">Save notes, screenshots and PDFs here so you can find them whenever you need them.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-100 text-purple-700 px-5 py-2.5 rounded-lg font-medium hover:bg-purple-200 transition-colors"
              >
                + Quick Capture
              </button>
            </>
          )}
        </div>
      )}

      <QuickCaptureModal 
        isOpen={isModalOpen} 
        onClose={closeEditModal} 
        editItem={editItem}
      />
    </div>
  );
};

export default VaultList;
