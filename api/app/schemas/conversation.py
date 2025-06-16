from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from typing import List, Optional
from app.schemas.message import MessageSchema
from datetime import datetime
from app.schemas.response import BaseResponseSchema

class CreateConversationSchema(BaseModel):
    id: Optional[UUID] = Field(default_factory=uuid4, description="Unique identifier for the conversation")
    title :Optional[str] = Field("Nuevo chat", max_length=250, min_length=1, description="Title of the conversation")
    user_id: str = Field(..., description="Unique identifier for the user associated with the conversation")
    

class ConversationSchema(CreateConversationSchema):
    created_at: datetime = Field(..., description="Creation timestamp in ISO format")
    messages: List[MessageSchema] = Field(
        default_factory=list, description="List of messages in the conversation"
    )

class ResponseConversationSchema(BaseResponseSchema):
    msg: str = Field(..., description="Response message")
    data: Optional[ConversationSchema] = Field(None, description="Conversation data")