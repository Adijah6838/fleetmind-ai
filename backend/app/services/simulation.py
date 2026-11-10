import asyncio
import math
from app.db.init import connect

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

async def run_simulation():
    print("🚀 Simulation Engine Started")
    while True:
        await asyncio.sleep(3) # Tick every 3 seconds
        
        conn = connect()
        try:
            # Find vehicles currently assigned or in transit with pending deliveries
            vehicles = conn.execute("""
                SELECT v.id, v.lat, v.lng, d.id as delivery_id, d.dest_lat, d.dest_lng, d.status as d_status
                FROM vehicles v
                JOIN deliveries d ON d.assigned_vehicle_id = v.id
                WHERE v.status IN ('Assigned', 'In Transit') AND d.status != 'Delivered'
            """).fetchall()

            for v in vehicles:
                v_id, v_lat, v_lng, d_id, d_lat, d_lng, d_status = v
                
                # Mark as In Transit if currently Assigned
                if d_status == 'Assigned':
                    conn.execute("UPDATE vehicles SET status = 'In Transit' WHERE id = ?", (v_id,))
                    conn.execute("UPDATE deliveries SET status = 'In Transit' WHERE id = ?", (d_id,))

                dist = haversine(v_lat, v_lng, d_lat, d_lng)
                
                if dist < 0.2: # Arrived (less than 200 meters)
                    conn.execute("UPDATE vehicles SET status = 'Available', current_load = 0 WHERE id = ?", (v_id,))
                    conn.execute("UPDATE deliveries SET status = 'Delivered' WHERE id = ?", (d_id,))
                else:
                    # Move 20% of the remaining distance towards the destination
                    step = 0.20
                    new_lat = v_lat + (d_lat - v_lat) * step
                    new_lng = v_lng + (d_lng - v_lng) * step
                    conn.execute("UPDATE vehicles SET lat = ?, lng = ? WHERE id = ?", (new_lat, new_lng, v_id))
        except Exception as e:
            print(f"Simulation Error: {e}")
        finally:
            conn.close()
