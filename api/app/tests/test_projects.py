import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_load_project():
    response = client.post("/projects/")
    assert response.status_code == 201
    assert "project_id" in response.json()

def test_load_files_to_project():
    project_id = 1  # Assuming a project with ID 1 exists
    with open("test_file.pdf", "rb") as file:
        response = client.post(f"/projects/{project_id}/files/", files={"file": file})
    assert response.status_code == 200
    assert response.json()["message"] == "File uploaded successfully."

def test_process_project():
    project_id = 1  # Assuming a project with ID 1 exists
    response = client.post(f"/projects/{project_id}/process/")
    assert response.status_code == 200
    assert response.json()["message"] == "Project processing started."

def test_get_project_status():
    project_id = 1  # Assuming a project with ID 1 exists
    response = client.get(f"/projects/{project_id}/status/")
    assert response.status_code == 200
    assert "status" in response.json()