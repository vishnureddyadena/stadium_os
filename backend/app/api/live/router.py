from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.live.connection_manager import manager
import logging

router = APIRouter(tags=["Real-time Live WebSockets"])

logger = logging.getLogger("stadium_os_ws")

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    logger.info(f"WebSocket client connected: {websocket.client}")
    try:
        while True:
            # Keep connection open; can receive messages if needed
            data = await websocket.receive_text()
            # Echo back or parse input commands from user
            await websocket.send_json({"echo": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"WebSocket client disconnected: {websocket.client}")
    except Exception as e:
        manager.disconnect(websocket)
        logger.error(f"WebSocket error: {e}")
