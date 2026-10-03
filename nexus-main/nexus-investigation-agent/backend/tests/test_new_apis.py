from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_auth_and_endpoints():
    # Test health
    res = client.get("/api/health")
    assert res.status_code == 200

    # Test login
    res = client.post("/api/auth/login", json={"username_or_email": "admin", "password": "NexusAdmin2025!"})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    token = data["token"]

    # Test me
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["user"]["username"] == "admin"

    # Test criteria
    res = client.get("/api/criteria")
    assert res.status_code == 200
    assert len(res.json()) >= 5

    # Test evaluation studio
    res = client.get("/api/evaluation")
    assert res.status_code == 200
    assert "methods" in res.json()
