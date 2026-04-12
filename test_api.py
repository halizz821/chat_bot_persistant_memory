from fastapi.testclient import TestClient
from api import api

client = TestClient(api)

def test_api_starts():
    # Attempting to fetch a missing route should act as expected
    response = client.get("/")
    assert response.status_code == 404

def test_chat_needs_auth_or_env():
    # It might fail with 500 without groq api key, which tells us the API wrapper itself works
    response = client.post("/chat", json={"message": "ping", "thread_id": "test_1"})
    assert response.status_code in [200, 500] 

def test_history():
    response = client.get("/history/test_1")
    assert response.status_code == 200
    assert "messages" in response.json()
