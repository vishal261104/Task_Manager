import React from 'react';
import { FileText, Image as ImageIcon, File, Star, Clock, MoreVertical, Tag as TagIcon, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const VaultCard = ({ item, onToggleFavorite, onClick, onDelete }) => {
  const isNote = item.type === 'NOTE';
  const isImage = item.type === 'IMAGE';
  const isPdf = item.type === 'PDF';

  const timeAgo = item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : '';

  return (
    <div 
      className="group relative p-4 rounded-xl shadow-sm bg-white border border-purple-100 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
      onClick={() => onClick(item)}
    >
      {/* Top right actions */}
      <div className="absolute -top-3 -right-3 flex items-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => onToggleFavorite(item._id, !item.isFavorite)}
          className={`p-2 rounded-full transition-colors bg-white shadow-sm border border-purple-100 ${item.isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-purple-50'}`}
        >
          <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this item?')) {
              onDelete(item._id);
            }
          }}
          className="p-2 rounded-full bg-white shadow-sm border border-red-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg shrink-0 ${
          isNote ? 'bg-blue-100 text-blue-600' :
          isImage ? 'bg-fuchsia-100 text-fuchsia-600' :
          'bg-orange-100 text-orange-600'
        }`}>
          {isNote && <FileText className="w-5 h-5" />}
          {isImage && <ImageIcon className="w-5 h-5" />}
          {isPdf && <File className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 line-clamp-2 break-words" title={item.title}>
            {item.title}
          </h3>
          {isPdf && item.fileName && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{item.fileName}</p>
          )}
        </div>
      </div>

      {isImage && item.fileUrl && (
        <a 
          href={item.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()}
          className="w-full h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 block hover:opacity-90 transition-opacity"
        >
          <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
        </a>
      )}

      {isNote && item.description && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-grow">
          {item.description}
        </p>
      )}

      {!isNote && !isImage && item.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
          {item.description}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-purple-50 flex items-center justify-between">
        <div className="flex flex-wrap gap-1 items-center max-w-[70%]">
          {item.tags && item.tags.length > 0 ? (
            item.tags.slice(0, 2).map(tag => (
              <span key={tag._id} className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TagIcon className="w-3 h-3" /> {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No tags</span>
          )}
          {item.tags && item.tags.length > 2 && (
            <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              +{item.tags.length - 2}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;
