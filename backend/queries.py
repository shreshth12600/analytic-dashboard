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
        WHERE f.featurename = 'OVERVIEW' """)
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

def format_mmss(seconds):

    seconds = int(seconds)

    minutes = seconds // 60
    remaining_seconds = seconds % 60

    return f"{minutes:02d}:{remaining_seconds:02d}"
def query_correlation_runtime():

    query = text("""
        SELECT 
	CASE f.featurename
		WHEN 'OVERVIEW' THEN 'Overview'
		WHEN 'THD' THEN 'Harmonics'
		WHEN 'POWERQUALITY' THEN 'QOS'
		WHEN 'SUMMARIZEDATA' THEN 'Geospatial'
		WHEN 'SUMMARYDATA' THEN 'Summary Data'
	ELSE f.featurename
	END AS featurename,
EXTRACT(EPOCH FROM c.processingtime) AS processingtime
FROM tenant01.tb_correlation_logs c
JOIN tenant01.tb_fingerprint_logs f
ON c.fingerprintid = f.fingerprintid
WHERE c.processingtime IS NOT NULL
ORDER BY EXTRACT(EPOCH FROM c.processingtime) DESC
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        return result.fetchall()
     
def correlation_runtime():

    data = query_correlation_runtime()

    runtime = []

    if data is not None:

        for row in data:

            runtime.append({
                "featurename": row[0],
                "processingtime": format_mmss(row[1])
            })

    return runtime
    

# def query_breakdown_overview():
#      query = text("""
# SELECT
#     f.batchid,EXTRACT(EPOCH FROM c.processingtime) AS overview_time,
#      MAX(
#         CASE
#             WHEN o.operationid LIKE '%_AGG_%'
#             THEN EXTRACT(EPOCH FROM o.processingtime)
#         END
#     ) AS aggregation_time,

#     MAX(
#         CASE
#             WHEN o.operationid LIKE '%_RPT_%'
#             THEN EXTRACT(EPOCH FROM o.processingtime)
#         END
#     ) AS final_report_time

# FROM tenant01.tb_fingerprint_logs f
# JOIN tenant01.tb_correlation_logs c
#     ON f.fingerprintid = c.fingerprintid
# LEFT JOIN tenant01.tb_operation_logs o
#     ON c.correlationexecutionid = o.correlationexecutionid
# WHERE f.featurename = 'OVERVIEW' AND o.operationid LIKE '%OVERVIEW%'
# GROUP BY f.batchid, c.processingtime
# ORDER BY f.batchid
# """)
     
#      with engine.connect() as conn:
#           result = conn.execute(query)
#           return result.fetchall()

# def breakdown_overview():
#     data = query_breakdown_overview()
#     if data is not None:
#         breakdown = []
#         for row in data:
#             breakdown.append({
#                 "batchid": row[0],
#                 "overview_time": row[1],
#                 "aggregation_time": row[2],
#                 "final_report_time": row[3]
#             })

#         return breakdown
#     return []

def query_log_overview():
    query = text("""SELECT
    f.batchid,
    f.featurename,

    t.transactionid AS spname,

    COUNT(DISTINCT t.nodeid) AS total_nodes,

    TO_CHAR(
        make_interval(
            secs => SUM(EXTRACT(EPOCH FROM t.processingtime))
        ),
        'MI:SS'
    ) AS processingtime

FROM tenant01.tb_transaction_logs t

JOIN tenant01.tb_operation_logs o
    ON t.operationexecutionid = o.operationexecutionid

JOIN tenant01.tb_correlation_logs c
    ON o.correlationexecutionid = c.correlationexecutionid

JOIN tenant01.tb_fingerprint_logs f
    ON c.fingerprintid = f.fingerprintid

WHERE t.processingtime IS NOT NULL

GROUP BY
    f.batchid,
    f.featurename,
    t.transactionid

ORDER BY
    SUM(EXTRACT(EPOCH FROM t.processingtime)) DESC;""")
    with engine.connect() as conn:
        result = conn.execute(query)
        return result.fetchall()

def extract_sp_name(transactionid):

    parts = transactionid.split('_')

    if len(parts) > 6:
        return '_'.join(parts[5:-1])

    return transactionid
def log_overview():

    data = query_log_overview()

    if data is not None:

        logs = []

        for row in data:

            logs.append({
                "batchid": row[0],
                "featurename": row[1],
                "spname": extract_sp_name(row[2]),
                "total_nodes": row[3],
                "processingtime": row[4]
            })

        return logs

    return []

def query_feature_stack_overview():

    query = text("""
        select f.tasktypeid,
	CASE f.featurename
		WHEN 'OVERVIEW' THEN 'Overview'
		WHEN 'THD' THEN 'Harmonics'
		WHEN 'POWERQUALITY' THEN 'QOS'
		WHEN 'SUMMARIZEDATA' THEN 'Geospatial'
		WHEN 'SUMMARYDATA' THEN 'Summary Data'
		ELSE f.featurename
	END AS featurename,	EXTRACT(EPOCH FROM c.processingtime) AS total_time, 
	MAX(CASE o.operationtype WHEN 'AGG' THEN EXTRACT (EPOCH FROM o.processingtime) END) AS aggregation_time,
	MAX(CASE o.operationtype WHEN 'RPT' THEN EXTRACT (EPOCH FROM o.processingtime) END) AS reports_time
	FROM tenant01.tb_fingerprint_logs f
     JOIN tenant01.tb_correlation_logs c
     ON f.fingerprintid = c.fingerprintid
	 JOIN tenant01.tb_operation_logs o
     ON c.correlationexecutionid = o.correlationexecutionid
GROUP BY f.tasktypeid,f.featurename	,c.processingtime
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        return result.fetchall()


def feature_stack_overview():
    data = query_feature_stack_overview()
    daily = []
    monthly = []
    if data is not None:
        for row in data:
            item = {
                "feature": row[1],
                "total_time": row[2] or 0,
                "aggregation_time": row[3] or 0,
                "report_time": row[4] or 0
            }

            if row[0] == 1:
                daily.append(item)

            elif row[0] == 2:
                monthly.append(item)

    return {
        "daily": daily,
        "monthly": monthly
    }