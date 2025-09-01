
import React, { useState } from 'react';
import { createStoryFromTopic } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

function NewStoryForm({ onSuccess }) {
    const [topic, setTopic] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!topic.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const newStory = await createStoryFromTopic(topic);
            if (onSuccess) {
                onSuccess(newStory);
            }
            navigate(`/story/${newStory.id}`);
        } catch (e) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">Create a New Story</h2>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic..."
                        className="flex-grow bg-slate-700 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Generating...' : 'Create Story'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4">Error: {error}</p>}
            </form>
        </div>
    );
}

export default NewStoryForm;