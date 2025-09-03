
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function StreamingStoryPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const topic = location.state?.topic;

    const [storyContent, setStoryContent] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!topic) {
            navigate('/');
            return;
        }

        const ws = new WebSocket("ws://127.0.0.1:8000/ws/generate-story-stream");

        ws.current.onopen = () => {
            console.log("WebSocket is OPEN. Now sending topic...");
            ws.current.send(JSON.stringify({ topic: topic }));
        };


        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'token') {
                setStoryContent(prev => prev + message.payload);
            } else if (message.type === 'complete') {
                setIsComplete(true);
                toast.success("Story generation complete!");

                const finalStoryId = message.payload.id;
                setTimeout(() => {
                    navigate(`/story/${finalStoryId}`, { replace: true });
                }, 1500);
            } else if (message.type === 'error') {
                toast.error(message.payload);
                ws.close();
            }
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            toast.error("A connection error occurred with the streaming service.");
        };
        ws.current.onclose = () => {
            console.log("WebSocket connection closed.");
            setIsStreaming(false);
        };

        return () => {
            if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
                ws.current.close();
            }
        };
    }, [topic, navigate]);

    return (
        <article className="space-y-6">
            <h1 className="text-4xl font-bold text-white">Generating Story...</h1>
            <p className="text-lg text-slate-400">
                Based on your topic: <span className="text-white font-semibold">"{topic}"</span>
            </p>

            <div className="bg-slate-800 p-6 rounded-lg min-h-[300px]">
                <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {storyContent}
                    {!isComplete && <span className="inline-block w-2 h-5 bg-white animate-pulse ml-1"></span>}
                </p>
            </div>

            {isComplete && (
                <p className="text-center text-green-400 font-bold text-xl">
                    Story complete! Redirecting you now...
                </p>
            )}
        </article>
    );
}

export default StreamingStoryPage;