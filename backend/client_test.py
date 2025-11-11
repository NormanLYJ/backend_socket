import asyncio, websockets

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws"
    async with websockets.connect(uri) as ws:
        while True:
            msg = await ws.recv()
            print(msg)

asyncio.run(test_ws())