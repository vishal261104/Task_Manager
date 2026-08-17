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
      className="group relative p-4 md:p-5 rounded-2xl shadow-sm bg-white border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer min-h-[140px]"
      onClick={() => onClick(item)}
    >
      {/* Main content area */}
      <div className="flex gap-4 items-start">
        {/* Left column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              isNote ? 'bg-blue-100 text-blue-600' :
              isImage ? 'bg-fuchsia-100 text-fuchsia-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              {isNote && <FileText className="w-5 h-5" />}
              {isImage && <ImageIcon className="w-5 h-5" />}
              {isPdf && <File className="w-5 h-5" />}
            </div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 break-words" title={item.title}>
              {item.title}
            </h3>
          </div>

          {(isPdf && item.fileName) && (
            <p className="text-xs text-gray-500 truncate mt-2">{item.fileName}</p>
          )}

          {item.description && (
            <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mt-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Right column: Image Thumbnail */}
        {isImage && item.fileUrl && (
          <a 
            href={item.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={(e) => e.stopPropagation()}
            className="w-16 h-12 md:w-24 md:h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden block hover:opacity-90 transition-opacity mt-1"
          >
            <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {item.tags && item.tags.length > 0 ? (
          item.tags.slice(0, 3).map(tag => (
            <span key={tag._id} className="text-[10px] md:text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
              {tag.name}
            </span>
          ))
        ) : null}
        {item.tags && item.tags.length > 3 && (
          <span className="text-[10px] md:text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
            +{item.tags.length - 3}
          </span>
        )}
      </div>

      {/* Bottom area */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeAgo}</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => onToggleFavorite(item._id, !item.isFavorite)}
            className={`p-1.5 rounded-full transition-colors ${item.isFavorite ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-purple-50'}`}
          >
            <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                onDelete(item._id);
              }
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;
