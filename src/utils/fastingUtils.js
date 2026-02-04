
/**
 * Get Hijri date information for a given Gregorian date
 * @param {Date} date 
 * @returns {{ day: number, month: number, year: number }}
 */
export const getHijriDate = (date) => {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    const parts = formatter.formatToParts(date);
    const hijri = {};
    parts.forEach(part => {
        if (part.type !== 'literal') {
            hijri[part.type] = parseInt(part.value, 10);
        }
    });

    return hijri;
};

/**
 * Check if the date is Monday or Thursday
 * @param {Date} date 
 * @returns {boolean}
 */
export const isMondayOrThursday = (date) => {
    const day = date.getDay();
    return day === 1 || day === 4;
};

/**
 * Check if the date is a "White Day" (13, 14, or 15 of Hijri month)
 * @param {Date} date 
 * @returns {boolean}
 */
export const isWhiteDay = (date) => {
    const hijri = getHijriDate(date);
    return hijri.day >= 13 && hijri.day <= 15;
};

/**
 * Check if the date is in Ramadan
 * @param {Date} date 
 * @returns {boolean}
 */
export const isRamadan = (date) => {
    const hijri = getHijriDate(date);
    return hijri.month === 9;
};

/**
 * Determine the target date for the fasting prompt
 * If it's evening (>= 17:00), target is tomorrow.
 * If it's early morning (< 05:00), target is today.
 * Otherwise, status is usually hidden (or it's too late to fast today).
 * @returns {Date|null}
 */
export const getTargetFastingDate = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 0 && hour < 5) {
        return new Date(now);
    } else if (hour >= 17) {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return tomorrow;
    }

    return null;
};

/**
 * Get default intention based on date and user preferences
 * @param {Date} date 
 * @param {Object} preferences - userProfile preferences
 * @returns {boolean}
 */
export const getDefaultIntention = (date, preferences = {}) => {
    const { fastingDefaults = {} } = preferences;

    if (isRamadan(date)) {
        return fastingDefaults.ramadan ?? true;
    }

    const isSunnah = isMondayOrThursday(date);
    const isWhite = isWhiteDay(date);

    if (isSunnah || isWhite) {
        const sunnahPref = fastingDefaults.sunnah ?? true;
        const whitePref = fastingDefaults.whiteDays ?? true;

        if (isSunnah && sunnahPref) return true;
        if (isWhite && whitePref) return true;

        // If it's a special day but all applicable specific prefs are false, return false
        return false;
    }

    return false; // Default to no for other days
};
