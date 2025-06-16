from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

class Conversation(Base):
    __tablename__ = "conversation"
    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("user.id"), nullable=False, unique=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    messages = relationship("Message", backref="conversation", cascade="all, delete-orphan")