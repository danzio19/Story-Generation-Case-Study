
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * @param {string} endpoint - The API endpoint to call 
 * @param {object} options - Optional fetch options (method, headers, body)
 * @returns {Promise<any>} - The JSON response from the API
 */
async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch from API:", error);
        throw error;
    }
}


export const getStories = () => {
    return fetchApi('/stories');
};

export const getStoryById = (id) => {
    return fetchApi(`/stories/${id}`);
};

export const createStoryFromTopic = (topic) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic }),
    };
    return fetchApi('/stories', options);
};
