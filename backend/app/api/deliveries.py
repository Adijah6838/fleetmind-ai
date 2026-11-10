from typing import Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.db.init import connect

router = APIRouter(prefix="/deliveries", tags=["deliveries"])

VALID_PRIORITIES = {"Low", "Normal", "High", "Urgent"}

class DeliveryIn(BaseModel):
    customer: str = Field(min_length=1, max_length=100)
    pickup_lat: float
    pickup_lng: float
    dest_lat: float
    dest_lng: float
    weight: float = Field(gt=0)
    priority: str = "Normal"
    window_start: Optional[str] = None
    window_end: Optional[str] = None

class DeliveryStatusIn(BaseModel):
    status: str

@router.post("", status_code=201)
def create_delivery(body: DeliveryIn) -> dict[str, Any]:
    if body.priority not in VALID_PRIORITIES:
        raise HTTPException(400, f"Priority must be one of {VALID_PRIORITIES}")
    conn = connect()
    try:
        cur = conn.execute(
            """INSERT INTO deliveries 
               (customer, pickup_lat, pickup_lng, dest_lat, dest_lng, weight, priority, window_start, window_end)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (body.customer, body.pickup_lat, body.pickup_lng, body.dest_lat, body.dest_lng,
             body.weight, body.priority, body.window_start, body.window_end)
        )
        did = cur.lastrowid
    finally:
        conn.close()
    return {"id": did, "status": "Pending"}

@router.get("")
def list_deliveries(status: Optional[str] = None, priority: Optional[str] = None) -> list[dict[str, Any]]:
    conn = connect()
    try:
        sql = """SELECT id, customer, pickup_lat, pickup_lng, dest_lat, dest_lng,
                        weight, priority, window_start, window_end, status, assigned_vehicle_id, created_at
                 FROM deliveries"""
        clauses, params = [], []
        if status:
            clauses.append("status = ?")
            params.append(status)
        if priority:
            clauses.append("priority = ?")
            params.append(priority)
        if clauses:
            sql += " WHERE " + " AND ".join(clauses)
        sql += " ORDER BY id DESC"
        rows = conn.execute(sql, params).fetchall()
    finally:
        conn.close()
    return [
        {"id": r[0], "customer": r[1], "pickup_lat": r[2], "pickup_lng": r[3],
         "dest_lat": r[4], "dest_lng": r[5], "weight": r[6], "priority": r[7],
         "window_start": r[8], "window_end": r[9], "status": r[10],
         "assigned_vehicle_id": r[11], "created_at": r[12]}
        for r in rows
    ]

@router.patch("/{did}/status")
def update_delivery_status(did: int, body: DeliveryStatusIn) -> dict[str, str]:
    valid = ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Delayed', 'Cancelled']
    if body.status not in valid:
        raise HTTPException(400, f"Status must be one of {valid}")
    conn = connect()
    try:
        cur = conn.execute("UPDATE deliveries SET status = ? WHERE id = ?", (body.status, did))
        if cur.rowcount == 0:
            raise HTTPException(404, "Delivery not found")
    finally:
        conn.close()
    return {"status": "updated", "new_status": body.status}

@router.delete("/{did}", status_code=204)
def delete_delivery(did: int) -> None:
    conn = connect()
    try:
        row = conn.execute("SELECT status FROM deliveries WHERE id = ?", (did,)).fetchone()
        if row is None:
            raise HTTPException(404, "Delivery not found")
        if row[0] not in ("Pending", "Cancelled"):
            raise HTTPException(400, "Only Pending or Cancelled deliveries can be deleted")
        conn.execute("DELETE FROM deliveries WHERE id = ?", (did,))
    finally:
        conn.close()