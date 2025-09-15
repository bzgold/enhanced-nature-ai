# Enhanced Nature AI - Advanced Chat API Backend
# This version includes conversation memory, chain of thought reasoning, and improved response formatting

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from typing import Optional, List
import json

# Initialize FastAPI application with enhanced title
app = FastAPI(title="Enhanced Nature AI Chat API", version="2.0.0")

# Configure CORS (Cross-Origin Resource Sharing) middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin
    allow_credentials=True,  # Allows cookies to be included in requests
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers in requests
)

# Enhanced data model for chat requests
class EnhancedChatRequest(BaseModel):
    developer_message: str  # Message from the developer/system
    user_message: str      # Message from the user
    conversation_history: Optional[List[dict]] = []  # Previous conversation context
    model: Optional[str] = "gpt-4o-mini"  # Optional model selection with default
    api_key: str          # OpenAI API key for authentication
    enable_reasoning: Optional[bool] = True  # Enable chain of thought reasoning
    confidence_threshold: Optional[float] = 0.7  # Confidence threshold for responses

# Enhanced chat endpoint with all improvements
@app.post("/api/chat")
async def enhanced_chat(request: EnhancedChatRequest):
    try:
        # Initialize OpenAI client with the provided API key
        client = OpenAI(api_key=request.api_key)
        
        # Enhanced system prompt for natural responses with separate analysis
        enhanced_system_prompt = f"""{request.developer_message}

CRITICAL RESPONSE GUIDELINES:
1. MAIN RESPONSE: Write naturally and conversationally. Use bullet points ONLY where they genuinely make sense (like lists or steps). NO forced headings, supporting details sections, or conclusions.
2. FORMATTING: Use plain text only - NO markdown formatting
3. UNCERTAINTY: If unsure, say "I don't know" or "I'm not certain about this"
4. MEMORY: Build upon previous conversation context naturally
5. ANALYSIS SECTIONS: Always include separate reasoning and follow-up questions sections

CONVERSATION CONTEXT: {request.conversation_history if request.conversation_history else "This is the start of our conversation."}

RESPONSE FORMAT:
[Write your main response naturally and conversationally. Use bullets only when listing items or steps makes genuine sense. Be helpful and informative but natural.]

REASONING:
[Explain your thought process, confidence level, and any assumptions you made]

FOLLOW-UP QUESTIONS:
1. [Engaging question 1]
2. [Engaging question 2]
3. [Engaging question 3]"""
        
        # Build comprehensive message history
        messages = [{"role": "system", "content": enhanced_system_prompt}]
        
        # Add conversation history with memory optimization
        if request.conversation_history:
            # Limit to last 15 messages for optimal memory usage
            recent_history = request.conversation_history[-15:]
            for msg in recent_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if content.strip():  # Only add non-empty messages
                    messages.append({"role": role, "content": content})
        
        # Add current user message
        messages.append({"role": "user", "content": request.user_message})
        
        # Create an async generator function for streaming responses (matching original)
        async def generate():
            # Create streaming chat completion with enhanced parameters
            stream = client.chat.completions.create(
                model=request.model,
                messages=messages,
                stream=True,
                temperature=0.7,  # Balance creativity and accuracy
                max_tokens=1200,  # Increased for more detailed responses
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
        # Enhanced error handling
        error_message = f"Enhanced Nature AI encountered an error: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

# Enhanced health check endpoint
@app.get("/api/health")
async def enhanced_health_check():
    return {
        "status": "enhanced_ok",
        "version": "2.0.0",
        "features": [
            "conversation_memory",
            "chain_of_thought_reasoning", 
            "structured_responses",
            "confidence_indicators",
            "leading_questions"
        ]
    }

# New endpoint to get conversation summary
@app.post("/api/conversation/summary")
async def get_conversation_summary(conversation_history: List[dict]):
    """Generate a summary of the conversation for memory optimization"""
    try:
        # Simple summary logic - in a real app, you'd use AI for this
        user_messages = [msg for msg in conversation_history if msg.get("role") == "user"]
        assistant_messages = [msg for msg in conversation_history if msg.get("role") == "assistant"]
        
        return {
            "total_messages": len(conversation_history),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "topics_discussed": len(set(msg.get("content", "")[:50] for msg in user_messages)),
            "summary": "Conversation covers multiple topics with structured AI responses"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Entry point for running the enhanced application
if __name__ == "__main__":
    import uvicorn
    # Start the enhanced server on port 8001 to avoid conflicts
    uvicorn.run(app, host="0.0.0.0", port=8001)
