from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import json
import random
from datetime import datetime

app = FastAPI(title="Dual Mode Web API")

# Dummy data for standard HTTP mode

from fastapi import FastAPI, WebSocket
import random, asyncio

# Example server list (from before)
initial_servers = [
    {"id": "srv-db-01", "name": "Database Server 1", "ip_address": "192.168.1.10", "location": "us-east-1"},
    {"id": "srv-web-01", "name": "Web Server Alpha", "ip_address": "10.0.0.5", "location": "eu-west-2"},
    {"id": "srv-cache-01", "name": "Redis Cache", "ip_address": "172.16.0.20", "location": "ap-southeast-1"},
    {"id": "srv-worker-01", "name": "Background Worker", "ip_address": "192.168.2.30", "location": "us-west-2"},
]

# Define status constants
class ServerStatus:
    ONLINE = "ONLINE"
    MAINTENANCE = "MAINTENANCE"
    OFFLINE = "OFFLINE"

def generate_random_metrics(server: dict) -> dict:
    statuses = [
        ServerStatus.ONLINE,
        ServerStatus.ONLINE,
        ServerStatus.ONLINE,
        ServerStatus.MAINTENANCE,
        ServerStatus.OFFLINE,
    ]
    random_status = random.choice(statuses)

    cpu_load = random.randint(10, 99) if random_status == ServerStatus.ONLINE else 0
    memory_usage = random.randint(15, 99) if random_status == ServerStatus.ONLINE else 0

    return {
        **server,
        "status": random_status,
        "cpu_load": cpu_load,
        "memory_usage": memory_usage,
    }




# --- MODE 1: Standard HTTP GET ---
@app.get("/data")
async def get_data():
    """
    Return all dummy data in a standard HTTP JSON response.
    """
    return JSONResponse(content={"data": initial_servers})


# --- MODE 2: Streaming mode ---
async def data_streamer():
    """
    Continuously yield data as a stream.
    """
    while True:
        # Simulate real-time data generation
        # event = {
        #     "timestamp": datetime.utcnow().isoformat(),
        #     "value": random.randint(0, 100)
        # }

        # Generate metrics for all servers
        server_metrics = list(map(generate_random_metrics, initial_servers))

        # Yield a JSON string followed by a newline (for proper chunked streaming)
        yield json.dumps(server_metrics) + "\n"

        # Wait a second before sending next item
        await asyncio.sleep(1)


@app.get("/stream")
async def stream_data():
    """
    Stream data continuously to the client.
    """
    return StreamingResponse(data_streamer(), media_type="application/json")




@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = {"value": random.randint(0, 100)}
            await websocket.send_json(data)
            await asyncio.sleep(1)
    except Exception:
        await websocket.close()


# --- Run server manually (for debugging) ---
# Run this file with: `uvicorn main:app --reload`
