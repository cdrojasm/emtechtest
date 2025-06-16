import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_load_project():
    response = client.post("/projects/")
    assert response.status_code == 200
    assert "project_id" in response.json()

def test_load_files_to_project():
    project_id = 1  # Assuming a project with ID 1 exists
    response = client.post(f"/projects/{project_id}/files/", files={"file": ("test.pdf", b"test content")})
    assert response.status_code == 200
    assert response.json().get("message") == "File uploaded successfully."

def test_process_project():
    project_id = 1  # Assuming a project with ID 1 exists
    response = client.post(f"/projects/{project_id}/process/")
    assert response.status_code == 200
    assert response.json().get("message") == "Project processed successfully."

def test_get_project_status():
    project_id = 1  # Assuming a project with ID 1 exists
    response = client.get(f"/projects/{project_id}/status/")
    assert response.status_code == 200
    assert "status" in response.json()