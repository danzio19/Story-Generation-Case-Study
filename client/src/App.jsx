
import StoryList from './components/StoryList';
function App() {
  console.log("app started")
  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-2">
            Madlen Story Platform
          </h1>
          <p className="text-slate-400 text-lg">
            AI-Powered Story Generation
          </p>
        </header>
        <StoryList />

      </main>
    </div>
  );
}

export default App;