import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"
    assert "platform" in response.json()

def test_auth_registration_and_login():
    # 1. Register a new test user
    email = "test_user_pytest@stadiumos.ai"
    reg_payload = {
        "name": "Pytest Fan",
        "email": email,
        "password": "testpassword123",
        "role": "FAN"
    }
    
    response_reg = client.post("/api/v1/auth/register", json=reg_payload)
    # Could be 200 (first run) or 400 (if already registered in test DB)
    assert response_reg.status_code in [200, 400]
    
    # 2. Login with credentials
    login_payload = {
        "identity_code": email,
        "password": "testpassword123",
        "device_fingerprint": "TEST-FAN-FP"
    }
    response_login = client.post("/api/v1/auth/login", json=login_payload)
    assert response_login.status_code == 200
    data = response_login.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email

def test_ai_route_planner_unauthorized():
    # Triggering AI without token header should return 401
    payload = {
        "start": "Gate A",
        "end": "Sector 102",
        "wheelchair": False
    }
    response = client.post("/api/v1/ai/route-plan", json=payload)
    assert response.status_code == 401

def test_ticket_verification_and_fraud():
    # Login as admin to obtain operational token
    login_payload = {
        "identity_code": "admin@stadiumos.ai",
        "password": "admin123",
        "device_fingerprint": "TEST-ADMIN-FP"
      }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Verify standard used ticket (TICKET-2026-FIFA-001)
    payload = {
        "ticket_no": "TICKET-2026-FIFA-001",
        "gate": "GATE_A"
    }
    response = client.post("/api/v1/modules/tickets/verify", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] in ["APPROVED", "ALREADY_USED"]
    
    # Verify suspicious cloned ticket (TICKET-2026-FIFA-999)
    payload_fraud = {
        "ticket_no": "TICKET-2026-FIFA-999",
        "gate": "GATE_PRESS"
    }
    response_fraud = client.post("/api/v1/modules/tickets/verify", json=payload_fraud, headers=headers)
    assert response_fraud.status_code == 200
    assert response_fraud.json()["status"] == "FRAUD_DETECTED"
    assert "cloned scan pattern detected" in response_fraud.json()["message"]



