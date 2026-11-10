# FLEETMIND AI 
### Intelligent Fleet Management, Dynamic Route Optimization and Logistics Simulation Platform

FleetMind AI is a full-stack logistics management platform that allows dispatchers to register vehicles, create delivery requests, and run highly optimized routing algorithms using a custom C++ engine.

##  Features
- **Fleet Management:** Register, track, and update delivery vehicles.
- **Delivery Orders:** Create and manage delivery requests with priorities.
- **C++ Optimization Engine:** Implements Dijkstra, A* Search, and a Greedy Vehicle Routing Problem (VRP) with Nearest Neighbor TSP.
- **Live Simulation:** Python background tasks simulate real-time vehicle movement across the map.
- **Live Map:** React-Leaflet integration visualizing trucks and destinations.
- **Analytics Dashboard:** Recharts visualization of fleet efficiency and cargo weight.

##  Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Leaflet, Recharts
- **Backend:** Python, FastAPI, SQLite
- **Optimization Engine:** C++ (compiled via g++)

## 💻 How to Run Locally

### 1. Compile the C++ Engine
```bash
cd cpp_engine
g++ -O3 -o dijkstra.exe dijkstra.cpp
g++ -O3 -o vrp.exe vrp.cpp