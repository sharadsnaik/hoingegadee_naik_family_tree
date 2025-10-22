from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import uvicorn

load_dotenv()
app = FastAPI()
app.add_middleware(
     CORSMiddleware,
    allow_origins=['http://localhost:3000'], # Replace with your frontend URL in production
    # allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Include OPTIONS for preflight
    allow_headers=["Content-Type", "Authorization"],

)
import os
client = AsyncIOMotorClient(os.getenv('mongo_uri'))
db_name = client['Family_tree_DATABASE']
collection_name_mongodb = db_name['Family_data_collection_V1']
print(f"✅ Connected to MongoDB: {db_name}")


class form_data_from_frontend(BaseModel):
        user_name: str
        father_name: str
        mother_name: str
        Phone_number: str
        adress: str

@app.post('/submit')
async def submit_form(data: form_data_from_frontend):
        collection_name_mongodb.insert_one(data.model_dump())
        return {"message": "Data saved successfully"}

if __name__ == '__main__':
        uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)        