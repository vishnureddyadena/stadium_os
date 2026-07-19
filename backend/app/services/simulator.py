import asyncio
import random
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.db.models import CrowdSensor, Parking, TransportStatus, SustainabilityLog, Incident
from app.api.live.connection_manager import manager

logger = logging.getLogger("stadium_os_sim")

async def run_telemetry_simulator():
    """
    Background simulation worker. Updates stadium telemetry every 5 seconds 
    and broadcasts the state to all connected dashboard WebSocket clients.
    """
    logger.info("Starting Stadium OS telemetry simulator...")
    await asyncio.sleep(3)  # Wait for startup
    
    while True:
        try:
            db: Session = SessionLocal()
            
            # 1. Update Crowd Sensors
            sensors = db.query(CrowdSensor).all()
            crowd_data = []
            for sensor in sensors:
                # Add/subtract crowd count
                change = random.randint(-15, 35)
                sensor.count = max(50, sensor.count + change)
                
                # Dynamic flow speed and density calculation
                if sensor.count > 3000:
                    sensor.speed_m_s = round(random.uniform(0.2, 0.5), 2)
                    sensor.density_score = round(random.uniform(0.75, 0.95), 2)
                elif sensor.count > 1500:
                    sensor.speed_m_s = round(random.uniform(0.6, 1.0), 2)
                    sensor.density_score = round(random.uniform(0.4, 0.74), 2)
                else:
                    sensor.speed_m_s = round(random.uniform(1.1, 1.6), 2)
                    sensor.density_score = round(random.uniform(0.1, 0.39), 2)
                    
                sensor.updated_at = datetime.utcnow()
                crowd_data.append({
                    "id": sensor.id,
                    "section": sensor.section,
                    "gate": sensor.gate,
                    "count": sensor.count,
                    "speed_m_s": sensor.speed_m_s,
                    "density_score": sensor.density_score,
                    "status": sensor.status
                })

            # 2. Update Parking Occupancy
            parking_lots = db.query(Parking).all()
            parking_data = []
            for lot in parking_lots:
                if lot.sensor_status == "OPERATIONAL":
                    # Fluctuate spaces slightly
                    change = random.choice([-1, 0, 1, 2])
                    lot.occupied_spots = min(lot.total_spots - lot.reserve_spots, max(10, lot.occupied_spots + change))
                    # Predict utilization %
                    lot.ai_prediction_score = round((lot.occupied_spots / lot.total_spots) * 100, 1)
                
                lot.updated_at = datetime.utcnow()
                parking_data.append({
                    "id": lot.id,
                    "sector": lot.sector,
                    "total_spots": lot.total_spots,
                    "occupied_spots": lot.occupied_spots,
                    "reserve_spots": lot.reserve_spots,
                    "EV_charger_spots": lot.EV_charger_spots,
                    "sensor_status": lot.sensor_status,
                    "ai_prediction_score": lot.ai_prediction_score
                })

            # 3. Fluctuate Transport Status Delay
            transport_routes = db.query(TransportStatus).all()
            transport_data = []
            for route in transport_routes:
                if random.random() < 0.15:  # 15% chance of delay change
                    delay_delta = random.choice([-1, 1, 2])
                    route.delay_minutes = max(0, route.delay_minutes + delay_delta)
                    
                    if route.delay_minutes > 10:
                        route.status = "DELAYED"
                    elif route.delay_minutes > 15:
                        route.status = "OVERCROWDED"
                    else:
                        route.status = "NORMAL"
                
                route.updated_at = datetime.utcnow()
                transport_data.append({
                    "id": route.id,
                    "route_name": route.route_name,
                    "type": route.type,
                    "delay_minutes": route.delay_minutes,
                    "status": route.status,
                    "driver_contact": route.driver_contact
                })

            # 4. Generate Sustainability Metric Logs
            now = datetime.utcnow()
            energy_val = round(1500 + random.uniform(-200, 350), 1)
            water_val = round(10000 + random.uniform(-1000, 1500), 1)
            waste_val = round(400 + random.uniform(-50, 80), 1)
            carbon_val = round(150 + random.uniform(-20, 45), 1)
            
            db.add(SustainabilityLog(category="ENERGY", value=energy_val, unit="kWh", recorded_at=now))
            db.add(SustainabilityLog(category="WATER", value=water_val, unit="Liters", recorded_at=now))
            db.add(SustainabilityLog(category="WASTE", value=waste_val, unit="kg", recorded_at=now))
            db.add(SustainabilityLog(category="CARBON", value=carbon_val, unit="kg_CO2", recorded_at=now))

            # Commit all changes to db
            db.commit()
            
            # Count open incidents
            open_incidents_count = db.query(Incident).filter(Incident.status != "RESOLVED").count()
            
            db.close()
            
            # Broadcast the new state to all sockets
            await manager.broadcast({
                "type": "TELEMETRY_UPDATE",
                "timestamp": now.isoformat(),
                "data": {
                    "crowd_sensors": crowd_data,
                    "parking": parking_data,
                    "transport": transport_data,
                    "active_incidents_count": open_incidents_count,
                    "sustainability": {
                        "energy": {"value": energy_val, "unit": "kWh"},
                        "water": {"value": water_val, "unit": "Liters"},
                        "waste": {"value": waste_val, "unit": "kg"},
                        "carbon": {"value": carbon_val, "unit": "kg_CO2"}
                    }
                }
            })
            
        except Exception as e:
            logger.error(f"Simulator loop error: {e}")
            
        await asyncio.sleep(5)
