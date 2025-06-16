import asyncio
from fastapi import HTTPException, APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.base import get_db
from app.core.dependencies import get_ws_registry
from app.core.websocket_registry import WebSocketRegistry
from app.db.models import Conversation, User
from typing import Tuple, Optional
from app.services.ai import get_ai_response, compile_agent_graph
from app.schemas.conversation import (
    CreateConversationSchema,
    ResponseConversationSchema,
    ConversationSchema,
)
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

conversation_ws_router = APIRouter(prefix="/chat", tags=["chat"])


@conversation_ws_router.post("/", response_model=ResponseConversationSchema)
async def create_chat_endpoint(
    chat_data: CreateConversationSchema, db: Session = Depends(get_db)
) -> ResponseConversationSchema:
    try:
        user_id = chat_data.user_id
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail={"msg": "User ID is required to create a chat."},
            )
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail={"msg": "User not found."},
            )
        new_chat = Conversation(**chat_data.model_dump())
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return ResponseConversationSchema(
            msg="Chat created successfully",
            data=ConversationSchema(
                id=new_chat.id,
                title=new_chat.title,
                user_id=new_chat.user_id,
                created_at=new_chat.created_at,
                messages=[],  # Assuming no messages are associated at creation
            ),
        )
    except Exception as e:
        msg = str(e)
        raise HTTPException(
            status_code=500,
            detail={"msg": f"An error occurred while creating the chat: {msg}"},
        )


async def generate_close_connection_countdown(
    ws: WebSocket,
) -> Tuple[bool, Optional[dict]]:
    COUNTDOWN_CONNECTION_TIMEOUT = 10  # seconds
    await ws.send_json(
        {
            "origion": "chat",
            "type": "notification",
            "notification_type": "inactivity_warning",
            "message": "You have been inactive for a while. The connection will close in 10 seconds if no further activity is detected.",
        }
    )
    try:
        event_data = await asyncio.wait_for(
            ws.receive_json(), timeout=COUNTDOWN_CONNECTION_TIMEOUT
        )
        return False, event_data
    except asyncio.TimeoutError:
        await ws.send_json(
            {"is_notification": True, "notification_type": "inactivity_close"}
        )
        await ws.close()
        return True, None


@conversation_ws_router.websocket("/{chat_id}")
async def website_websocket_chat_function(
    ws: WebSocket,
    chat_id: UUID,
    db: Session = Depends(get_db),
    ws_registry: WebSocketRegistry = Depends(get_ws_registry),
):
    print(f"WebSocket connection established for chat ID: {chat_id}", flush=True)
    INACTIVITY_TIMEOUT = 60  # seconds
    history = []
    agent, llm = compile_agent_graph()  # Assuming this function compiles the agent graph
    try:
        print(f"Querying for chat object with ID: {chat_id}", flush=True)
        chat_object = (
            db.query(Conversation)
            .filter(
                Conversation.id == chat_id,
            )
            .first()
        )
        print(f"Chat object query completed for ID: {chat_id}", flush=True)
        if chat_object is None:
            raise HTTPException(
                status_code=404,
                detail={"msg": "Conversation not found"},
            )
    except Exception as e:
        msg = str(e)
        raise HTTPException(
            status_code=502,
            detail={"msg": f"An error occurred during conversation query {msg}"},
        )
    print(f"Chat object found: {chat_object}", flush=True)
    await ws.accept()
    ws_registry.store_connection(
        chat_id=str(chat_id), user_id=str(chat_object.user_id), websocket=ws
    )
    print("ws", ws, flush=True)
    print(
        f"WebSocket connection stored for chat ID: {chat_id} and user ID: {chat_object.user_id}",
        flush=True,
    )
    welcome_message = "Hola, bienvenido al asistente de supermercados.com!, en que puedo ayudarte hoy?"
    await ws.send_json(
        {
            "origin": "chat",
            "content": welcome_message,
        }
    )
    agent_prompt = """You are a helpful assistant for a retail website, specifically a supermarket named supermercados.com. You assist users with their queries related to fidelity programs, hours, payments and billing."""
    history.append(SystemMessage(content=agent_prompt))
    history.append(
        AIMessage(
            content="Hola, bienvenido al asistente de supermercados.com!, en que puedo ayudarte hoy?"
        )
    )
    try:
        while True:
            if ws.client_state == "CLOSED":
                break
            try:
                event_data = await asyncio.wait_for(
                    ws.receive_json(),
                    timeout=INACTIVITY_TIMEOUT,
                )
            except asyncio.TimeoutError:
                (
                    should_break_loop,
                    event_data,
                ) = await generate_close_connection_countdown(ws)
                if should_break_loop:
                    break
                else:
                    continue
            event_type = event_data.pop("type", None)
            print(f"Received event data: {event_data}", flush=True)
            print(f"Event type: {event_type}", flush=True)
            if event_type is None or event_type not in [
                "user_message",
                "close",
                "typing",
            ]:
                await ws.send_json(
                    {
                        "origin": "chat",
                        "content": "Invalid event type received. Please send a valid message.",
                    }
                )
                continue
            if event_type == "user_message":
                await ws.send_json(
                    {
                        "origin": "user",
                        "content": event_data["content"],
                    }
                )
                response_message = await get_ai_response(
                    agent, llm, event_data["content"]
                )
                await ws.send_json(
                    {
                        "origin": "chat",
                        "content": response_message,
                    }
                )
                history.append(HumanMessage(content=event_data["content"]))
                history.append(AIMessage(content=response_message))
            if event_type == "typing":
                print(f"Received event type: {event_type}", flush=True)
            if event_type == "close":
                await chat_object.close(close_chat=True)
                return
    except WebSocketDisconnect as e:
        """log the websocket disconnect event"""
        await chat_object.close()
        raise HTTPException(
            status_code=404,
            detail={
                "msg": "WebSocket disconnected",
                "status": "error",
            },
        )
