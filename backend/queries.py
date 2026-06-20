from sqlalchemy import text
from backend.database import engine 

# Reverse of the featurename CASE WHEN used in correlation_runtime /
# feature_stack_overview. The frontend only knows the friendly labels
# (e.g. "Harmonics"), but tb_fingerprint_logs.featurename stores the raw
# codes (e.g. "THD"), so incoming filters need to be translated back.
FEATURE_NAME_MAP = {
    "Overview": "OVERVIEW",
    "Harmonics": "THD",
    "QOS": "POWERQUALITY",
    "Geospatial": "SUMMARIZEDATA",
    "Summary Data": "SUMMARYDATA",
}


def query_correlation_runtime():

    query = text("""
        WITH node_counts AS (
    SELECT
        COUNT(DISTINCT CASE WHEN nodetypeid = 'MV' THEN nodeid END) AS mv,
        COUNT(DISTINCT CASE WHEN nodetypeid = 'DT' THEN nodeid END) AS dt,
        COUNT(DISTINCT CASE WHEN nodetypeid = 'LV' THEN nodeid END) AS lv
    FROM tenant01.tb_transaction_logs
)
SELECT
    f.tasktypeid,
    CASE f.featurename
        WHEN 'OVERVIEW' THEN 'Overview'
        WHEN 'THD' THEN 'Harmonics'
        WHEN 'POWERQUALITY' THEN 'QOS'
        WHEN 'SUMMARIZEDATA' THEN 'Geospatial'
        WHEN 'SUMMARYDATA' THEN 'Summary Data'
        ELSE f.featurename
    END AS featurename,
    f.meterprocessed,
    nc.mv,
    nc.dt,
    nc.lv,
    EXTRACT(EPOCH FROM c.processingtime) AS processingtime
FROM tenant01.tb_correlation_logs c
JOIN tenant01.tb_fingerprint_logs f
    ON c.fingerprintid = f.fingerprintid
CROSS JOIN node_counts nc
WHERE c.processingtime IS NOT NULL
ORDER BY c.processingtime DESC;
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        return result.fetchall()
     
def correlation_runtime():

    data = query_correlation_runtime()

    daily = []
    monthly = []

    for row in data:

        total_seconds = int(
            float(row[6])
        )

        minutes = total_seconds // 60

        seconds = total_seconds % 60

        item = {
            "featurename": row[1],
            "total_nodes": row[2],
            "mv": row[3],
            "dt": row[4],
            "lv": row[5],
            "processingtime":
                f"{minutes:02d}:{seconds:02d}"
        }

        if row[0] == 1:
            daily.append(item)

        elif row[0] == 2:
            monthly.append(item)

    return {
        "daily": daily,
        "monthly": monthly
    }
    
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
ORDER BY
    CASE f.featurename
        WHEN 'OVERVIEW' THEN 1
        WHEN 'THD' THEN 2
        WHEN 'POWERQUALITY' THEN 3
        WHEN 'SUMMARIZEDATA' THEN 4
        WHEN 'SUMMARYDATA' THEN 5
        ELSE 999
    END;

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


def query_transaction_logs(featurename, operationtype,tasktypeid):

    query = text("""
        SELECT
			f.tasktypeid,
            REGEXP_SUBSTR(transactionid, 'sp_.*(?=_[0-9]+$)') AS spname,
            f.featurename,
            o.operationtype,
            f.meterprocessed AS total_nodes,
            EXTRACT(EPOCH FROM SUM(t.processingtime)) AS total_processing_time
        FROM tenant01.tb_transaction_logs t
        JOIN tenant01.tb_operation_logs o
            ON t.operationexecutionid = o.operationexecutionid
        JOIN tenant01.tb_correlation_logs c
            ON o.correlationexecutionid = c.correlationexecutionid
        JOIN tenant01.tb_fingerprint_logs f
            ON c.fingerprintid = f.fingerprintid
        WHERE f.featurename = :featurename
        AND o.operationtype = :operationtype
        AND f.tasktypeid = :tasktypeid
        GROUP BY
            spname,
            f.featurename,
            o.operationtype,
            f.meterprocessed,f.tasktypeid
        ORDER BY SUM(t.processingtime) DESC
    """)

    with engine.connect() as conn:
        result = conn.execute(
            query,
            {
                "featurename": featurename,
                "operationtype": operationtype,
                 "tasktypeid": tasktypeid
            }
        )
        return result.fetchall()


def transaction_logs(feature, operation,tasktypeid):

    if feature is None or operation is None:
        return []

    raw_featurename = FEATURE_NAME_MAP.get(feature, feature)

    data = query_transaction_logs(raw_featurename, operation,tasktypeid)

    logs = []

    for row in data:

        total_seconds = int(float(row[5] or 0))

        minutes = total_seconds // 60
        seconds = total_seconds % 60

        logs.append({
            "spname": row[1],
            "feature": feature,
            "operation": operation,
            "total_nodes": row[4],
            "duration": f"{minutes:02d}:{seconds:02d}"
        })

    return logs