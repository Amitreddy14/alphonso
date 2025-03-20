const API_KEY = import.meta.env.VITE_GOOGLE_NEWS_API_KEY;
const CX_ID = import.meta.env.VITE_GOOGLE_CX_ID;

export const fetchAgricultureNews = async (keywords = "agriculture farming, crops, India") => {
  try {
    if (!API_KEY || !CX_ID) {
      throw new Error("Missing API Key or CX ID. Please check your environment variables.");
    }

    const encodedKeywords = encodeURIComponent(keywords);
    
    // Log URL for debugging (without API Key)
    console.log(`Fetching: https://www.googleapis.com/customsearch/v1?q=${encodedKeywords}&cx=${CX_ID}&sort=date&num=10`);

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodedKeywords}&cx=${CX_ID}&key=${API_KEY}&sort=date&num=10`
    );

    if (!response.ok) {
      const errorMessage = `Failed to fetch news: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.items) {
      throw new Error("No news articles found for this query.");
    }

    return data.items;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};