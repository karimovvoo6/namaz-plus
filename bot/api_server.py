from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from services.prayer_api import get_prayer_times_by_coords

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # на проде лучше ограничить
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Dict, Any

@app.get("/api/prayer-times")
def prayer_times(
    lat: float = Query(...),
    lng: float = Query(...),
    date: str = Query(default=None),
):
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
        
    timings = get_prayer_times_by_coords(lat, lng, date)
    if not timings:
        return {"source": "bot-api", "date": date, "timings": {}}

    return {
        "source": "bot-api",
        "date": date,
        "timings": {
            "Fajr": timings["Fajr"][:5],
            "Dhuhr": timings["Dhuhr"][:5],
            "Asr": timings["Asr"][:5],
            "Maghrib": timings["Maghrib"][:5],
            "Isha": timings["Isha"][:5],
        }
    }

@app.post("/api/user/{telegram_id}/settings")
def save_settings(telegram_id: int, settings: Dict[str, Any]):
    return {"status": "ok", "telegram_id": telegram_id}
