"""FastAPI backend for LLM Council."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json
import asyncio

from . import storage
from .council import run_full_council, generate_conversation_title, stage1_collect_responses, stage2_collect_rankings, stage3_synthesize_final, calculate_aggregate_rankings
from .config import settings, STANDARD_COUNCIL, FREE_COUNCIL, STANDARD_CHAIRMAN, FREE_CHAIRMAN
from .openrouter import query_models_parallel

app = FastAPI(title="LLM Council API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateConversationRequest(BaseModel):
    """Request to create a new conversation."""
    pass


class SendMessageRequest(BaseModel):
    """Request to send a message in a conversation."""
    content: str
    council_type: Optional[str] = "council"


class ConversationMetadata(BaseModel):
    """Conversation metadata for list view."""
    id: str
    created_at: str
    title: str
    message_count: int


class ModelDefinitions(BaseModel):
    paid: Dict[str, Any]
    free: Dict[str, Any]


class SettingsUpdateRequest(BaseModel):
    openrouter_api_key: str
    include_free_models: bool
    timezone: str = "America/Los_Angeles"
    definitions: Optional[ModelDefinitions] = None


@app.get("/api/settings")
async def get_settings():
    """Get current settings."""
    return {
        "openrouter_api_key": settings.openrouter_api_key,
        "include_free_models": settings.include_free_models,
        "timezone": settings.timezone,
        "council_models": settings.council_models,
        "chairman_model": settings.chairman_model,
        "definitions": {
            "paid": {
                "council": settings.paid_council_models,
                "chairman": settings.paid_chairman_model
            },
            "free": {
                "council": settings.free_council_models,
                "chairman": settings.free_chairman_model
            }
        }
    }


@app.post("/api/settings")
async def update_settings(request: SettingsUpdateRequest):
    """Update settings."""
    settings.openrouter_api_key = request.openrouter_api_key
    settings.include_free_models = request.include_free_models
    settings.timezone = request.timezone
    
    if request.definitions:
        # Update paid definitions
        if "paid" in request.definitions.dict():
             paid = request.definitions.paid
             if "council" in paid:
                 settings.paid_council_models = paid["council"]
             if "chairman" in paid:
                 settings.paid_chairman_model = paid["chairman"]
        
        # Update free definitions
        if "free" in request.definitions.dict():
             free = request.definitions.free
             if "council" in free:
                 settings.free_council_models = free["council"]
             if "chairman" in free:
                 settings.free_chairman_model = free["chairman"]

    return {"status": "ok", "settings": await get_settings()}


class TestModelsRequest(BaseModel):
    models: List[str]
    prompt: str = "Hello, are you working?"


@app.post("/api/settings/test")
async def test_models(request: TestModelsRequest):
    """Test specific models with a prompt."""
    messages = [{"role": "user", "content": request.prompt}]
    
    # query_models_parallel returns Dict[model_name, response_dict | None]
    results = await query_models_parallel(request.models, messages)
    
    formatted_results = []
    for model in request.models:
        response = results.get(model)
        if response:
            formatted_results.append({
                "model": model,
                "status": "success",
                "response": response.get("content", "No content received")
            })
        else:
             formatted_results.append({
                "model": model,
                "status": "error",
                "response": "Failed to get response"
            })
            
    return {"results": formatted_results}


class Conversation(BaseModel):
    """Full conversation with all messages."""
    id: str
    created_at: str
    title: str
    messages: List[Dict[str, Any]]

@app.get("/api/logs")
async def get_logs():
    """Get system logs."""
    from . import storage
    return {"logs": storage.get_logs()}
@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "LLM Council API"}


@app.get("/api/conversations", response_model=List[ConversationMetadata])
async def list_conversations():
    """List all conversations (metadata only)."""
    return storage.list_conversations()


@app.post("/api/conversations", response_model=Conversation)
async def create_conversation(request: CreateConversationRequest):
    """Create a new conversation."""
    conversation_id = str(uuid.uuid4())
    conversation = storage.create_conversation(conversation_id)
    return conversation


@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation with all its messages."""
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.post("/api/conversations/{conversation_id}/message")
async def send_message(conversation_id: str, request: SendMessageRequest):
    """
    Send a message and run the 3-stage council process.
    Returns the complete response with all stages.
    """
    # Check if conversation exists
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if this is the first message
    is_first_message = len(conversation["messages"]) == 0

    # Add user message
    storage.add_user_message(conversation_id, request.content)

    # If this is the first message, generate a title
    if is_first_message:
        title = await generate_conversation_title(request.content)
        storage.update_conversation_title(conversation_id, title)

    # Run the 3-stage council process
    stage1_results, stage2_results, stage3_result, metadata = await run_full_council(
        request.content,
        council_type=request.council_type
    )

    # Add assistant message with all stages
    storage.add_assistant_message(
        conversation_id,
        stage1_results,
        stage2_results,
        stage3_result
    )

    # Return the complete response with metadata
    return {
        "stage1": stage1_results,
        "stage2": stage2_results,
        "stage3": stage3_result,
        "metadata": metadata
    }


@app.post("/api/conversations/{conversation_id}/message/stream")
async def send_message_stream(conversation_id: str, request: SendMessageRequest):
    """
    Send a message and stream the 3-stage council process.
    Returns Server-Sent Events as each stage completes.
    """
    # Check if conversation exists
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if this is the first message
    is_first_message = len(conversation["messages"]) == 0

    async def event_generator():
        try:
            # Add user message
            storage.add_user_message(conversation_id, request.content)

            # Start title generation in parallel (don't await yet)
            title_task = None
            if is_first_message:
                title_task = asyncio.create_task(generate_conversation_title(request.content))

            # Stage 1: Collect responses
            yield f"data: {json.dumps({'type': 'stage1_start'})}\n\n"
            stage1_results = await stage1_collect_responses(request.content)
            yield f"data: {json.dumps({'type': 'stage1_complete', 'data': stage1_results})}\n\n"

            # Stage 2: Collect rankings
            yield f"data: {json.dumps({'type': 'stage2_start'})}\n\n"
            stage2_results, label_to_model = await stage2_collect_rankings(
                request.content, 
                stage1_results,
                council_type=request.council_type
            )
            aggregate_rankings = calculate_aggregate_rankings(stage2_results, label_to_model)
            yield f"data: {json.dumps({'type': 'stage2_complete', 'data': stage2_results, 'metadata': {'label_to_model': label_to_model, 'aggregate_rankings': aggregate_rankings}})}\n\n"

            # Stage 3: Synthesize final answer
            yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
            stage3_result = await stage3_synthesize_final(
                request.content, 
                stage1_results, 
                stage2_results,
                council_type=request.council_type
            )
            yield f"data: {json.dumps({'type': 'stage3_complete', 'data': stage3_result})}\n\n"

            # Wait for title generation if it was started
            if title_task:
                title = await title_task
                storage.update_conversation_title(conversation_id, title)
                yield f"data: {json.dumps({'type': 'title_complete', 'data': {'title': title}})}\n\n"

            # Save complete assistant message
            storage.add_assistant_message(
                conversation_id,
                stage1_results,
                stage2_results,
                stage3_result
            )

            # Send completion event
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
