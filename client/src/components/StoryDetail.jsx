
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoryById } from '../services/apiService';

function StoryDetail() {
    const { id } = useParams();

    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadStory() {
            try {
                const data = await getStoryById(id);
                setStory(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        loadStory();
    }, [id]);

    if (loading) {
        return <p className="text-center text-slate-400">Loading story...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error fetching story: {error}</p>;
    }

    if (!story) {
        return <p>Story not found.</p>;
    }

    return (
        <article className="space-y-6">
            <Link to="/" className="text-blue-400 hover:underline">&larr; Back to all stories</Link>

            <h1 className="text-4xl font-bold text-white">{story.title}</h1>

            <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">
                {story.text}
            </p>

            <div className="border-t border-slate-700 pt-6">
                <h2 className="text-2xl font-semibold mb-4">Comprehension Questions</h2>
                <ul className="space-y-4">
                    {story.questions.map((q, index) => (
                        <li key={index} className="bg-slate-800 p-4 rounded-lg">
                            <p className="font-semibold">{q.question}</p>
                            <p className="text-slate-400 mt-1"><strong>Answer:</strong> {q.answer}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}

export default StoryDetail;