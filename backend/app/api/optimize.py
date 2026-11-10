import subprocess
from pathlib import Path
from typing import Any
from fastapi import APIRouter, HTTPException
from app.db.init import connect

router = APIRouter(prefix="/optimize", tags=["optimize"])

EXE_PATH = Path(__file__).resolve().parent.parent.parent.parent / "cpp_engine" / "vrp.exe"

PRIORITY_MAP = {"Low": 0, "Normal": 1, "High": 2, "Urgent": 3}

@router.post("/run")
def run_optimization() -> dict[str, Any]:
    conn = connect()
    try:
        # Fetch available vehicles
        vehicles = conn.execute(
            "SELECT id, max_load, lat, lng FROM vehicles WHERE status = 'Available'"
        ).fetchall()
        if not vehicles:
            raise HTTPException(400, "No available vehicles.")

        # Fetch pending deliveries
        deliveries = conn.execute(
            "SELECT id, weight, priority, dest_lat, dest_lng FROM deliveries WHERE status = 'Pending'"
        ).fetchall()
        if not deliveries:
            raise HTTPException(400, "No pending deliveries.")
    finally:
        conn.close()

    # Format input for C++
    lines = [f"{len(vehicles)} {len(deliveries)}"]
    for v in vehicles:
        lines.append(f"{v[1]} {v[2]} {v[3]}")
    for d in deliveries:
        lines.append(f"{d[1]} {PRIORITY_MAP[d[2]]} {d[3]} {d[4]}")
    input_str = "\n".join(lines) + "\n"

    # Call C++
    try:
        result = subprocess.run(
            [str(EXE_PATH)], input=input_str,
            text=True, capture_output=True, timeout=10.0
        )
    except FileNotFoundError:
        raise HTTPException(500, "vrp.exe not compiled. Run g++ -O3 -o vrp.exe vrp.cpp")

    if result.returncode != 0:
        raise HTTPException(500, f"C++ VRP Error: {result.stderr}")

    # Parse output & update DB
    output_lines = result.stdout.strip().split("\n")
    routes = []
    unassigned_count = 0
    
    conn = connect()
    try:
        conn.execute("BEGIN")
        for line in output_lines:
            parts = line.split()
            if parts[0] == "UNASSIGNED":
                unassigned_count = int(parts[1])
                continue
            
            vid = int(parts[0])
            total_dist = float(parts[1])
            num_assigned = int(parts[2])
            delivery_ids = [int(x) for x in parts[3:]]
            
            routes.append({"vehicle_id": vid, "distance_km": total_dist, "deliveries": delivery_ids})
            
            # Update vehicle status and delivery status
            conn.execute("UPDATE vehicles SET status = 'Assigned' WHERE id = ?", (vid,))
            for did in delivery_ids:
                conn.execute(
                    "UPDATE deliveries SET status = 'Assigned', assigned_vehicle_id = ? WHERE id = ?",
                    (vid, did)
                )
        conn.execute("COMMIT")
    except Exception as e:
        conn.execute("ROLLBACK")
        raise HTTPException(500, f"DB update failed: {e}")
    finally:
        conn.close()

    return {
        "routes": routes,
        "unassigned_deliveries": unassigned_count,
        "message": f"Optimized {len(deliveries) - unassigned_count} deliveries across {len(routes)} vehicles."
    }
