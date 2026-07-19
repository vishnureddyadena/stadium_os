from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    employee_id = Column(String, unique=True, index=True, nullable=True)
    volunteer_id = Column(String, unique=True, index=True, nullable=True)
    fifa_id = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="FAN")  # FAN, VOLUNTEER, SECURITY, MEDICAL, ORGANIZER, VIP, ADMIN, SUPER_ADMIN
    biometric_id = Column(String, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    lockout_until = Column(DateTime, nullable=True)
    mfa_secret = Column(String, nullable=True)
    mfa_enabled = Column(Boolean, default=False)
    onboarded = Column(Boolean, default=True) # Default to true for existing seeded users
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tickets = relationship("Ticket", back_populates="user")
    reported_incidents = relationship("Incident", foreign_keys="Incident.reporter_id", back_populates="reporter")
    assigned_incidents = relationship("Incident", foreign_keys="Incident.assigned_to_user_id", back_populates="assigned_to")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_no = Column(String, unique=True, index=True, nullable=False)
    match_id = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    tier = Column(String, nullable=False)  # CATEGORY_1, CATEGORY_2, CATEGORY_3, VIP, PRESS
    gate = Column(String, nullable=False)  # GATE_A, GATE_B, etc.
    seat = Column(String, nullable=False)
    fraud_status = Column(String, nullable=False, default="VERIFIED")  # VERIFIED, SUSPICIOUS, BLOCKED
    status = Column(String, nullable=False, default="ACTIVE")  # ACTIVE, USED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tickets")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)  # SECURITY, MEDICAL, MAINTENANCE, HAZARD
    severity = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, nullable=False, default="OPEN")  # OPEN, ASSIGNED, RESOLVED
    location = Column(String, nullable=False)  # Section 102, Gate A, Concourse, etc.
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ai_summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_incidents")
    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id], back_populates="assigned_incidents")

class Parking(Base):
    __tablename__ = "parking"

    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String, unique=True, index=True, nullable=False)  # LOT_A, LOT_B, etc.
    total_spots = Column(Integer, nullable=False)
    occupied_spots = Column(Integer, nullable=False, default=0)
    reserve_spots = Column(Integer, nullable=False, default=0)
    EV_charger_spots = Column(Integer, nullable=False, default=0)
    sensor_status = Column(String, nullable=False, default="OPERATIONAL")  # OPERATIONAL, MAINTENANCE, OFFLINE
    ai_prediction_score = Column(Float, nullable=False, default=0.0)  # Predicted utilization % (0-100)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, nullable=False, default="OPERATIONAL")  # OPERATIONAL, MAINTENANCE_REQUIRED, IN_TRANSIT
    location = Column(String, nullable=False)
    type = Column(String, nullable=False)  # DRONE, CAMERA, SENSOR, VEHICLE, RADIOPACK
    last_serviced = Column(DateTime, default=datetime.utcnow)

class SustainabilityLog(Base):
    __tablename__ = "sustainability_logs"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)  # ENERGY, WATER, WASTE, CARBON
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # kWh, Liters, kg, kg_CO2
    recorded_at = Column(DateTime, default=datetime.utcnow)

class TransportStatus(Base):
    __tablename__ = "transport_status"

    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)  # BUS, SHUTTLE, METRO, TRAIN
    delay_minutes = Column(Integer, default=0)
    status = Column(String, nullable=False, default="NORMAL")  # NORMAL, DELAYED, OVERCROWDED
    driver_contact = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CrowdSensor(Base):
    __tablename__ = "crowd_sensors"

    id = Column(Integer, primary_key=True, index=True)
    section = Column(String, index=True, nullable=False)  # GATE_A, SECTOR_105, etc.
    gate = Column(String, nullable=True)
    count = Column(Integer, default=0)
    speed_m_s = Column(Float, default=1.2)  # Crowd flow velocity
    density_score = Column(Float, default=0.0)  # 0.0 - 1.0 (crowd thickness)
    status = Column(String, default="ACTIVE")  # ACTIVE, OFFLINE
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    target_role = Column(String, nullable=True)  # ALL, FAN, SECURITY, VOLUNTEER, etc.
    message = Column(String, nullable=False)
    type = Column(String, nullable=False, default="ALERT")  # EMERGENCY, BROADCAST, ALERT, PERSONAL
    read_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    user_id = Column(Integer, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token_hash = Column(String, unique=True, index=True, nullable=False)
    device_fingerprint = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    is_trusted = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserLoginHistory(Base):
    __tablename__ = "user_login_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    status = Column(String, nullable=False) # SUCCESS, FAILURE, LOCKOUT
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    device_fingerprint = Column(String, nullable=True)
    location_approx = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database indexes for optimization
Index('idx_incident_category_status', Incident.category, Incident.status)
Index('idx_crowd_sensors_section_density', CrowdSensor.section, CrowdSensor.density_score)
