from pydantic import BaseModel, Field


class BaseResponseSchema(BaseModel):
    msg: str = Field(..., description="Response message")
    
    