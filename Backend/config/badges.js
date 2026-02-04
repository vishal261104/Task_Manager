export const BADGE_MILESTONES = [
  { name: "Starter", streakRequired: 3, icon: "🌱", description: "Complete 3 days in a row" },
  { name: "Week Warrior", streakRequired: 7, icon: "🔥", description: "Complete 7 days in a row" },
  { name: "Fortnight Fighter", streakRequired: 14, icon: "⚡", description: "Complete 14 days in a row" },
  { name: "Monthly Master", streakRequired: 30, icon: "⭐", description: "Complete 30 days in a row" },
  { name: "Two Month Titan", streakRequired: 60, icon: "💎", description: "Complete 60 days in a row" },
  { name: "Century Champion", streakRequired: 100, icon: "👑", description: "Complete 100 days in a row" },
  { name: "Half Year Hero", streakRequired: 180, icon: "🏆", description: "Complete 180 days in a row" },
  { name: "Year Warrior", streakRequired: 365, icon: "🌟", description: "Complete 365 days in a row" },
];

export const getBadgeByStreak = (streakRequired) => {
  return BADGE_MILESTONES.find(badge => badge.streakRequired === streakRequired);
};

export const getEarnedBadges = (streak) => {
  return BADGE_MILESTONES.filter(badge => streak >= badge.streakRequired);
};

export const getNextBadge = (streak) => {
  return BADGE_MILESTONES.find(badge => streak < badge.streakRequired);
};
