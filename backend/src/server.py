import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Get Supabase credentials from environment variables
url: str = os.environ.get("SUPABASE_URL") or ""
key: str = os.environ.get("SUPABASE_KEY") or ""

# Create a Supabase client
supabase: Client = create_client(url, key)

# Create a FastAPI app
app = FastAPI()

# Set up CORS (Cross-Origin Resource Sharing)
# This allows your frontend (running on a different domain) to communicate with your backend.
origins = [
    "http://localhost",
    "http://localhost:3000", # The default port for React development servers
    # You can add the URL of your deployed frontend here as well
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for creating a new note
# This helps with request body validation and data serialization
class Note(BaseModel):
    title: str
    content: str

# --- API Endpoints ---

@app.get("/")
def read_root():
    """
    Root endpoint to check if the server is running.
    """
    return {"message": "Welcome to the Hackathon Backend!"}

@app.get("/notes")
def get_notes():
    """
    Retrieve all notes from the 'notes' table in Supabase.
    """
    response = supabase.table('notes').select("*").execute()
    return response.data

@app.post("/notes")
def create_note(note: Note):
    """
    Create a new note in the 'notes' table.
    The note data is passed in the request body as a JSON object.
    """
    data = {"title": note.title, "content": note.content}
    response = supabase.table('notes').insert(data).execute()
    return response.data

@app.put("/notes/{note_id}")
def update_note(note_id: int, note: Note):
    """
    Update an existing note in the 'notes' table.
    The note_id is passed as a path parameter.
    The updated note data is passed in the request body as a JSON object.
    """
    data = {"title": note.title, "content": note.content}
    response = supabase.table('notes').update(data).eq('id', note_id).execute()
    return response.data

@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    """
    Delete a note from the 'notes' table.
    The note_id is passed as a path parameter.
    """
    response = supabase.table('notes').delete().eq('id', note_id).execute()
    return response.data 