
import React, { useState, useCallback } from 'react';
import { Server } from '../types';
import Card from './Card';
import { ServerIcon, GlobeAltIcon, ChipIcon } from './icons/Icons';

const HttpApiDemo: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setHasFetched(true);
    setError(null);
    try {
      const response = await fetch('/api/servers');
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data: Server[] = await response.json();
      setServers(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('An error occurred while fetching servers:', errorMessage);
      setError(errorMessage);
      setServers([]); // Clear previous data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center mb-4">
        <ChipIcon className="w-8 h-8 mr-3 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">HTTP API Endpoint</h2>
          <p className="text-gray-400">Simulates a one-time data fetch (GET request).</p>
        </div>
      </div>
      
      <div className="flex-grow space-y-4">
        {!hasFetched && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400">Click the button to fetch the server list.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        )}

        {!isLoading && hasFetched && servers.length > 0 && (
          <div className="space-y-3 pr-2 overflow-y-auto max-h-96">
            {servers.map((server) => (
              <div key={server.id} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between transition-transform hover:scale-105 duration-200">
                <div className="flex items-center">
                  <ServerIcon className="w-6 h-6 mr-4 text-gray-400" />
                  <div>
                    <p className="font-semibold text-white">{server.name}</p>
                    <p className="text-sm text-gray-400">{server.ipAddress}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  <span>{server.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-900/30 rounded-lg">
            <p className="text-red-400 font-semibold">Failed to load data</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
        )}

      </div>

      <div className="mt-6">
        <button
          onClick={handleFetchData}
          disabled={isLoading}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
        >
          {isLoading ? 'Fetching Data...' : 'Fetch Server List'}
        </button>
      </div>
    </Card>
  );
};

export default HttpApiDemo;
