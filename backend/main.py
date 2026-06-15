from fastapi import FastAPI
from backend.queries import kpi_overview, correlation_runtime,feature_stack_overview,log_overview
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

@app.get("/api/overview/runtime")
def get_runtime_overview():
    return correlation_runtime()

# @app.get("/api/overview/runtime-breakdown")
# def get_breakdown_overview():
#     return breakdown_overview()

@app.get("/api/overview/logs")
def get_log_overview():
    return log_overview()

@app.get("/api/overview/feature-stacks")
def get_feature_stacks():
    return feature_stack_overview()