from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.db.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "user"
    id = Column(String, primary_key=True, index=True, unique=True)
    name = Column(String, nullable=False, unique=False)
    email = Column(String, nullable=False, unique=False)
    phone = Column(String, nullable=True, unique=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_connection = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    conversations = relationship("Conversation", backref="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(name={self.name}, email={self.email}, phone={self.phone})>"