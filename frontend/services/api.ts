const API_URL = "http://127.0.0.1:8000/api/";

const headersList = {
  Accept: "application/json",
  "User-Agent": "YourApp",
};

const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET", 
      headers: headersList,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};


export default fetchApi;