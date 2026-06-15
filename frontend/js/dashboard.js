async function loadCorrelationGrid() {

    // const response = await fetch("/api/overview/runtime");
    // const data = await response.json();

    $("#correlationGrid").dxDataGrid({
        dataSource: data,
        showBorders: true,
        columnAutoWidth: true,

        searchPanel: {
            visible: true
        },

        columns: [
            {
                caption: "S.No",
                cellTemplate: function(container, options) {
                    container.text(options.rowIndex + 1);
                },
                width: 70
            },
            {
                dataField: "featurename",
                caption: "Feature Name"
            },
            {
                dataField: "processingtime",
                caption: "Processing Time"
            }
        ]
    });
}

async function loadOperationChart() {

    const response = await fetch(
        "/api/overview/feature-stacks"
    );

    const result = await response.json();

    const chartData = [
        ...(result.daily || []),
        ...(result.monthly || [])
    ];

    $("#operationChart").dxChart({

        dataSource: chartData,

        rotated: true,

        commonSeriesSettings: {
            argumentField: "feature",
            type: "stackedBar"
        },

        series: [
            {
                valueField: "aggregation_time",
                name: "Aggregation"
            },
            {
                valueField: "report_time",
                name: "Report"
            }
        ],

        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center"
        },

        tooltip: {
            enabled: true
        }
    });
}
function loadTransactionGrid() {

    $("#transactionGrid").dxDataGrid({

        dataSource: [
            {
                batchid: 1050,
                featurename: "OVERVIEW",
                spname: "sp_aggregate_master",
                total_nodes: 8,
                processingtime: "03:18"
            },
            {
                batchid: 1050,
                featurename: "THD",
                spname: "sp_thd_master",
                total_nodes: 4,
                processingtime: "00:07"
            }
        ],

        showBorders: true,

        columnAutoWidth: true,

        rowAlternationEnabled: true,

        searchPanel: {
            visible: true
        },

        columns: [
            "batchid",
            "featurename",
            "spname",
            "total_nodes",
            "processingtime"
        ]
    });
}


loadCorrelationGrid();
loadOperationChart();
loadTransactionGrid();