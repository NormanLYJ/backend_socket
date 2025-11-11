import { Server, ServerMetrics } from '../types';

/**
 * Fetches the list of servers from the backend HTTP endpoint.
 * Assumes the endpoint is `/api/servers`.
 */
export const fetchServers = async (): Promise<Server[]> => {
  try {
    const response = await fetch('/api/servers');
    if (!response.ok) {
      // Create a more informative error message
      const errorText = await response.text();
      console.error('Failed to fetch servers:', response.status, errorText);
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('An error occurred while fetching servers:', error);
    // Re-throw the error so the component can handle it
    throw error;
  }
};


// WebSocket connection management
let socket: WebSocket | null = null;

/**
 * Connects to the real-time metrics WebSocket endpoint.
 * Assumes the endpoint is available at the same host, path `/ws/metrics`.
 * @param onData Callback function to handle incoming metric data.
 */
export const connectWebSocket = (onData: (data: ServerMetrics[]) => void) => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.warn('WebSocket is already connected or connecting.');
    return;
  }

  // Determine WebSocket protocol based on current page protocol
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}/ws/metrics`;

  console.log(`Connecting to WebSocket at ${wsUrl}...`);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connection established.');
  };

  socket.onmessage = (event) => {
    try {
      // Assuming the backend sends data as a JSON string
      const data: ServerMetrics[] = JSON.parse(event.data);
      onData(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = (event) => {
    if (event.wasClean) {
      console.log(`WebSocket connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.error('WebSocket connection died');
    }
    socket = null;
  };
};

/**
 * Disconnects the active WebSocket connection.
 */
export const disconnectWebSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('Disconnecting WebSocket.');
    socket.close();
  } else {
    console.warn('No active WebSocket connection to disconnect.');
  }
};
