import React, { useState, useEffect, useCallback } from 'react';
import { Award, Trophy, Flame, Target } from 'lucide-react';
import axios from 'axios';
import { logger } from '../utils/logger';
import { API_BASE as API_ROOT, getAuthHeaders as getStoredAuthHeaders } from '../utils/api';
import { useOutletContext } from 'react-router-dom';

const API_BASE = `${API_ROOT}/badges`;

const FALLBACK_BADGES = [
  { name: "Starter", streakRequired: 3, icon: "🌱", description: "Complete 3 days in a row" },
  { name: "Week Warrior", streakRequired: 7, icon: "🔥", description: "Complete 7 days in a row" },
  { name: "Fortnight Fighter", streakRequired: 14, icon: "⚡", description: "Complete 14 days in a row" },
  { name: "Monthly Master", streakRequired: 30, icon: "⭐", description: "Complete 30 days in a row" },
  { name: "Two Month Titan", streakRequired: 60, icon: "💎", description: "Complete 60 days in a row" },
  { name: "Century Champion", streakRequired: 100, icon: "👑", description: "Complete 100 days in a row" },
  { name: "Half Year Hero", streakRequired: 180, icon: "🏆", description: "Complete 180 days in a row" },
  { name: "Year Warrior", streakRequired: 365, icon: "🌟", description: "Complete 365 days in a row" },
];

const Badges = () => {
  const { onLogout } = useOutletContext();
  const [userBadges, setUserBadges] = useState(null);
  const [badgeMapping, setBadgeMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('earned');

  const getHeaders = () => {
    const headers = getStoredAuthHeaders();
    if (!headers.Authorization) throw new Error('No auth token found');
    return headers;
  };

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      const [badgesRes, mappingRes] = await Promise.all([
        axios.get(`${API_BASE}/user`, { headers: getHeaders() }),
        axios.get(`${API_BASE}/mapping`, { headers: getHeaders() }),
      ]);

      if (badgesRes.data.success) {
        setUserBadges(badgesRes.data.data);
      }
      if (mappingRes.data.success) {
        setBadgeMapping(mappingRes.data.data);
      }
    } catch (error) {
      logger.warn('Failed to fetch badges', { status: error?.response?.status, message: error?.message });
      if (error?.response?.status === 401) onLogout?.();
      setUserBadges({ badges: [], streak: 0, nextBadge: null });
      setBadgeMapping({ badges: [], currentStreak: 0 });
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
          <Trophy className="text-yellow-500 w-8 h-8" />
          Badges & Achievements
        </h1>
        <p className="text-sm text-gray-500 ml-10">
          Track your progress and unlock achievements
        </p>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6 border border-orange-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Flame className="text-orange-500 w-5 h-5" />
              Current Streak
            </h2>
            <p className="text-sm text-gray-600 mt-1">Keep it going!</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-600 flex items-center gap-2">
              <Flame className="w-8 h-8" />
              {userBadges?.streak || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">days in a row</p>
          </div>
        </div>
        {userBadges?.nextBadge && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <p className="text-sm text-gray-700 mb-2">
              <Target className="inline w-4 h-4 mr-1" />
              Next badge: <span className="font-semibold">{userBadges.nextBadge.name}</span> at {userBadges.nextBadge.streakRequired} days
            </p>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((userBadges.streak || 0) / userBadges.nextBadge.streakRequired) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {userBadges.nextBadge.streakRequired - (userBadges.streak || 0)} days to go!
            </p>
          </div>
        )}
        {!userBadges?.nextBadge && (userBadges?.streak || 0) === 0 && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <p className="text-sm text-gray-700">
              <Target className="inline w-4 h-4 mr-1" />
              Complete all your daily habits to start your streak!
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6 bg-purple-50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('earned')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'earned'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          Earned Badges ({userBadges?.badges?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          All Badges
        </button>
      </div>

      {activeTab === 'earned' && (
        <div>
          {!userBadges || !userBadges.badges || userBadges.badges.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-100">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No badges yet</h3>
              <p className="text-gray-500 mb-4">
                Complete all your daily habits to start earning badges!
              </p>
              <p className="text-sm text-gray-400">
                Your first badge unlocks at 3 days!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userBadges.badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300 shadow-lg transform hover:scale-105 transition-all"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3 animate-bounce">{badge.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    <div className="inline-block bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {badge.streakRequired ?? badge.streak_required} days
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        Earned: {(badge.earnedAt ?? badge.earned_at)
                          ? new Date(badge.earnedAt ?? badge.earned_at).toLocaleDateString()
                          : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div>
          {(!badgeMapping || badgeMapping.badges.length === 0) ? (
            <div className="space-y-4">
              {FALLBACK_BADGES.map((badge, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm transition-all hover:border-purple-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl opacity-30">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {badge.streakRequired} days required
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {badgeMapping.badges.map((badge, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 border-2 shadow-sm transition-all ${
                badge.earned
                  ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-5xl ${badge.earned ? 'animate-pulse' : 'opacity-30'}`}>
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{badge.name}</h3>
                    {badge.earned && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {badge.streakRequired} days required
                      </span>
                    </div>
                    {!badge.earned && (
                      <div className="flex-1 max-w-xs">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {badgeMapping.currentStreak} / {badge.streakRequired} days
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Badges;
