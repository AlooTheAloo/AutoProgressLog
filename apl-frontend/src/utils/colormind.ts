/**
 * Utility functions for interacting with the Colormind API
 * http://colormind.io/api-access/
 */

const COLORMIND_API_URL = "http://colormind.io/api/";
const FALLBACK_COLORS = ["#FF0000", "#D57AFF", "#74B4FF"];

/**
 * Convert RGB array to hex color string
 */
function rgbToHex(rgb: number[]): string {
  return "#" + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * Fetch a color palette from Colormind API
 * Returns an array of 3 hex color strings suitable for gradients
 */
export async function getGradientColors(): Promise<string[]> {
  try {
    const response = await fetch(COLORMIND_API_URL, {
      method: "POST",
      body: JSON.stringify({
        model: "default"
      })
    });

    if (!response.ok) {
      throw new Error(`Colormind API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Colormind returns 5 colors, we'll use the first 3 for our gradient
    if (data.result && Array.isArray(data.result) && data.result.length >= 3) {
      return data.result.slice(0, 3).map((rgb: number[]) => rgbToHex(rgb));
    }

    throw new Error("Invalid response format from Colormind API");
  } catch (error) {
    console.error("Failed to fetch colors from Colormind API:", error);
    return FALLBACK_COLORS;
  }
}
