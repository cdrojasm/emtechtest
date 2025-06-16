from fastapi import WebSocket
from typing import Optional

class WebSocketRegistry:
    
    _initialized : bool = False
    
    def __init__(self) -> None:
        self.connections : dict[str, WebSocket] = {} # Store active connections
        
    def init(self) -> None:
        self._initialized = True

    def store_connection(
        self, 
        chat_id: str, 
        user_id: str,
        websocket: WebSocket) -> None:
        """Store an active WebSocket connection."""
        if chat_id not in self.connections:
            self.connections[chat_id] = {}
        self.connections[chat_id][user_id] = websocket

    def remove_connection(self, chat_id: str, user_id: str) -> None:
        """Remove a WebSocket connection."""
        if chat_id in self.connections:
            if user_id in self.connections[chat_id]:
                del self.connections[chat_id][user_id]
            if len(self.connections.keys()) == 0:
                del self.connections[chat_id]
    
    def get_user_websocket(self, chat_id: str, user_id: str) -> Optional[WebSocket]:
        """Retrieve a WebSocket object if it exists."""
        return self.connections.get(chat_id, {}).get(user_id)
    
    