PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL UNIQUE,
    v_type TEXT NOT NULL,
    max_load REAL NOT NULL,
    current_load REAL NOT NULL DEFAULT 0,
    fuel_type TEXT NOT NULL,
    cost_per_km REAL NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'In Transit', 'Maintenance', 'Inactive')),
    maintenance_status TEXT NOT NULL DEFAULT 'OK'
);

CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    pickup_lat REAL NOT NULL,
    pickup_lng REAL NOT NULL,
    dest_lat REAL NOT NULL,
    dest_lng REAL NOT NULL,
    weight REAL NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    window_start TEXT,
    window_end TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Transit', 'Delivered', 'Delayed', 'Cancelled')),
    assigned_vehicle_id INTEGER REFERENCES vehicles(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS graph_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS graph_edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_node_id INTEGER NOT NULL REFERENCES graph_nodes(id),
    end_node_id INTEGER NOT NULL REFERENCES graph_nodes(id),
    distance REAL NOT NULL,
    travel_time REAL NOT NULL,
    road_category TEXT,
    traffic_weight REAL DEFAULT 1.0
);
