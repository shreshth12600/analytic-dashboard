from database import engine
from sqlalchemy import text
from queries import kpi_overview

with engine.connect() as conn:
    result = conn.execute(text("select now();"))
    print(result.fetchone())

