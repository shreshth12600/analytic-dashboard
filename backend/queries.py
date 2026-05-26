from sqlalchemy import text
from database import engine 

def kpi_overview():
     query = text("""
        SELECT AVG(EXTRACT(EPOCH FROM c.processingtime)) AS avg_processing,
               MIN(EXTRACT(EPOCH FROM c.processingtime)) AS min_processing,
               MAX(EXTRACT(EPOCH FROM c.processingtime)) AS max_processing
        FROM tenant01.tb_correlation_logs c
        JOIN tenant01.tb_fingerprint_logs f
            ON c.fingerprintid = f.fingerprintid
        WHERE f.featurename = 'OVERVIEW'
    """)
     with engine.connect() as conn:
          result = conn.execute(query)
          return result.fetchone()
