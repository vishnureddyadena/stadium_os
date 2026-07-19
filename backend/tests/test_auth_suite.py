import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.db.models import User, UserSession

client = TestClient(app)

def test_account_lockout_policy():
    """
    Assert that 5 consecutive failed login attempts locks out the user account.
    """
    db = SessionLocal()
    # Ensure test user is ready and unlocked
    user = db.query(User).filter(User.email == "security@stadiumos.ai").first()
    assert user is not None
    user.failed_login_attempts = 0
    user.lockout_until = None
    db.commit()
    db.close()

    # Fail logins first 3 times (attempts 1, 2, 3)
    for _ in range(3):
        response = client.post("/api/v1/auth/login", json={
            "identity_code": "security@stadiumos.ai",
            "password": "wrongpassword",
            "device_fingerprint": "TEST-FP"
        })
        assert response.status_code == 401

    # For the 4th and 5th attempts, CAPTCHA challenge is active.
    # We must solve CAPTCHA and submit it with wrong password.
    for i in range(2):
        # Fetch CAPTCHA
        captcha_res = client.get("/api/v1/auth/captcha")
        assert captcha_res.status_code == 200
        captcha_data = captcha_res.json()
        captcha_id = captcha_data["captcha_id"]
        question = captcha_data["question"]
        
        # Solve the captcha puzzle: "Security Verification: What is X + Y?"
        parts = question.split()
        num1 = int(parts[-3])
        num2 = int(parts[-1][:-1]) # remove trailing '?'
        solution = str(num1 + num2)
        
        # Submit 4th / 5th failed attempt
        response = client.post("/api/v1/auth/login", json={
            "identity_code": "security@stadiumos.ai",
            "password": "wrongpassword",
            "device_fingerprint": "TEST-FP",
            "captcha_id": captcha_id,
            "captcha_solution": solution
        })
        
        if i == 0:
            # 4th attempt should fail with wrong password (401) but correct CAPTCHA
            assert response.status_code == 401
        else:
            # 5th attempt triggers lockout (423)
            assert response.status_code == 423
            assert "locked" in response.json()["detail"].lower()


def test_captcha_requirement_trigger():
    """
    Asserts that after 3 failed login attempts, a CAPTCHA challenge is required.
    """
    db = SessionLocal()
    user = db.query(User).filter(User.email == "medical@stadiumos.ai").first()
    user.failed_login_attempts = 0
    user.lockout_until = None
    db.commit()
    db.close()

    # Fail login 3 times
    for _ in range(3):
        client.post("/api/v1/auth/login", json={
            "identity_code": "medical@stadiumos.ai",
            "password": "wrongpassword",
            "device_fingerprint": "TEST-FP"
        })

    # 4th login attempt without captcha should fail with CAPTCHA required notification
    response_no_captcha = client.post("/api/v1/auth/login", json={
        "identity_code": "medical@stadiumos.ai",
        "password": "medical123", # correct pass
        "device_fingerprint": "TEST-FP"
    })
    assert response_no_captcha.status_code == 400
    assert "captcha" in response_no_captcha.json()["detail"].lower()


def test_refresh_token_rotation_and_hijack_prevention():
    """
    Asserts that refresh tokens are rotated on refresh, 
    and presenting a used refresh token invalidates all user sessions.
    """
    # 1. Successful Login to get cookie
    login_res = client.post("/api/v1/auth/login", json={
        "identity_code": "admin@stadiumos.ai",
        "password": "admin123",
        "device_fingerprint": "TEST-RTR-FP"
    })
    assert login_res.status_code == 200
    cookie_header = login_res.headers.get("set-cookie")
    assert "stadium_refresh" in cookie_header

    # Extract cookie value
    cookies = login_res.cookies
    refresh_token_1 = cookies.get("stadium_refresh")
    assert refresh_token_1 is not None

    # 2. Trigger Refresh Rotation (RTR)
    refresh_res_1 = client.post("/api/v1/auth/refresh", cookies={"stadium_refresh": refresh_token_1})
    assert refresh_res_1.status_code == 200
    assert "access_token" in refresh_res_1.json()
    
    refresh_token_2 = refresh_res_1.cookies.get("stadium_refresh")
    assert refresh_token_2 is not None
    assert refresh_token_1 != refresh_token_2

    # 3. Present old refresh token (REUSE DETECTION TRIGGER)
    reuse_res = client.post("/api/v1/auth/refresh", cookies={"stadium_refresh": refresh_token_1})
    assert reuse_res.status_code == 403
    assert "session hijacked" in reuse_res.json()["detail"].lower()

    # 4. Assert that all sessions for this user are now revoked in DB
    db = SessionLocal()
    user = db.query(User).filter(User.email == "admin@stadiumos.ai").first()
    active_sessions = db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.revoked == False
    ).count()
    db.close()
    assert active_sessions == 0


def test_first_time_onboarding_sequence():
    """
    Asserts that un-onboarded accounts must pass the onboarding loop 
    before standard logins are authorized.
    """
    db = SessionLocal()
    from app.core.security import get_password_hash
    # Register a new unonboarded test user
    new_user = User(
        name="Fresh Volunteer",
        volunteer_id="VOL-NEW-99",
        hashed_password=get_password_hash("temppassword"),
        role="VOLUNTEER",
        onboarded=False
    )
    db.add(new_user)
    db.commit()
    db.close()

    # Login attempt should return onboarding required status
    login_res = client.post("/api/v1/auth/login", json={
        "identity_code": "VOL-NEW-99",
        "password": "temppassword",
        "device_fingerprint": "ONB-FP"
    })
    assert login_res.status_code == 200
    assert login_res.json()["onboard_required"] == True

    # Complete onboarding activation
    onboard_res = client.post("/api/v1/auth/onboard", json={
        "identity_code": "VOL-NEW-99",
        "temp_verification_code": "FIFA2026",
        "new_password": "finalsecurepassword123"
    })
    assert onboard_res.status_code == 200

    # Normal login now works
    final_login_res = client.post("/api/v1/auth/login", json={
        "identity_code": "VOL-NEW-99",
        "password": "finalsecurepassword123",
        "device_fingerprint": "ONB-FP"
    })
    assert final_login_res.status_code == 200
    assert "access_token" in final_login_res.json()
