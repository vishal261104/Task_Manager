import React, { useState, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, File, Paperclip, UploadCloud } from 'lucide-react';
import TiptapEditor from './TiptapEditor';
import { useVaultStore } from '../store/vaultStore';

const QuickCaptureModal = ({ isOpen, onClose, initialType = 'NOTE', editItem = null }) => {
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(null); // Tiptap JSON
  const [file, setFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInbox, setIsInbox] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  const { createVaultItem, updateVaultItem, tags, fetchTags, createTag } = useVaultStore();

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      setNewTagInput('');
      if (editItem) {
        setType(editItem.type);
        setTitle(editItem.title || '');
        setDescription(editItem.description || '');
        setContent(editItem.content || null);
        setIsFavorite(editItem.isFavorite || false);
        setIsInbox(editItem.isInbox || false);
        setSelectedTags(editItem.tags ? editItem.tags.map(t => t._id) : []);
        setFile(null);
      } else {
        setType(initialType);
        setTitle('');
        setDescription('');
        setContent(null);
        setFile(null);
        setSelectedTags([]);
        setIsFavorite(false);
        setIsInbox(true);
      }
      setError('');
    }
  }, [isOpen, editItem, initialType, fetchTags]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;
    try {
      const newTag = await createTag(newTagInput.trim());
      if (newTag) {
        setSelectedTags(prev => [...prev, newTag._id]);
      }
      setNewTagInput('');
    } catch (err) {
      console.error('Failed to create tag', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!editItem && (type === 'IMAGE' || type === 'PDF') && !file) {
      setError('File is required for this type');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('description', description);
      formData.append('isFavorite', isFavorite);
      formData.append('isInbox', isInbox);
      formData.append('tags', JSON.stringify(selectedTags));
      
      if (type === 'NOTE' && content) {
        formData.append('content', JSON.stringify(content));
      }

      if (file) {
        formData.append('file', file);
      }

      if (editItem) {
        await updateVaultItem(editItem._id, formData);
      } else {
        await createVaultItem(formData);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100">
          <h2 className="text-xl font-bold text-gray-800">
            {editItem ? 'Edit Vault' : 'Quick Capture'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!editItem && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('NOTE')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  type === 'NOTE' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 hover:border-purple-200 text-gray-500'
                }`}
              >
                <FileText className="w-6 h-6 mb-2" />
                <span className="font-medium text-sm">Note</span>
              </button>
              <button
                type="button"
                onClick={() => setType('IMAGE')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  type === 'IMAGE' ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-gray-100 hover:border-fuchsia-200 text-gray-500'
                }`}
              >
                <ImageIcon className="w-6 h-6 mb-2" />
                <span className="font-medium text-sm">Image</span>
              </button>
              <button
                type="button"
                onClick={() => setType('PDF')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  type === 'PDF' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 hover:border-orange-200 text-gray-500'
                }`}
              >
                <File className="w-6 h-6 mb-2" />
                <span className="font-medium text-sm">PDF</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What are you saving?"
                className="w-full px-4 py-2.5 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {type === 'NOTE' ? (
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="flex-1 min-h-[300px]">
                  <TiptapEditor content={content} onChange={setContent} />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                {editItem && editItem.fileUrl && !file && (
                  <div className="mb-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Current File</label>
                    {type === 'IMAGE' ? (
                      <a href={editItem.fileUrl} target="_blank" rel="noopener noreferrer" className="relative h-40 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity" title="Click to view full image in new tab">
                        <img src={editItem.fileUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                      </a>
                    ) : (
                      <a href={editItem.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                        <File className="w-5 h-5" />
                        <span className="font-medium truncate text-sm">View Current PDF</span>
                      </a>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editItem ? 'Replace File (Optional)' : 'Attach File'} {(!editItem) && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative border-2 border-dashed border-purple-200 rounded-xl p-6 hover:bg-purple-50/50 transition-colors flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept={type === 'IMAGE' ? "image/*" : "application/pdf"}
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-purple-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {file ? file.name : `Click or drag to upload ${type === 'IMAGE' ? 'image' : 'PDF'}`}
                    </p>
                    {editItem && !file && (
                      <p className="text-xs text-gray-500 mt-1">Leave empty to keep current file</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag(); } }}
                    placeholder="Type a tag name and press Enter..."
                    className="flex-1 px-3 py-1.5 text-sm border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTagInput.trim()}
                    className="px-3 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-40 transition-colors"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] max-h-[80px] overflow-y-auto p-2 border border-purple-50 rounded-lg bg-gray-50">
                  {tags.map(tag => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => toggleTag(tag._id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag._id)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-600 border border-purple-100 hover:border-purple-300'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && <span className="text-xs text-gray-400 italic p-1">No tags yet — create one above</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Favorite</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInbox}
                  onChange={e => setIsInbox(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Save to Inbox</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-purple-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickCaptureModal;
