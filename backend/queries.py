from sqlalchemy import text
from backend.database import engine 

def query_kpi_overview():
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

def kpi_overview():
    data = query_kpi_overview()
    if data is not None:
        kpi_card = {}
        kpi_card['avg'] = data[0]
        kpi_card['min'] = data[1]
        kpi_card['max'] = data[2]
        return kpi_card


def query_trend_overview():
     query = text("""select batchid, extract(epoch from c.processingtime) 
                from tenant01.tb_correlation_logs c 
                join tenant01.tb_fingerprint_logs f
                on c.fingerprintid = f.fingerprintid
                where featurename = 'OVERVIEW' """)
     with engine.connect() as conn:
          result = conn.execute(query)
          return result.fetchall()
     
def trend_overview():
     data = query_trend_overview()
     if data is not None:
          trend = []
          for row in data:
               trend.append({
                    "batchid": row[0],
                    "processing_time": row[1]
               })
          return trend
     return []

def query_efficiency_overview():
     query = text("""select batchid, processingdays, processingtime
        from tenant01.tb_correlation_logs c 
        join tenant01.tb_fingerprint_logs f 
        on c.fingerprintid = f.fingerprintid
        where featurename = 'OVERVIEW' """)
     
     with engine.connect() as conn:
          result = conn.execute(query)
          return result.fetchall()

def efficiency_overview():
     data = query_efficiency_overview()
     if data is not None:
          efficiency = []
          for row in data:
               efficiency.append({"batchid": row[0],
                                 "efficiency": row[2]/row[1]
                })
          return efficiency
     return []

def query_log_overview():
    query = text("""select batchid,extract(days from processingdays),meterprocessed,processstartdate,processenddate,processingtime
                from tenant01.tb_correlation_logs c
                join tenant01.tb_fingerprint_logs f
                on c.fingerprintid = f.fingerprintid
                where featurename = 'OVERVIEW' limit 5 """)
    with engine.connect() as conn:
        result = conn.execute(query)
        return result.fetchall()

def log_overview():
    data = query_log_overview()
    if data is not None:
        logs = []
        for row in data:
            logs.append({
                "batchid": row[0],
                "processingdays": row[1],
                "meterprocessed": row[2],
                "processstartdate": row[3],
                "processenddate": row[4],
                "processingtime": row[5]
            })
        return logs
    return []