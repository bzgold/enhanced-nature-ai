
# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic for data validation and settings management
from pydantic import BaseModel
# Import OpenAI client for interacting with OpenAI's API
from openai import OpenAI
import os
from typing import Optional

# Initialize FastAPI application with a title
app = FastAPI(title="OpenAI Chat API")

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows the API to be accessed from different domains/origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin
    allow_credentials=True,  # Allows cookies to be included in requests
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers in requests
)

# Define the data model for chat requests using Pydantic
# This ensures incoming request data is properly validated
class ChatRequest(BaseModel):
    developer_message: str  # Message from the developer/system
    user_message: str      # Message from the user
    conversation_history: Optional[list] = []  # Previous conversation context
    model: Optional[str] = "gpt-4o-mini"  # Optional model selection with default
    api_key: str          # OpenAI API key for authentication

# Define the main chat endpoint that handles POST requests
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Initialize OpenAI client with the provided API key
        client = OpenAI(api_key=request.api_key)
        
        # Enhanced system prompt with all requirements
        enhanced_system_prompt = f"""{request.developer_message}

IMPORTANT RESPONSE GUIDELINES:
1. ALWAYS use structured responses with clear headings, bullet points, and numbered steps
2. NEVER use markdown formatting - use plain text only
3. If you don't know something or are uncertain, say "I don't know" or "I'm not certain about this"
4. Include your reasoning process and confidence level when appropriate
5. ALWAYS end with 2-3 engaging follow-up questions to continue the conversation
6. Remember previous conversation context and build upon it
7. Use clean, readable formatting with proper spacing and structure

CONVERSATION HISTORY: {request.conversation_history if request.conversation_history else "This is the start of our conversation."}"""
        
        # Build message history including conversation context
        messages = [{"role": "system", "content": enhanced_system_prompt}]
        
        # Add conversation history if provided
        if request.conversation_history:
            for msg in request.conversation_history[-10:]:  # Limit to last 10 messages for memory efficiency
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
        # Add current user message
        messages.append({"role": "user", "content": request.user_message})
        
        # Create an async generator function for streaming responses
        async def generate():
            # Create a streaming chat completion request with enhanced parameters
            stream = client.chat.completions.create(
                model=request.model,
                messages=messages,
                stream=True,  # Enable streaming response
                temperature=0.7,  # Balance creativity and accuracy
                max_tokens=1000,  # Reasonable response length
                presence_penalty=0.1,  # Encourage diverse responses
                frequency_penalty=0.1   # Reduce repetition
            )
            
            # Yield each chunk of the response as it becomes available
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        # Return a streaming response to the client
        return StreamingResponse(generate(), media_type="text/plain")
    
    except Exception as e:
        # Handle any errors that occur during processing
        raise HTTPException(status_code=500, detail=str(e))

# Define a health check endpoint to verify API status
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Entry point for running the application directly
if __name__ == "__main__":
    import uvicorn
    # Start the server on all network interfaces (0.0.0.0) on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
