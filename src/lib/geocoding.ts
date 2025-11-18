// Geocoding utility for converting addresses to coordinates
// Using Nominatim (OpenStreetMap) for free geocoding

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface GeocodingError {
  error: string;
  message: string;
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

// Cache para almacenar resultados de geocoding
const geocodingCache = new Map<string, GeocodingResult>();

/**
 * Realiza geocoding de una dirección usando Nominatim
 * @param address - Dirección a geocodificar
 * @param city - Ciudad (opcional)
 * @param country - País (por defecto Ecuador)
 * @returns Promesa con las coordenadas o error
 */
export async function geocodeAddress(
  address: string,
  city?: string,
  country: string = "Ecuador"
): Promise<GeocodingResult | GeocodingError> {
  try {
    // Crear clave de caché
    const cacheKey = `${address},${city || ""},${country}`.toLowerCase();
    
    // Verificar caché
    if (geocodingCache.has(cacheKey)) {
      return geocodingCache.get(cacheKey)!;
    }

    // Construir query
    let query = address;
    if (city) {
      query += `, ${city}`;
    }
    query += `, ${country}`;

    // Realizar petición a Nominatim
    const response = await fetch(
      `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'LubriSmart-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return {
        error: 'NOT_FOUND',
        message: 'No se encontraron resultados para la dirección proporcionada'
      };
    }

    const result: GeocodingResult = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
      address: data[0].address || {}
    };

    // Guardar en caché
    geocodingCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error en geocoding:', error);
    return {
      error: 'REQUEST_FAILED',
      message: 'Error al conectar con el servicio de geocoding'
    };
  }
}

/**
 * Geocodificación inversa - obtener dirección a partir de coordenadas
 * @param lat - Latitud
 * @param lon - Longitud
 * @returns Promesa con la dirección o error
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | GeocodingError> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'LubriSmart-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return {
        error: 'NOT_FOUND',
        message: 'No se encontró dirección para las coordenadas proporcionadas'
      };
    }

    return data.display_name;
  } catch (error) {
    console.error('Error en reverse geocoding:', error);
    return {
      error: 'REQUEST_FAILED',
      message: 'Error al conectar con el servicio de geocoding inverso'
    };
  }
}

/**
 * Geocodificar múltiples direcciones de forma eficiente
 * @param addresses - Array de direcciones a geocodificar
 * @returns Promesa con array de resultados
 */
export async function batchGeocode(
  addresses: Array<{ address: string; city?: string; id: string }>
): Promise<Array<{ id: string; result: GeocodingResult | GeocodingError }>> {
  const results = [];
  
  // Procesar en lotes pequeños para no sobrecargar el servicio
  const batchSize = 5;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async ({ address, city, id }) => ({
        id,
        result: await geocodeAddress(address, city)
      }))
    );
    results.push(...batchResults);
    
    // Esperar un poco entre lotes para ser respetuoso con el servicio
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Limpiar la caché de geocoding
 */
export function clearGeocodingCache(): void {
  geocodingCache.clear();
}

/**
 * Verificar si un resultado es un error
 */
export function isGeocodingError(result: any): result is GeocodingError {
  return result && typeof result.error === 'string';
}

/**
 * Obtener coordenadas para ciudades comunes de Ecuador
 */
export const ecuadorCities: Record<string, { lat: number; lon: number }> = {
  'quito': { lat: -0.1807, lon: -78.4678 },
  'guayaquil': { lat: -2.1894, lon: -79.8891 },
  'cuenca': { lat: -2.9009, lon: -79.0045 },
  'ambato': { lat: -1.2417, lon: -78.6197 },
  'riobamba': { lat: -1.6744, lon: -78.6483 },
  'latacunga': { lat: -0.9333, lon: -78.6167 },
  'ibarra': { lat: 0.3517, lon: -77.8300 },
  'loja': { lat: -4.0000, lon: -79.2000 },
  'machala': { lat: -3.2667, lon: -79.9667 },
  'esmeraldas': { lat: 0.9667, lon: -79.6500 },
  'manta': { lat: -0.9500, lon: -80.7333 },
  'portoviejo': { lat: -1.0500, lon: -80.4500 },
  'babahoyo': { lat: -1.8000, lon: -79.5333 },
  'santo domingo': { lat: -0.2500, lon: -79.1667 },
  'quevedo': { lat: -1.0333, lon: -79.4667 },
  'la maná': { lat: -0.9500, lon: -79.2833 }
};

/**
 * Obtener coordenadas para una ciudad ecuatoriana
 */
export function getEcuadorCityCoordinates(cityName: string): { lat: number; lon: number } | null {
  const normalizedCity = cityName.toLowerCase().trim();
  return ecuadorCities[normalizedCity] || null;
}