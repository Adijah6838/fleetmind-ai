import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.init import initialize_database
from app.services.simulation import run_simulation
from app.api.vehicles import router as vehicles_router
from app.api.deliveries import router as deliveries_router
from app.api.graph import router as graph_router
from app.api.optimize import router as optimize_router
from app.api.analytics import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    # Start the simulation background task
    simulation_task = asyncio.create_task(run_simulation())
    yield
    # Cancel the task on shutdown
    simulation_task.cancel()

app = FastAPI(title="FLEETMIND AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicles_router)
app.include_router(deliveries_router)
app.include_router(graph_router)
app.include_router(optimize_router)
app.include_router(analytics_router)

@app.get("/health")
def health():
    return {"status": "ok", "app": "FLEETMIND AI"}
