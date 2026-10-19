export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface GreetingResult {
  greeting: string;
  periodText: string;
  timeOfDay: TimeOfDay;
}

/**
 * Returns a localized greeting based on the current hour of the day.
 * 05:00 - 11:59: Morning
 * 12:00 - 17:59: Afternoon
 * 18:00 - 04:59: Evening
 */
export function getGreeting(name?: string | null, lang: 'vi' | 'en' = 'vi'): GreetingResult {
  const currentHour = new Date().getHours();
  let timeOfDay: TimeOfDay;
  let periodTextVi: string;
  let periodTextEn: string;

  if (currentHour >= 5 && currentHour < 12) {
    timeOfDay = 'morning';
    periodTextVi = 'buổi sáng';
    periodTextEn = 'morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    timeOfDay = 'afternoon';
    periodTextVi = 'buổi chiều';
    periodTextEn = 'afternoon';
  } else {
    timeOfDay = 'evening';
    periodTextVi = 'buổi tối';
    periodTextEn = 'evening';
  }

  const cleanName = name?.trim();

  let greeting: string;
  if (lang === 'en') {
    const capitalizedPeriod = periodTextEn.charAt(0).toUpperCase() + periodTextEn.slice(1);
    greeting = cleanName ? `Good ${capitalizedPeriod}, ${cleanName} 👋` : `Good ${capitalizedPeriod} 👋`;
    return {
      greeting,
      periodText: periodTextEn,
      timeOfDay,
    };
  }

  // Vietnamese
  greeting = cleanName ? `Chào ${periodTextVi}, ${cleanName} 👋` : `Chào ${periodTextVi} 👋`;
  return {
    greeting,
    periodText: periodTextVi,
    timeOfDay,
  };
}
