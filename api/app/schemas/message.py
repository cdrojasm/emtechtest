from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID, uuid4



class MessageConversationSchema(BaseModel):
    id: UUID = Field(default_factory=uuid4, description="Unique identifier for the conversation")
    user_id: UUID = Field(..., description="Unique identifier for the user associated with the conversation")
    conversation_id: UUID = Field(..., description="Unique identifier for the conversation")
    content: str = Field(..., description="Content of the message", min_length=1)
    role: str = Field(..., description="Role of the message sender (e.g., 'user', 'system')", max_length=50)
    

class MessageSchema(MessageConversationSchema):
    created_at: datetime = Field(..., description="Creation timestamp in ISO format")
    