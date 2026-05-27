from fastapi import FastAPI
from backend.queries import kpi_overview, trend_overview, efficiency_overview,log_overview
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def start():
    return{"message": "Backend Started"}

@app.get("/api/overview/kpis")
def get_kpi_overview():
    return kpi_overview()

@app.get("/api/overview/trends")
def get_trend_overview():
    return trend_overview()

@app.get("/api/overview/efficiency")
def get_efficiency_trend():
    return efficiency_overview()

@app.get("/api/overview/logs")
def get_log_overview():
    return log_overview()