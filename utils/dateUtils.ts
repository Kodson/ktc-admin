/**
 * Shared date and week utility functions for KTC Energy Management System
 * Resolves duplicate function declarations across reporting components
 */

// Utility functions for week calculations
export const getCurrentWeekOfMonth = (): number => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysSinceFirstDay = Math.floor((now.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysSinceFirstDay / 7) + 1;
};

export const getCurrentMonthYear = () => {
  const now = new Date();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                     'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return {
    month: monthNames[now.getMonth()],
    year: now.getFullYear()
  };
};

// Generate available months with year format (JAN/22, FEB/23, etc.)
export const generateAvailableMonths = () => {
  const months = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Generate months from January 2022 to current month
  for (let year = 2022; year <= currentYear; year++) {
    const startMonth = year === 2022 ? 0 : 0; // Start from January for all years
    const endMonth = year === currentYear ? currentMonth : 11; // Up to current month in current year
    
    for (let month = startMonth; month <= endMonth; month++) {
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                         'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const yearShort = year.toString().slice(-2); // Get last 2 digits of year
      
      months.push({
        value: `${monthNames[month].toLowerCase()}-${year}`,
        label: `${monthNames[month]}/${yearShort}`,
        month: monthNames[month],
        year: year,
        monthIndex: month
      });
    }
  }
  
  return months.reverse(); // Most recent first
};

// Generate weeks for a specific month and year
export const generateWeeksForMonth = (year: number, monthIndex: number) => {
  const weeks = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const isCurrentMonth = year === currentYear && monthIndex === currentMonth;
  
  // Get number of weeks for the selected month
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const weeksInMonth = Math.ceil(totalDays / 7);
  
  // For current month, only show weeks up to current week
  const maxWeeks = isCurrentMonth ? getCurrentWeekOfMonth() : weeksInMonth;
  
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                     'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthName = monthNames[monthIndex];
  
  for (let i = 1; i <= maxWeeks; i++) {
    weeks.push({
      value: `${monthName.toLowerCase()}-${year}-week-${i}`,
      label: `${monthName} WEEK ${i}`,
      weekNumber: i,
      month: monthName,
      year: year,
      monthIndex: monthIndex
    });
  }
  
  return weeks;
};

export const generateWeeksUpToCurrent = () => {
  const currentWeek = getCurrentWeekOfMonth();
  const { month } = getCurrentMonthYear();
  const weeks = [];
  
  for (let i = 1; i <= currentWeek; i++) {
    weeks.push({
      value: `${month.toLowerCase()}-week-${i}`,
      label: `${month} WEEK ${i}`,
      weekNumber: i,
      month: month
    });
  }
  
  return weeks;
};

export const getWeekDateRange = (weekNumber: number, year?: number, monthIndex?: number) => {
  // Use provided year/month or default to current
  const targetYear = year || new Date().getFullYear();
  const targetMonth = monthIndex !== undefined ? monthIndex : new Date().getMonth();
  
  const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
  const startOfWeek = new Date(firstDayOfMonth);
  startOfWeek.setDate(firstDayOfMonth.getDate() + (weekNumber - 1) * 7);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  // Don't exceed the month boundaries
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0);
  if (endOfWeek > lastDayOfMonth) {
    endOfWeek.setTime(lastDayOfMonth.getTime());
  }
  
  // Format dates
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };
  
  return `(${formatDate(startOfWeek)} - ${formatDate(endOfWeek)})`;
};

// Format currency consistently across the application
export const formatCurrency = (amount: number | string): string => {
  if (!amount && amount !== 0) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₵${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format numbers consistently across the application
export const formatNumber = (value: number | string): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Get time period for a specific week (helper for display)
export const getWeekTimePeriod = (weekNumber: number, year: number, monthIndex: number): string => {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startOfWeek = new Date(firstDayOfMonth);
  startOfWeek.setDate(firstDayOfMonth.getDate() + (weekNumber - 1) * 7);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  // Don't exceed the month boundaries
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  if (endOfWeek > lastDayOfMonth) {
    endOfWeek.setTime(lastDayOfMonth.getTime());
  }
  
  // Format as "Mon DD - Sun DD" or "Mon DD - Fri DD" etc.
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDay = dayNames[startOfWeek.getDay()];
  const endDay = dayNames[endOfWeek.getDay()];
  const startDate = startOfWeek.getDate();
  const endDate = endOfWeek.getDate();
  
  return `${startDay} ${startDate} - ${endDay} ${endDate}`;
};