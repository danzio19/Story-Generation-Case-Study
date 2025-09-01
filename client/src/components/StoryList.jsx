
import React, { useState, useEffect } from 'react';
import { getStories } from '../services/apiService';
import { Link } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000/stories';

function StoryList() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // fetch data when the component loads
    useEffect(() => {
        async function loadStories() {
            try {

                const data = await getStories();
                setStories(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadStories();
    }, []);


    if (loading) {
        return <p className="text-center text-slate-400">Loading stories...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error fetching stories: {error}</p>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-slate-700 pb-2">
                Available Stories
            </h2>
            {stories.length === 0 ? (
                <p className="text-slate-400">No stories found yet. Why not create one?</p>
            ) : (
                <ul className="divide-y divide-slate-800">
                    {stories.map((story) => (
                        <Link key={story.id} to={`/story/${story.id}`}>
                            <li className="p-4 hover:bg-slate-800 rounded-md cursor-pointer transition-colors block">
                                <h3 className="text-xl font-bold">{story.title}</h3>
                                <p className="text-sm text-slate-500">
                                    Created on: {new Date(story.created_at).toLocaleDateString()}
                                </p>
                            </li>
                        </Link>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default StoryList;