from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from app.schemas.conversation import ConversationSchema
from app.schemas.response import BaseResponseSchema

class CreateUserSchema(BaseModel):
    id: str = Field(..., max_length=11, min_length=4, pattern=r"^\d+$")
    name: str = Field(..., max_length=100, min_length=1, pattern=r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$")
    email: str = Field(..., max_length=320, min_length=1, pattern=r"^[\w=\.]+@([\w-]+\.)+[\w-]{2,4}$")
    phone: str = Field(..., max_length=10, min_length=10, pattern=r"^[63].*")

class UserSchema(CreateUserSchema):
    created_at: datetime = Field(..., description="Creation timestamp in ISO format")
    last_connection: Optional[datetime] = Field(None, description="Last connection timestamp in ISO format")
    conversations: List[ConversationSchema] = Field([], description="List of conversations associated with the user"
    )

class ResponseUserSchema(BaseResponseSchema):
    data: Optional[UserSchema] = Field(..., description="User data")

    