
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getStoryById } from '../services/apiService';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';

function StoryViewPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const topic = location.state?.topic;

    const [story, setStory] = useState(null);
    // state for the text content as it streams in
    const [streamingContent, setStreamingContent] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
    const [error, setError] = useState(null);

    const ws = useRef(null);
    const effectRan = useRef(false);

    useEffect(() => {

        // to prevent ws errors in dev strict mode
        if (process.env.NODE_ENV === "development" && effectRan.current === true) {
        } else if (process.env.NODE_ENV !== "development") {
        } else {
            effectRan.current = true;
            return;
        }
        // streaming mode
        if (id === 'new' && topic) {
            setIsStreaming(true);
            const socket = new WebSocket("ws://127.0.0.1:8000/ws/generate-story-stream");
            ws.current = socket;

            socket.onopen = () => {
                console.log("WebSocket connected. Sending topic...");
                socket.send(JSON.stringify({ topic: topic }));
            };

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);

                if (message.type === 'token') {
                    setStreamingContent(prev => prev + message.payload);
                }
                else if (message.type === 'story_done') {
                    // the story stream is finished, now wait for metadata
                    setIsStreaming(false);
                    setIsGeneratingMetadata(true);
                }
                else if (message.type === 'complete') {
                    console.log("Process complete. Received final story:", message.payload);
                    toast.success("Story created successfully!");

                    const finalStory = message.payload;
                    setStory(finalStory);
                    setIsGeneratingMetadata(false);

                    navigate(`/story/${finalStory.id}`, { replace: true });
                }
                else if (message.type === 'error') {
                    setError(message.payload);
                    toast.error(message.payload);
                    setIsStreaming(false);
                    setIsGeneratingMetadata(false);
                }
            };

            socket.onerror = (event) => {
                console.error("WebSocket error observed:", event);
                setError("A connection error occurred.");
                toast.error("A WebSocket connection error occurred.");
                setIsStreaming(false);
                setIsGeneratingMetadata(false);
            };

            socket.onclose = () => {
                console.log("WebSocket connection closed.");

                setIsStreaming(false);
                setIsGeneratingMetadata(false);
            };

            // static generation mode
        } else if (id && id !== 'new') {
            setIsLoading(true);
            getStoryById(id)
                .then(data => setStory(data))
                .catch(err => {
                    setError(err.message);
                    toast.error(`Failed to load story: ${err.message}`);
                })
                .finally(() => setIsLoading(false));
        } else {
            navigate('/');
        }

        // cleanup
        return () => {
            if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
                console.log("Cleaning up and closing WebSocket.");
                ws.current.close();
            }
        };
    }, [id, topic, navigate]);


    if (isLoading) return <p className="text-center text-slate-400">Loading story...</p>;
    if (error) return <p className="text-center text-red-500">Error: {error}</p>;

    if (isLoading) return <p className="text-center text-slate-400">Loading story...</p>;
    if (error) return (
        <div className="text-center">
            <p className="text-red-500">Error: {error}</p>
            <Link to="/" className="mt-4 inline-block text-blue-400 hover:underline">Go back home</Link>
        </div>
    );

    // render the streaming view
    if (isStreaming || isGeneratingMetadata) {
        return (
            <article className="space-y-6">
                <h1 className="text-4xl font-bold text-white">
                    {isStreaming ? 'Writing Your Story...' : 'Finalizing Your Story...'}
                </h1>
                <p className="text-lg text-slate-400">Topic: <span className="text-white font-semibold">"{topic}"</span></p>

                <div className="bg-slate-800 p-6 rounded-lg min-h-[300px]">
                    <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {streamingContent}
                        {isStreaming && <span className="inline-block w-2 h-5 bg-white animate-pulse ml-1"></span>}
                    </p>
                </div>

                {isGeneratingMetadata && (
                    <div className="flex items-center justify-center p-4 rounded-lg bg-slate-800">
                        <Spinner className="mr-3" />
                        <p className="text-slate-300 text-lg">Creating a title and questions...</p>
                    </div>
                )}
            </article>
        );
    }

    // render the final static story view
    if (story) {
        return (
            <article className="space-y-6">
                <Link to="/" className="text-blue-400 hover:underline">&larr; Back to all stories</Link>
                <h1 className="text-4xl font-bold text-white">{story.title}</h1>
                <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">{story.text}</p>
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

    return null;
}

export default StoryViewPage;