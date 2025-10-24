from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class ExerciseStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exercise_type: str  # "intervalles", "accords_3", "accords_4", "modes"
    success_count: int = 0
    attempt_count: int = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExerciseStatsCreate(BaseModel):
    exercise_type: str
    success_count: int = 0
    attempt_count: int = 0

class ExerciseStatsUpdate(BaseModel):
    success_count: Optional[int] = None
    attempt_count: Optional[int] = None


# Routes
@api_router.get("/")
async def root():
    return {"message": "Musical Ear Training API"}

@api_router.post("/stats", response_model=ExerciseStats)
async def create_stats(input: ExerciseStatsCreate):
    stats_dict = input.model_dump()
    stats_obj = ExerciseStats(**stats_dict)
    
    doc = stats_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.exercise_stats.insert_one(doc)
    return stats_obj

@api_router.get("/stats/{exercise_type}", response_model=List[ExerciseStats])
async def get_stats(exercise_type: str):
    stats = await db.exercise_stats.find(
        {"exercise_type": exercise_type},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10).to_list(10)
    
    for stat in stats:
        if isinstance(stat['timestamp'], str):
            stat['timestamp'] = datetime.fromisoformat(stat['timestamp'])
    
    return stats

@api_router.delete("/stats/{exercise_type}")
async def delete_stats(exercise_type: str):
    result = await db.exercise_stats.delete_many({"exercise_type": exercise_type})
    return {"deleted_count": result.deleted_count}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()