from sqlalchemy.orm import Session
from app.db.models import User, Ticket, Incident, Parking, Asset, SustainabilityLog, TransportStatus, CrowdSensor, Notification
from app.core.security import get_password_hash
from datetime import datetime, timedelta

def seed_db(db: Session):
    # Check if we already have seed data
    if db.query(User).filter_by(email="admin@stadiumos.ai").first():
        print("Database already seeded.")
        return

    print("Seeding database...")
    
    # 1. Create Users
    users = [
        User(name="Platform Director", email="superadmin@stadiumos.ai", hashed_password=get_password_hash("superadmin123"), role="SUPER_ADMIN", employee_id="EMP-001"),
        User(name="Operations Commander", email="admin@stadiumos.ai", hashed_password=get_password_hash("admin123"), role="ADMIN", employee_id="EMP-100"),
        User(name="FIFA Match Director", email="organizer@stadiumos.ai", hashed_password=get_password_hash("organizer123"), role="ORGANIZER", employee_id="EMP-500"),
        User(name="Security Lead Officer", email="security@stadiumos.ai", hashed_password=get_password_hash("security123"), role="SECURITY", employee_id="EMP-200"),
        User(name="Medical Chief Coordinator", email="medical@stadiumos.ai", hashed_password=get_password_hash("medical123"), role="MEDICAL", employee_id="EMP-300"),
        User(name="Volunteer Coordinator", email="volunteer@stadiumos.ai", hashed_password=get_password_hash("volunteer123"), role="VOLUNTEER", volunteer_id="VOL-400"),
        User(name="Gianni VIP Guest", email="vip@stadiumos.ai", hashed_password=get_password_hash("vip123"), role="VIP", fifa_id="FIFA-999"),
        User(name="Concession Vendor", email="vendor@stadiumos.ai", hashed_password=get_password_hash("vendor123"), role="VENDOR"),
        User(name="John Doe Fan", email="john@stadiumos.ai", hashed_password=get_password_hash("fan123"), role="FAN"),
        User(name="Jane Smith Fan", email="jane@stadiumos.ai", hashed_password=get_password_hash("fan123"), role="FAN"),
    ]
    for u in users:
        db.add(u)
    db.commit()
    
    # Retrieve user ids
    admin_user = db.query(User).filter_by(email="admin@stadiumos.ai").first()
    sec_user = db.query(User).filter_by(email="security@stadiumos.ai").first()
    john_fan = db.query(User).filter_by(email="john@stadiumos.ai").first()
    jane_fan = db.query(User).filter_by(email="jane@stadiumos.ai").first()

    # 2. Tickets
    tickets = [
        Ticket(ticket_no="TICKET-2026-FIFA-001", match_id="MATCH-M1", user_id=john_fan.id, tier="CATEGORY_1", gate="GATE_A", seat="SEC102-ROW12-SEAT5", fraud_status="VERIFIED", status="ACTIVE"),
        Ticket(ticket_no="TICKET-2026-FIFA-002", match_id="MATCH-M1", user_id=jane_fan.id, tier="CATEGORY_2", gate="GATE_B", seat="SEC204-ROW5-SEAT17", fraud_status="VERIFIED", status="ACTIVE"),
        Ticket(ticket_no="TICKET-2026-FIFA-999", match_id="MATCH-M1", user_id=None, tier="PRESS", gate="GATE_PRESS", seat="PRESS-ROW1-SEAT3", fraud_status="SUSPICIOUS", status="ACTIVE"),
    ]
    for t in tickets:
        db.add(t)
        
    # 3. Incidents
    incidents = [
        Incident(
            title="Crowd Bottleneck at Entrance Gate A",
            description="Entry queue is backed up past the outer perimeter gate. Fans experiencing wait times exceeding 35 minutes.",
            category="SECURITY",
            severity="HIGH",
            status="OPEN",
            location="Gate A External Access Point",
            assigned_to_user_id=sec_user.id,
            reporter_id=admin_user.id,
            ai_summary="High volume queue bottleneck reported at Gate A External Access Point. Suggested dispatching local volunteer stewards to guide fans to Gate B alternative entrance."
        ),
        Incident(
            title="Water Leakage in VIP Lounge Restroom",
            description="Minor flooding detected on the floor. Cleaning staff and plumbing technician required immediately.",
            category="MAINTENANCE",
            severity="MEDIUM",
            status="ASSIGNED",
            location="VIP Pavilion Suite 3 East RESTROOM",
            assigned_to_user_id=None,
            reporter_id=admin_user.id,
            ai_summary="Plumbing failure causing flooring overflow in VIP East Section. Maintenance team notified for structural containment."
        ),
        Incident(
            title="Fan Heat Stroke in Sector 108",
            description="Male fan, late 20s, exhibiting symptoms of severe heat stroke. Conscious but confused. Needs ice and stretcher dispatch.",
            category="MEDICAL",
            severity="HIGH",
            status="OPEN",
            location="Sector 108, Row 15",
            assigned_to_user_id=None,
            reporter_id=sec_user.id,
            ai_summary="Heat emergency reported in Sector 108. Medical Response Team B dispatched with cooling blanket and vitals scanner."
        ),
    ]
    for inc in incidents:
        db.add(inc)

    # 4. Parking Lots
    parking_lots = [
        Parking(sector="LOT_A_VIP", total_spots=200, occupied_spots=150, reserve_spots=40, EV_charger_spots=20, sensor_status="OPERATIONAL", ai_prediction_score=95.0),
        Parking(sector="LOT_B_GENERAL", total_spots=1200, occupied_spots=840, reserve_spots=0, EV_charger_spots=50, sensor_status="OPERATIONAL", ai_prediction_score=78.2),
        Parking(sector="LOT_C_SHUTTLES", total_spots=150, occupied_spots=45, reserve_spots=80, EV_charger_spots=10, sensor_status="OPERATIONAL", ai_prediction_score=40.0),
        Parking(sector="LOT_D_STAFF", total_spots=350, occupied_spots=280, reserve_spots=30, EV_charger_spots=15, sensor_status="OFFLINE", ai_prediction_score=85.0),
    ]
    for p in parking_lots:
        db.add(p)

    # 5. Assets
    assets = [
        Asset(name="Fifa Drone Monitor Alpha", code="DRN-001", status="OPERATIONAL", location="Gate A Airspace", type="DRONE"),
        Asset(name="Fifa Drone Monitor Beta", code="DRN-002", status="MAINTENANCE_REQUIRED", location="Hangar Suite 2", type="DRONE"),
        Asset(name="Thermal Imaging Camera GATE A-1", code="CAM-GA-01", status="OPERATIONAL", location="Gate A Turnstiles", type="CAMERA"),
        Asset(name="CCTV Main Stand East 4K", code="CAM-MSE-04", status="OPERATIONAL", location="Main Stand East Section 105", type="CAMERA"),
        Asset(name="Emergency Radio Pack Alpha", code="RAD-RP-01", status="IN_TRANSIT", location="Command Center Dispatch", type="RADIOPACK"),
    ]
    for a in assets:
        db.add(a)

    # 6. Sustainability Logs
    # Seed current day logs (simulating Hourly / Daily metrics)
    now = datetime.utcnow()
    logs = [
        # Energy (kWh)
        SustainabilityLog(category="ENERGY", value=1240.5, unit="kWh", recorded_at=now - timedelta(hours=3)),
        SustainabilityLog(category="ENERGY", value=1450.2, unit="kWh", recorded_at=now - timedelta(hours=2)),
        SustainabilityLog(category="ENERGY", value=1850.8, unit="kWh", recorded_at=now - timedelta(hours=1)),
        # Water (Liters)
        SustainabilityLog(category="WATER", value=8500.0, unit="Liters", recorded_at=now - timedelta(hours=3)),
        SustainabilityLog(category="WATER", value=9200.0, unit="Liters", recorded_at=now - timedelta(hours=2)),
        SustainabilityLog(category="WATER", value=11800.0, unit="Liters", recorded_at=now - timedelta(hours=1)),
        # Waste (kg)
        SustainabilityLog(category="WASTE", value=320.0, unit="kg", recorded_at=now - timedelta(hours=2)),
        SustainabilityLog(category="WASTE", value=480.0, unit="kg", recorded_at=now - timedelta(hours=1)),
        # Carbon (kg CO2 equivalents)
        SustainabilityLog(category="CARBON", value=125.4, unit="kg_CO2", recorded_at=now - timedelta(hours=2)),
        SustainabilityLog(category="CARBON", value=188.7, unit="kg_CO2", recorded_at=now - timedelta(hours=1)),
    ]
    for log in logs:
        db.add(log)

    # 7. Transport status
    routes = [
        TransportStatus(route_name="Red Line Metro", type="METRO", delay_minutes=0, status="NORMAL", driver_contact="+1-555-0100"),
        TransportStatus(route_name="Blue Line Metro", type="METRO", delay_minutes=4, status="DELAYED", driver_contact="+1-555-0101"),
        TransportStatus(route_name="Downtown Shuttle Loop", type="SHUTTLE", delay_minutes=15, status="OVERCROWDED", driver_contact="+1-555-0201"),
        TransportStatus(route_name="North Parking Express Bus", type="BUS", delay_minutes=2, status="NORMAL", driver_contact="+1-555-0300"),
    ]
    for r in routes:
        db.add(r)

    # 8. Crowd Sensors
    sensors = [
        CrowdSensor(section="GATE_A", gate="Gate A Turnstiles", count=2800, speed_m_s=0.4, density_score=0.85, status="ACTIVE"),
        CrowdSensor(section="GATE_B", gate="Gate B Turnstiles", count=1450, speed_m_s=1.1, density_score=0.42, status="ACTIVE"),
        CrowdSensor(section="GATE_C", gate="Gate C Turnstiles", count=920, speed_m_s=1.3, density_score=0.28, status="ACTIVE"),
        CrowdSensor(section="CONCOURSE_EAST", gate=None, count=4500, speed_m_s=0.9, density_score=0.61, status="ACTIVE"),
        CrowdSensor(section="SECTOR_102", gate=None, count=1200, speed_m_s=0.3, density_score=0.74, status="ACTIVE"),
        CrowdSensor(section="SECTOR_204", gate=None, count=650, speed_m_s=1.2, density_score=0.35, status="ACTIVE"),
        CrowdSensor(section="GATE_PRESS", gate="Media Gate", count=110, speed_m_s=1.4, density_score=0.15, status="ACTIVE"),
    ]
    for s in sensors:
        db.add(s)

    # 9. Notifications
    notifs = [
        Notification(target_role="ALL", message="Kick-off in 2 hours. Please head to your designated gates early.", type="BROADCAST"),
        Notification(target_role="SECURITY", message="Incident ID #1: Gate A Crowd Bottleneck requires immediate deploy of local volunteers.", type="ALERT"),
        Notification(target_role="MEDICAL", message="Incident ID #3: Heat emergency reported in Sector 108. Dispatch Med Unit 2.", type="ALERT"),
    ]
    for n in notifs:
        db.add(n)

    db.commit()
    print("Database seeding completed successfully.")
