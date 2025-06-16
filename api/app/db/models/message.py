from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from datetime import datetime
from app.db.base import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Message(Base):
    __tablename__ = "message"
    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(String, nullable=True)
    conversation_id = Column(UUID, ForeignKey("conversation.id"), nullable=False)
    content = Column(Text, nullable=False)
    role = Column(String, nullable=False)  # e.g., 'user', 'assistant', 'system'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Message(id={self.id}, user_id={self.user_id}, conversation_id={self.conversation_id}, role={self.role})>"