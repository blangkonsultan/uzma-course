"use server";

export async function extractCoordinatesFromUrl(url: string) {
  try {
    let finalUrl = url;

    // Follow redirect if it's a short URL
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      finalUrl = response.url;
      
      // Fallback to GET if HEAD doesn't resolve fully (sometimes happens with JS redirects or certain setups)
      if (finalUrl === url || finalUrl.includes('maps.app.goo.gl') || finalUrl.includes('goo.gl')) {
          const getResponse = await fetch(url, { method: 'GET', redirect: 'follow' });
          finalUrl = getResponse.url;
      }
    }

    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(regex);

    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      };
    }

    return { error: 'Could not extract coordinates from the provided URL.' };
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return { error: 'Failed to extract coordinates due to an error.' };
  }
}
