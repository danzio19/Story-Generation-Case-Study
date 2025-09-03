
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import StoryDetail from './components/StoryDetail';
import { Toaster } from 'sonner';
import StoryViewPage from './pages/StoryViewPage';

function App() {
  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans">
      <Toaster position="top-right" richColors theme="dark" />

      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-2">
            Madlen Story Platform
          </h1>
          <p className="text-slate-400 text-lg">
            AI-Powered Story Generation
          </p>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/story/:id" element={<StoryViewPage />} />
        </Routes>

      </main>
    </div>
  );
}

export default App;