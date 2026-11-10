from typing import Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.db.init import connect

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

class VehicleIn(BaseModel):
    registration: str = Field(min_length=2, max_length=20)
    v_type: str
    max_load: float = Field(gt=0)
    fuel_type: str
    cost_per_km: float = Field(ge=0)
    lat: float
    lng: float

class VehicleStatusIn(BaseModel):
    status: str

@router.post("", status_code=201)
def create_vehicle(body: VehicleIn) -> dict[str, Any]:
    conn = connect()
    try:
        cur = conn.execute(
            """INSERT INTO vehicles (registration, v_type, max_load, fuel_type, cost_per_km, lat, lng)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (body.registration, body.v_type, body.max_load, body.fuel_type, body.cost_per_km, body.lat, body.lng)
        )
        vehicle_id = cur.lastrowid
    except Exception as e:
        raise HTTPException(400, f"Registration must be unique. Error: {e}")
    finally:
        conn.close()
    return {"id": vehicle_id, "status": "Available"}

@router.get("")
def list_vehicles(status: Optional[str] = None) -> list[dict[str, Any]]:
    conn = connect()
    try:
        sql = "SELECT id, registration, v_type, max_load, current_load, fuel_type, cost_per_km, lat, lng, status, maintenance_status FROM vehicles"
        params = []
        if status:
            sql += " WHERE status = ?"
            params.append(status)
        sql += " ORDER BY id DESC"
        
        rows = conn.execute(sql, params).fetchall()
    finally:
        conn.close()
        
    return [
        {
            "id": r[0], "registration": r[1], "v_type": r[2], "max_load": r[3],
            "current_load": r[4], "fuel_type": r[5], "cost_per_km": r[6],
            "lat": r[7], "lng": r[8], "status": r[9], "maintenance": r[10]
        } for r in rows
    ]

@router.patch("/{vid}/status")
def update_status(vid: int, body: VehicleStatusIn) -> dict[str, str]:
    valid_statuses = ['Available', 'Assigned', 'In Transit', 'Maintenance', 'Inactive']
    if body.status not in valid_statuses:
        raise HTTPException(400, f"Status must be one of {valid_statuses}")
        
    conn = connect()
    try:
        cur = conn.execute("UPDATE vehicles SET status = ? WHERE id = ?", (body.status, vid))
        if cur.rowcount == 0:
            raise HTTPException(404, "Vehicle not found")
    finally:
        conn.close()
    return {"status": "updated", "new_status": body.status}