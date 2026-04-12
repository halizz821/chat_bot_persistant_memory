from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from app import app as langgraph_app

api = FastAPI(title="LangGraph Chatbot API")

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "2"

@api.post("/chat")
def chat(request: ChatRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}
        
        # Get count of messages before invocation
        state_before = langgraph_app.get_state(config)
        messages_before = state_before.values.get("messages", [])
        before_len = len(messages_before)
        
        result = langgraph_app.invoke(
            {"messages": [HumanMessage(content=request.message)]}, 
            config=config
        )
        
        new_messages = result["messages"][before_len:]
        used_tool = any(msg.type == "tool" for msg in new_messages)
        
        ai_reply = result["messages"][-1].content
        if isinstance(ai_reply, list):
            ai_reply = "\n".join(block.get("text", "") for block in ai_reply if isinstance(block, dict) and "text" in block)
            
        return {"reply": ai_reply, "used_tool": used_tool}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/graph")
def graph():
    try:
        png_bytes = langgraph_app.get_graph().draw_mermaid_png()
        return Response(content=png_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/history/{thread_id}")
def history(thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    try:
        state = langgraph_app.get_state(config)
        messages = state.values.get("messages", [])
        
        history_data = []
        for i, msg in enumerate(messages):
            content = msg.content
            if isinstance(content, list):
                content = "\n".join(block.get("text", "") for block in content if isinstance(block, dict) and "text" in block)
                
            if msg.type == "human":
                history_data.append({"type": "human", "content": content})
            elif msg.type == "ai" and content:
                used_tool = False
                if i > 0 and messages[i-1].type == "tool":
                    used_tool = True
                history_data.append({
                    "type": "ai",
                    "content": content,
                    "used_tool": used_tool
                })
        return {"messages": history_data}
    except Exception as e:
        return {"messages": [], "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000)
#uv run uvicorn api:api --reload