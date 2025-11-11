
import { Server, ServerMetrics, ServerStatus } from '../types';

const initialServers: Server[] = [
  { id: 'srv-db-01', name: 'Database Server 1', ipAddress: '192.168.1.10', location: 'us-east-1' },
  { id: 'srv-web-01', name: 'Web Server Alpha', ipAddress: '10.0.0.5', location: 'eu-west-2' },
  { id: 'srv-cache-01', name: 'Redis Cache', ipAddress: '172.16.0.20', location: 'ap-southeast-1' },
  { id: 'srv-worker-01', name: 'Background Worker', ipAddress: '192.168.2.30', location: 'us-west-2' },
];

// Simulate a standard HTTP GET request with a delay
export const fetchServers = (): Promise<Server[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(initialServers);
    }, 1200); // Simulate network latency
  });
};

// Simulate a WebSocket connection
let intervalId: number | null = null;

const generateRandomMetrics = (server: Server): ServerMetrics => {
  const statuses = [ServerStatus.ONLINE, ServerStatus.ONLINE, ServerStatus.ONLINE, ServerStatus.MAINTENANCE, ServerStatus.OFFLINE];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    ...server,
    status: randomStatus,
    cpuLoad: randomStatus === ServerStatus.ONLINE ? Math.floor(Math.random() * 90) + 10 : 0,
    memoryUsage: randomStatus === ServerStatus.ONLINE ? Math.floor(Math.random() * 85) + 15 : 0,
  };
};

export const connectWebSocket = (onData: (data: ServerMetrics[]) => void) => {
  if (intervalId) {
    clearInterval(intervalId);
  }

  // Immediately send initial data
  const initialMetrics = initialServers.map(generateRandomMetrics);
  onData(initialMetrics);

  // Then start streaming updates
  intervalId = window.setInterval(() => {
    const updatedMetrics = initialServers.map(generateRandomMetrics);
    onData(updatedMetrics);
  }, 2000); // Send new data every 2 seconds

  console.log('Mock WebSocket connected.');
};

export const disconnectWebSocket = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Mock WebSocket disconnected.');
  }
};
