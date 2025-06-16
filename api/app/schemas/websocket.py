from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.conversation import ConversationSchema
from app.schemas.response import BaseResponseSchema

class WebSocketMessage(BaseModel):
    origin : str = Field(..., description="Origin of the WebSocket message")
    content: str = Field(..., description="Content of the WebSocket message")