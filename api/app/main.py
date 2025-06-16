from fastapi import FastAPI
from app.db.models import *
from app.db import Base, engine
from app.api.v1.user import user_router
from app.api.v1.conversation import conversation_ws_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.websocket_registry import ws_registry

app = FastAPI(
    title="Emtelco Chat API",
    description="An API for emtelco chat functionality, including user management and conversation handling.",
    version="0.1.0",
)

origins = [
    "*",
    "http://localhost:3000",
]
ws_registry.init()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
app.include_router(conversation_ws_router, tags=["conversation"])
app.include_router(user_router, tags=["user"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}

print("list of routes:", flush=True)
for route in app.routes:
    if hasattr(route, "methods"):
        print(f"Path: {route.path}, Name: {route.name}, Methods: {route.methods}", flush=True)
    else:
        print(f"Path: {route.path}, Name: {route.name}, Type: WebSocket", flush=True)
