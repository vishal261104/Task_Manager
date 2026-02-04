import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DailyHabitsList from '../components/DailyHabitsList';
const DailyHabits = () => {
  const { onLogout } = useOutletContext();
  return (
    <div>
        <DailyHabitsList onLogout={onLogout} />
    </div>
  );
}
export default DailyHabits;