from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from datetime import datetime
from app.core.database import get_db
from app.api.auth.router import get_current_user
from app.db.models import User, Ticket, SustainabilityLog
from app.services.ai_service import GenAIEngine

router = APIRouter(prefix="/ai", tags=["AI Copilot Services"])

# Pydantic Request schemas
class RouteRequest(BaseModel):
    start: str
    end: str
    wheelchair: bool = False

class UpgradeRequest(BaseModel):
    ticket_no: str
    section: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class QueryRequest(BaseModel):
    prompt: str

class IncidentSummaryRequest(BaseModel):
    title: str
    description: str



@router.post("/route-plan")
def get_route_plan(req: RouteRequest, current_user: User = Depends(get_current_user)):
    try:
        route_text = GenAIEngine.get_route_plan(req.start, req.end, req.wheelchair)
        return {"route": route_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seat-upgrade")
def get_seat_upgrade(req: UpgradeRequest, current_user: User = Depends(get_current_user)):
    try:
        upgrade_text = GenAIEngine.get_upgrade_recommendation(req.ticket_no, req.section)
        return {"recommendation": upgrade_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sustainability-advisor")
def get_sustainability_advisor(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Pull latest logs
        latest_energy = db.query(SustainabilityLog).filter_by(category="ENERGY").order_by(SustainabilityLog.recorded_at.desc()).first()
        latest_water = db.query(SustainabilityLog).filter_by(category="WATER").order_by(SustainabilityLog.recorded_at.desc()).first()
        latest_waste = db.query(SustainabilityLog).filter_by(category="WASTE").order_by(SustainabilityLog.recorded_at.desc()).first()
        latest_carbon = db.query(SustainabilityLog).filter_by(category="CARBON").order_by(SustainabilityLog.recorded_at.desc()).first()
        
        stats = {
            "energy": {"value": latest_energy.value if latest_energy else 1850.8, "unit": "kWh"},
            "water": {"value": latest_water.value if latest_water else 11800.0, "unit": "Liters"},
            "waste": {"value": latest_waste.value if latest_waste else 480.0, "unit": "kg"},
            "carbon": {"value": latest_carbon.value if latest_carbon else 188.7, "unit": "kg_CO2"}
        }
        
        advice = GenAIEngine.get_sustainability_advisor(stats)
        return {"stats": stats, "advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate")
def translate_text(req: TranslateRequest, current_user: User = Depends(get_current_user)):
    try:
        translated = GenAIEngine.get_translation(req.text, req.target_language)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/incident-summary")
def get_incident_summary(req: IncidentSummaryRequest, current_user: User = Depends(get_current_user)):
    try:
        summary = GenAIEngine.get_incident_summary(req.title, req.description)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
def general_query(req: QueryRequest, current_user: User = Depends(get_current_user)):
    try:
        response = GenAIEngine._call_llm(req.prompt)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/emotion-analysis")
def get_emotion_analysis(current_user: User = Depends(get_current_user)):
    # Simulates real-time crowd emotion tracker
    emotions = {
        "JOY": 68,
        "EXCITEMENT": 82,
        "FRUSTRATION": 14,
        "CALM": 45,
        "ANXIETY": 8
    }
    advice = (
        "💡 **AI Safety Advisor Note:** Overall stadium mood is highly positive (82% excitement index). "
        "Frustration is localized near Gate A parking entrances due to bottlenecks. "
        "Action: Adjusting visual display signage at Sector 102 turnstiles to display positive cheering animations to sustain the positive atmosphere."
    )
    return {"emotions": emotions, "advice": advice}


