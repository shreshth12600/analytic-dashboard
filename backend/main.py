from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.queries import correlation_runtime, feature_stack_overview, log_overview,transaction_logs
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/correlation")
def get_correlation():
    return correlation_runtime()

@app.get("/api/featurestack")
def get_feature():
    return feature_stack_overview()

@app.get("/api/transactions")
def get_transactions(
    feature: str = None,
    operation: str = None,
    tasktypeid: int = None
):
    return transaction_logs(feature, operation,tasktypeid)
app.mount(
    "/",
    StaticFiles(directory="frontend", html=True),
    name="frontend"
)
