
import React from 'react';
import HttpApiDemo from './components/HttpApiDemo';
import WebSocketDemo from './components/WebSocketDemo';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Backend API Simulator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            A frontend demonstration of standard HTTP and WebSocket API interactions.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HttpApiDemo />
          <WebSocketDemo />
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} World-Class Senior Frontend Engineer. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
