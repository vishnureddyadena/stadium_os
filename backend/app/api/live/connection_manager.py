from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Store active connections grouped by role or client ID if needed, or simple broadcast list.
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        # Create a copy of connections to avoid issues during modification
        disconnected = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
                
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()
