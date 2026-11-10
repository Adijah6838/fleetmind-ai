import subprocess
from pathlib import Path
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.db.init import connect

router = APIRouter(prefix="/graph", tags=["graph"])

EXE_PATH = Path(__file__).resolve().parent.parent.parent.parent / "cpp_engine" / "dijkstra.exe"

class NodeIn(BaseModel):
    name: str
    lat: float
    lng: float

class EdgeIn(BaseModel):
    start_node_id: int
    end_node_id: int
    distance: float = Field(gt=0)
    travel_time: float = Field(gt=0)
    road_category: str = "Street"

@router.post("/nodes", status_code=201)
def create_node(body: NodeIn) -> dict[str, Any]:
    conn = connect()
    try:
        cur = conn.execute("INSERT INTO graph_nodes (name, lat, lng) VALUES (?, ?, ?)", (body.name, body.lat, body.lng))
        nid = cur.lastrowid
    finally:
        conn.close()
    return {"id": nid, "name": body.name}

@router.post("/edges", status_code=201)
def create_edge(body: EdgeIn) -> dict[str, Any]:
    conn = connect()
    try:
        cur = conn.execute(
            "INSERT INTO graph_edges (start_node_id, end_node_id, distance, travel_time, road_category) VALUES (?, ?, ?, ?, ?)",
            (body.start_node_id, body.end_node_id, body.distance, body.travel_time, body.road_category)
        )
        eid = cur.lastrowid
    finally:
        conn.close()
    return {"id": eid}

def _run_engine(start_id: int, end_id: int, algo: str) -> dict[str, Any]:
    conn = connect()
    try:
        edges = conn.execute("SELECT start_node_id, end_node_id, distance FROM graph_edges").fetchall()
        nodes = conn.execute("SELECT id, lat, lng FROM graph_nodes ORDER BY id").fetchall()
        if not edges or not nodes:
            raise HTTPException(400, "Graph must have nodes and edges.")
        max_node = max(n[0] for n in nodes)
    finally:
        conn.close()

    lines = [f"{max_node} {len(edges)}"]
    # Ensure all node IDs are indexed (missing ones get 0,0)
    node_map = {n[0]: (n[1], n[2]) for n in nodes}
    for i in range(1, max_node + 1):
        lat, lng = node_map.get(i, (0.0, 0.0))
        lines.append(f"{lat} {lng}")
    for e in edges:
        lines.append(f"{e[0]} {e[1]} {e[2]}")
    lines.append(f"{start_id} {end_id}")
    input_str = "\n".join(lines) + "\n"

    try:
        result = subprocess.run(
            [str(EXE_PATH), algo], input=input_str,
            text=True, capture_output=True, timeout=5.0
        )
    except FileNotFoundError:
        raise HTTPException(500, "C++ engine not compiled.")

    if result.returncode != 0:
        raise HTTPException(500, f"C++ Error: {result.stderr}")

    out = result.stdout.strip().split("\n")
    if out[0] == "NO_PATH":
        raise HTTPException(404, "No path exists.")
    return {
        "distance": float(out[0]),
        "path": [int(x) for x in out[1].split()],
        "execution_us": float(out[2]),
        "algorithm": algo,
    }

@router.post("/shortest-path")
def shortest_path(start_id: int, end_id: int, algo: str = "dijkstra") -> dict[str, Any]:
    if algo not in ("dijkstra", "astar"):
        raise HTTPException(400, "algo must be 'dijkstra' or 'astar'")
    return _run_engine(start_id, end_id, algo)

@router.post("/compare")
def compare_algorithms(start_id: int, end_id: int) -> dict[str, Any]:
    d = _run_engine(start_id, end_id, "dijkstra")
    a = _run_engine(start_id, end_id, "astar")
    return {
        "dijkstra": d,
        "astar": a,
        "same_path": d["path"] == a["path"],
        "speedup_us": d["execution_us"] - a["execution_us"],
    }
