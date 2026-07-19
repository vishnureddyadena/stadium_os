from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.auth.router import get_current_user
from app.db.models import User, Incident, Parking, TransportStatus, SustainabilityLog, Asset, Ticket, Notification
from app.services.ai_service import GenAIEngine

router = APIRouter(prefix="/modules", tags=["Stadium Operations Modules"])

# Pydantic Schemas
class IncidentCreate(BaseModel):
    title: str
    description: str
    category: str  # SECURITY, MEDICAL, MAINTENANCE, HAZARD
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    location: str

class IncidentUpdate(BaseModel):
    status: Optional[str] = None  # OPEN, ASSIGNED, RESOLVED
    assigned_to_user_id: Optional[int] = None

class AssetCreate(BaseModel):
    name: str
    code: str
    type: str  # DRONE, CAMERA, SENSOR, VEHICLE, RADIOPACK
    location: str

class TicketScanRequest(BaseModel):
    ticket_no: str
    gate: str

class NotificationCreate(BaseModel):
    message: str
    target_role: str = "ALL"  # ALL, FAN, SECURITY, VOLUNTEER, etc.
    type: str = "ALERT"  # EMERGENCY, BROADCAST, ALERT, PERSONAL

# 1. INCIDENTS ENDPOINTS
@router.get("/incidents")
def get_incidents(category: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Incident)
    if category:
        query = query.filter(Incident.category == category.upper())
    return query.order_by(Incident.created_at.desc()).all()

@router.post("/incidents")
def create_incident(inc: IncidentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Generate AI brief summary and dispatches on creation
    ai_summary = GenAIEngine.get_incident_summary(inc.title, inc.description)
    
    new_inc = Incident(
        title=inc.title,
        description=inc.description,
        category=inc.category.upper(),
        severity=inc.severity.upper(),
        location=inc.location,
        reporter_id=current_user.id,
        ai_summary=ai_summary,
        status="OPEN"
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)
    return new_inc

@router.patch("/incidents/{incident_id}")
def update_incident(incident_id: int, inc_up: IncidentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    if inc_up.status:
        inc.status = inc_up.status.upper()
    if inc_up.assigned_to_user_id is not None:
        if inc_up.assigned_to_user_id == 0:
            inc.assigned_to_user_id = None
        else:
            inc.assigned_to_user_id = inc_up.assigned_to_user_id
            
    db.commit()
    db.refresh(inc)
    return inc

# 2. PARKING ENDPOINTS
@router.get("/parking")
def get_parking(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Parking).all()

# 3. TRANSPORT ROUTE ENDPOINTS
@router.get("/transport")
def get_transport_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(TransportStatus).all()

# 4. SUSTAINABILITY HISTORICAL CHARTS ENDPOINTS
@router.get("/sustainability/history")
def get_sustainability_history(category: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Pull logs for the last 24 hours
    limit_time = datetime.utcnow() - timedelta(hours=24)
    logs = db.query(SustainabilityLog).filter(
        SustainabilityLog.category == category.upper(),
        SustainabilityLog.recorded_at >= limit_time
    ).order_by(SustainabilityLog.recorded_at.asc()).all()
    
    return [
        {
            "id": log.id,
            "category": log.category,
            "value": log.value,
            "unit": log.unit,
            "recorded_at": log.recorded_at.isoformat()
        } for log in logs
    ]

# 5. ASSET TRACKING ENDPOINTS
@router.get("/assets")
def get_assets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Asset).all()

@router.post("/assets")
def create_asset(ast: AssetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_asset = Asset(
        name=ast.name,
        code=ast.code,
        type=ast.type.upper(),
        location=ast.location,
        status="OPERATIONAL"
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

# 6. TICKET SCANNER & FRAUD DETECTION ENDPOINTS
@router.post("/tickets/verify")
def verify_ticket(req: TicketScanRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = db.query(Ticket).filter(Ticket.ticket_no == req.ticket_no).first()
    
    if not ticket:
        raise HTTPException(
            status_code=404, 
            detail="⚠️ INVALID TICKET: QR code signature is unknown to the FIFA registry."
        )
        
    # AI Fraud Detection check
    if ticket.fraud_status == "SUSPICIOUS":
        # Automatically log a security incident
        ai_summary = "AI Fraud Alert: Scanned ticket flag triggers duplicate usage mismatch at press terminal gate."
        fraud_incident = Incident(
            title="Ticket Fraud Alert: Code Signature Mismatch",
            description=f"Ticket {ticket.ticket_no} flagged as duplicate scan at gate {req.gate}. Original scan located at Gate A.",
            category="SECURITY",
            severity="HIGH",
            status="OPEN",
            location=f"{req.gate} Access Point",
            ai_summary=ai_summary
        )
        db.add(fraud_incident)
        db.commit()
        
        return {
            "status": "FRAUD_DETECTED",
            "message": "🚨 TICKET BLOCKED: Potential duplicate/cloned scan pattern detected. Security detail has been notified.",
            "ticket": {
                "ticket_no": ticket.ticket_no,
                "tier": ticket.tier,
                "seat": ticket.seat,
                "gate": ticket.gate
            }
        }
        
    if ticket.status == "USED":
        return {
            "status": "ALREADY_USED",
            "message": "⚠️ Ticket has already been scanned. Verify scan timestamp.",
            "ticket": {
                "ticket_no": ticket.ticket_no,
                "tier": ticket.tier,
                "seat": ticket.seat,
                "gate": ticket.gate
            }
        }

    # Successful ticket scan, mark it as used
    ticket.status = "USED"
    db.commit()
    
    return {
        "status": "APPROVED",
        "message": "✅ ACCESS GRANTED. Welcome to FIFA World Cup 2026!",
        "ticket": {
            "ticket_no": ticket.ticket_no,
            "tier": ticket.tier,
            "seat": ticket.seat,
            "gate": ticket.gate
        }
    }

# 7. BROADCAST NOTIFICATIONS
@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(15).all()

@router.post("/notifications")
def create_notification(notif: NotificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_notif = Notification(
        message=notif.message,
        target_role=notif.target_role.upper(),
        type=notif.type.upper()
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)
    return new_notif


class SustainabilityLogCreate(BaseModel):
    category: str
    value: float
    unit: str


class TransportStatusCreate(BaseModel):
    route_name: str
    type: str
    delay_minutes: int
    status: str
    driver_contact: str


class ParkingSectorUpdate(BaseModel):
    sector: str
    occupied_spots: int


@router.post("/sustainability")
def create_sustainability_log(log: SustainabilityLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_log = SustainabilityLog(
        category=log.category.upper(),
        value=log.value,
        unit=log.unit,
        recorded_at=datetime.utcnow()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.post("/transport")
def create_transport_route(route: TransportStatusCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_route = TransportStatus(
        route_name=route.route_name,
        type=route.type.upper(),
        delay_minutes=route.delay_minutes,
        status=route.status.upper(),
        driver_contact=route.driver_contact
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    return new_route


@router.post("/parking/update")
def update_parking_sector_spots(p_update: ParkingSectorUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sector_record = db.query(Parking).filter(Parking.sector == p_update.sector).first()
    if not sector_record:
        raise HTTPException(status_code=404, detail="Parking sector not found")
    
    sector_record.occupied_spots = p_update.occupied_spots
    db.commit()
    db.refresh(sector_record)
    return sector_record

