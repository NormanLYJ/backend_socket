
export enum ServerStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Server {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
}

export interface ServerMetrics extends Server {
  status: ServerStatus;
  cpuLoad: number; // percentage
  memoryUsage: number; // percentage
}
