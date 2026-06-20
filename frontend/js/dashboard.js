
let correlationData = {
    daily: [],
    monthly: []
};

let featureStackData = {
    daily: [],
    monthly: []
};

let currentView = "daily";
async function loadFeatureStack() {

    try {

        const response =
            await fetch("/api/featurestack");

        const result =
            await response.json();

        featureStackData = result;

renderFeatureStack(
    currentView === "daily"
        ? featureStackData.daily
        : featureStackData.monthly
);
    }
    catch (error) {

        console.error(
            "Feature Stack Error:",
            error
        );
    }
}
async function loadCorrelationGrid() {

    const response =
        await fetch(
            "/api/correlation"
        );

    const result =
        await response.json();

    correlationData = result;

renderCorrelationGrid(
    currentView === "daily"
        ? correlationData.daily
        : correlationData.monthly
);
}

let selectedFeature = null;
let selectedOperation = null;

function formatMMSS(seconds) {

    const total = Math.round(seconds);

    const mins = Math.floor(total / 60);
    const secs = total % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}


function renderCorrelationGrid(data) {

    console.log(
        "GRID DATA:",
        data
    );

    const gridElement =
        $("#correlationGrid");

    let existing = null;

    try {

        existing =
            gridElement
                .dxDataGrid(
                    "instance"
                );

    }
    catch {

        existing = null;
    }

    if (existing) {

        existing.option(
            "dataSource",
            data
        );

        return;
    }

    gridElement.dxDataGrid({

        dataSource: data,

        showBorders: true,

        rowAlternationEnabled: true,

        columnAutoWidth: true,

        searchPanel: {
            visible: false
        },

        export: {
            enabled: false
        },

        paging: {
            enabled: false
        },

        columns: [

            {
            caption: "S.No",
            width: 60,
            cellTemplate(container, options) {
                container.text(options.rowIndex + 1);
            }
        },
        {
            dataField: "featurename",
            caption: "Feature",
            width: 110
        },
        {
            dataField: "total_nodes",
            caption: "Total nodes",
            width: 110,
            alignment: "left"
        },
        {
            dataField: "mv",
            caption: "MV",
            width: 50,
            alignment: "left"
        },
        {
            dataField: "dt",
            caption: "DT",
            width: 50,
            alignment: "left"
        },
        {
            dataField: "lv",
            caption: "LV",
            width: 50,
            alignment: "left"
        },
        {
            dataField: "processingtime",
            caption: "Processing time",
            width: 130,
            alignment: "left"
        }
        ]
    });
}
function renderFeatureStack(data) {

    const container =
        document.getElementById(
            "featureStackContainer"
        );

    container.innerHTML = "";

    data.forEach(row => {

        const agg =
            row.aggregation_time || 0;

        const rpt =
            row.report_time || 0;

        const total =
            agg + rpt;

        const aggPct =
            total > 0
                ? (agg / total) * 100
                : 0;

        const rptPct =
            total > 0
                ? (rpt / total) * 100
                : 0;

        const block =
            document.createElement("div");

        block.className =
            "feature-block";

        block.innerHTML = `

            <div class="feature-header">

                <div class="feature-name">
                    ${row.feature}
                </div>

                <div class="feature-total">
                    ${formatMMSS(total)}
                </div>

            </div>

            <div class="stack-bar">

                ${agg > 0
                ? `
                    <div
                        class="agg-segment"
                        style="width:${aggPct}%"
                        data-feature="${row.feature}"
                        data-type="AGG">

                        ${formatMMSS(agg)}

                    </div>
                    `
                : ""
            }

                ${rpt > 0
                ? `
                    <div
                        class="rpt-segment"
                        style="width:${rptPct}%"
                        data-feature="${row.feature}"
                        data-type="RPT">

                        ${formatMMSS(rpt)}

                    </div>
                    `
                : ""
            }

            </div>

        `;

        container.appendChild(block);
    });

    bindStackEvents();
}
function bindStackEvents() {

    document
        .querySelectorAll(
            ".agg-segment, .rpt-segment"
        )
        .forEach(segment => {

            segment.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".selected-segment"
                        )
                        .forEach(el =>
                            el.classList.remove(
                                "selected-segment"
                            )
                        );

                    this.classList.add(
                        "selected-segment"
                    );

                    selectedFeature =
                        this.dataset.feature;

                    selectedOperation =
                        this.dataset.type;

                    console.log(
                        "Feature:",
                        selectedFeature
                    );

                    console.log(
                        "Operation:",
                        selectedOperation
                    );

                    openTransactionPopup(
                        selectedFeature,
                        selectedOperation,
                        currentView
                    );

                }
            );
        });
}


let transactionPopup = null;

function getTransactionPopup() {

    if (transactionPopup) {
        return transactionPopup;
    }

    transactionPopup = $("#transactionPopup")
        .dxPopup({
            title: "Transaction Logs",
            visible: false,
            dragEnabled: false,
            hideOnOutsideClick: true,
            showCloseButton: true,
            width: "80vw",
            height: "75vh",
            contentTemplate(contentElement) {
                $("<div>")
                    .attr("id", "transactionGrid")
                    .appendTo(contentElement);
            }
        })
        .dxPopup("instance");

    return transactionPopup;
}

async function loadTransactionGrid(feature,operation,view) {

    try {

        const params = new URLSearchParams();

        if (feature) {
            params.append("feature", feature);
        }

        if (operation) {
            params.append("operation", operation);
        }

        const tasktypeid = view === "daily" ? 1 : 2;

        params.append("tasktypeid",tasktypeid);

        const query = params.toString();
        const response = await fetch(
            `/api/transactions${query ? `?${query}` : ""}`
        );

        const data = await response.json();
        console.log("TRANSACTION RESPONSE:", data);
        const gridElement = $("#transactionGrid");

        const existingInstance =
            gridElement.data("dxDataGrid");

        if (existingInstance) {

            existingInstance.option(
                "dataSource",
                data
            );

        }
        else {

            gridElement.dxDataGrid({

                dataSource: data,

                showBorders: true,

                columnAutoWidth: true,

                rowAlternationEnabled: true,

                height: "100%",

                paging: {
                    enabled: false
                },

                scrolling: {
                    mode: "standard"
                },

                searchPanel: {
                    visible: false
                },

                columns: [

                    {
                        caption: "S.No",
                        width: 80,
                        cellTemplate(container, options) {
                            container.text(options.rowIndex + 1);
                        }
                    },

                    {
                        dataField: "spname",
                        caption: "Stored procedure name"
                    },

                    {
                        dataField: "feature",
                        caption: "Feature"
                    },

                    {
                        dataField: "operation",
                        caption: "Operation"
                    },

                    {
                        dataField: "total_nodes",
                        caption: "Total nodes",
                        alignment: "right"
                    },

                    {
                        dataField: "duration",
                        caption: "Duration",
                        alignment: "right"
                    }
                ]
            });
        }

    }
    catch (error) {

        console.error(
            "Transaction Grid Error:",
            error
        );
    }
}

function openTransactionPopup(feature,operation,view) {

    const popup = getTransactionPopup();

    const operationLabel =
        operation === "AGG"
            ? "Aggregation"
            : "Report";

    popup.option(
        "title",
        `Transaction Logs — ${feature} (${operationLabel})`
    );

    popup.show();

    loadTransactionGrid(feature,operation,view);
}
document
    .getElementById("dailyBtn")
    .addEventListener(
        "click",
        function () {

            currentView =
                "daily";

            document
                .querySelectorAll(
                    ".view-btn"
                )
                .forEach(btn =>
                    btn.classList.remove(
                        "active"
                    )
                );

            this.classList.add(
                "active"
            );

            renderCorrelationGrid(
                correlationData.daily
            );

            renderFeatureStack(
                featureStackData.daily
            );
        }
    );

document
    .getElementById("monthlyBtn")
    .addEventListener(
        "click",
        function () {

            currentView =
                "monthly";

            document
                .querySelectorAll(
                    ".view-btn"
                )
                .forEach(btn =>
                    btn.classList.remove(
                        "active"
                    )
                );

            this.classList.add(
                "active"
            );

            renderCorrelationGrid(
                correlationData.monthly
            );

            renderFeatureStack(
                featureStackData.monthly
            );
        }
    );
loadCorrelationGrid();
loadFeatureStack();