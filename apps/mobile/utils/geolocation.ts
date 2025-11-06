/**
 * IP-based geolocation to determine user region
 * Used to show/hide GDPR-specific UI elements
 */

// EU country codes (including UK, Switzerland, Norway, Iceland, Liechtenstein)
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'GB', // UK (post-Brexit but similar laws)
  'CH', // Switzerland
  'NO', // Norway
  'IS', // Iceland
  'LI', // Liechtenstein
];

interface GeolocationResponse {
  country_code: string;
  country_name: string;
}

export const detectUserRegion = async (): Promise<string> => {
  try {
    // Using ip-api.com (free, no API key needed, 45 requests/minute)
    const response = await fetch('http://ip-api.com/json/?fields=countryCode,country');
    
    if (!response.ok) {
      console.warn('Geolocation API failed, defaulting to US');
      return 'US';
    }

    const data: GeolocationResponse = await response.json();
    const countryCode = data.country_code;

    if (EU_COUNTRIES.includes(countryCode)) {
      return 'EU';
    } else if (countryCode === 'US') {
      return 'US';
    } else {
      return 'OTHER';
    }
  } catch (error) {
    console.error('Failed to detect user region:', error);
    // Default to US (most permissive, hide GDPR stuff)
    return 'US';
  }
};

/**
 * Alternative: Use ipapi.co (requires account but more reliable)
 */
export const detectUserRegionIPAPI = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code;

    if (EU_COUNTRIES.includes(countryCode)) {
      return 'EU';
    } else if (countryCode === 'US') {
      return 'US';
    } else {
      return 'OTHER';
    }
  } catch (error) {
    console.error('Failed to detect user region:', error);
    return 'US';
  }
};

