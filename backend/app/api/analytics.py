from typing import Any
from fastapi import APIRouter
from app.db.init import connect

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview")
def get_overview() -> dict[str, Any]:
    conn = connect()
    try:
        total_vehicles = conn.execute("SELECT COUNT(*) FROM vehicles").fetchone()[0]
        total_deliveries = conn.execute("SELECT COUNT(*) FROM deliveries").fetchone()[0]
        pending = conn.execute("SELECT COUNT(*) FROM deliveries WHERE status = 'Pending'").fetchone()[0]
        delivered = conn.execute("SELECT COUNT(*) FROM deliveries WHERE status = 'Delivered'").fetchone()[0]
        
        # Calculate total weight in the system
        total_weight = conn.execute("SELECT SUM(weight) FROM deliveries").fetchone()[0] or 0
        
        return {
            "total_vehicles": total_vehicles,
            "total_deliveries": total_deliveries,
            "pending_deliveries": pending,
            "delivered_deliveries": delivered,
            "total_weight_kg": round(total_weight, 2)
        }
    finally:
        conn.close()

@router.get("/fleet-usage")
def get_fleet_usage() -> list[dict[str, Any]]:
    conn = connect()
    try:
        # Count how many deliveries are assigned to each vehicle
        rows = conn.execute(
            """SELECT v.registration, COUNT(d.id) as delivery_count
               FROM vehicles v
               LEFT JOIN deliveries d ON d.assigned_vehicle_id = v.id
               GROUP BY v.id
               ORDER BY delivery_count DESC"""
        ).fetchall()
        
        return [{"name": r[0], "deliveries": r[1]} for r in rows]
    finally:
        conn.close()
