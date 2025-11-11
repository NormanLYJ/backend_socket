
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ServerMetrics, ServerStatus } from '../types';
import Card from './Card';
import { WifiIcon } from './icons/Icons';

const StatusIndicator: React.FC<{ status: ServerStatus }> = ({ status }) => {
  const baseClasses = "w-3 h-3 rounded-full";
  const statusConfig = {
    [ServerStatus.ONLINE]: { color: 'bg-green-500', shadow: 'shadow-[0_0_6px_2px_rgba(34,197,94,0.5)]', text: 'Online' },
    [ServerStatus.OFFLINE]: { color: 'bg-red-500', shadow: 'shadow-[0_0_6px_2px_rgba(239,68,68,0.5)]', text: 'Offline' },
    [ServerStatus.MAINTENANCE]: { color: 'bg-yellow-500', shadow: 'shadow-[0_0_6px_2px_rgba(234,179,8,0.5)]', text: 'Maintenance' },
  };
  const config = statusConfig[status];
  return (
    <div className="flex items-center">
      <div className={`${baseClasses} ${config.color} ${config.shadow}`}></div>
      <span className="ml-2 text-sm">{config.text}</span>
    </div>
  );
};

const MetricBar: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const width = `${value}%`;
  const color = value > 85 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500 ease-out`} style={{ width }}></div>
      </div>
    </div>
  );
};


const WebSocketDemo: React.FC = () => {
  const [metrics, setMetrics] = useState<ServerMetrics[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const metricsRef = useRef<Map<string, ServerMetrics>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);

  const handleData = useCallback((data: ServerMetrics[]) => {
    const newMetricsMap = new Map(metricsRef.current);
    data.forEach(metric => newMetricsMap.set(metric.id, metric));
    metricsRef.current = newMetricsMap;
    // Sort by name for a consistent order
    const sortedMetrics = Array.from(newMetricsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    setMetrics(sortedMetrics);
  }, []);

  const handleConnect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      console.warn('WebSocket is already connected or connecting.');
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/metrics`;

    console.log(`Connecting to WebSocket at ${wsUrl}...`);
    const newSocket = new WebSocket(wsUrl);
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      console.log('WebSocket connection established.');
      setIsConnected(true);
    };

    newSocket.onmessage = (event) => {
      try {
        const data: ServerMetrics[] = JSON.parse(event.data);
        handleData(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        console.error('WebSocket connection died');
      }
      setIsConnected(false);
      socketRef.current = null;
    };
  }, [handleData]);

  const handleDisconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('Disconnecting WebSocket.');
      socketRef.current.close();
    } else {
      console.warn('No active WebSocket connection to disconnect.');
    }
    // The onclose handler will set isConnected to false and clear the socket ref.
    // Manually clear metrics for immediate UI feedback.
    setMetrics([]);
    metricsRef.current.clear();
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <Card className="flex flex-col">
       <div className="flex items-center mb-4">
        <WifiIcon className="w-8 h-8 mr-3 text-blue-500" />
        <div>
            <h2 className="text-2xl font-bold">WebSocket API Endpoint</h2>
            <p className="text-gray-400">Simulates a real-time data stream.</p>
        </div>
      </div>
      
      <div className="flex-grow space-y-4">
        {!isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400">Connect to the live feed to see real-time server metrics.</p>
            </div>
        )}
        {isConnected && (
          <div className="space-y-4 pr-2 overflow-y-auto max-h-96">
            {metrics.length > 0 ? (
                metrics.map((metric) => (
                  <div key={metric.id} className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{metric.name}</p>
                        <p className="text-sm text-gray-400">{metric.ipAddress}</p>
                      </div>
                      <StatusIndicator status={metric.status} />
                    </div>
                    <div className="space-y-2">
                        <MetricBar value={metric.cpuLoad} label="CPU Load" />
                        <MetricBar value={metric.memoryUsage} label="Memory" />
                    </div>
                  </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <p className="text-gray-400">Waiting for data...</p>
                </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleConnect}
          disabled={isConnected}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          {isConnected ? 'Connected' : 'Connect to Live Feed'}
        </button>
        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          Disconnect
        </button>
      </div>
    </Card>
  );
};

export default WebSocketDemo;
