import React, { useEffect, useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';

const StreakAnimation = ({ streak, badgesEarned = [], onClose }) => {
  const [show, setShow] = useState(true);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    const badgeTimer = setTimeout(() => {
      if (badgesEarned.length > 0) {
        setShowBadges(true);
      }
    }, 1500);

    const closeTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onClose(), 300);
    }, badgesEarned.length > 0 ? 5000 : 3000);

    return () => {
      clearTimeout(badgeTimer);
      clearTimeout(closeTimer);
    };
  }, [badgesEarned.length, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-orange-200 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <button
          onClick={() => {
            setShow(false);
            setTimeout(() => onClose(), 300);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <Flame className="w-20 h-20 text-orange-500 animate-bounce" />
            </div>
            <Sparkles className="absolute top-0 left-1/4 w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-orange-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            <Sparkles className="absolute bottom-0 left-1/3 w-5 h-5 text-red-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
            <Sparkles className="absolute bottom-0 right-1/3 w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.8s' }} />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent mb-2 animate-pulse">
            🔥 STREAK! 🔥
          </h2>
          <p className="text-xl text-gray-700 mb-4">Your streak is now</p>
          <div className="text-6xl md:text-7xl font-bold text-orange-600 mb-2 transform scale-110 animate-bounce">
            {streak}
          </div>
          <p className="text-lg text-gray-600">days in a row!</p>
        </div>

        {showBadges && badgesEarned.length > 0 && (
          <div className="mt-8 pt-8 border-t-2 border-orange-200 animate-slideUp">
            <p className="text-center text-lg font-semibold text-gray-800 mb-4">
              🎉 New Badge{badgesEarned.length > 1 ? 's' : ''} Earned! 🎉
            </p>
            <div className="space-y-3">
              {badgesEarned.map((badge, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-yellow-300 shadow-lg transform scale-100 hover:scale-105 transition-transform animate-slideUp"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakAnimation;
