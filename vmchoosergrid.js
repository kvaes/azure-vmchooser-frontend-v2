(function () {
    var COUNTRY_CODES = {
        "europe-north": "ie",
        "europe-west": "nl",
        "canada-central": "ca",
        "canada-east": "ca",
        "United Kingdom": "gb",
        "france-south": "fr",
        "france-central": "fr",
        "germany-central": "de",
        "germany-northeast": "de",
        "japan-east": "jp",
        "japan-west": "jp",
        "australia-east": "au",
        "australia-southeast": "au",
        "brazil-south": "br",
        "asia-pacific-southeast": "sg",
        "asia-pacific-east": "cn",
        "korea-central": "kr",
        "korea-south": "kr",
        "west-india": "in",
        "central-india": "in",
        "south-india": "in",
        "united-kingdom-south": "gb",
        "united-kingdom-west": "gb",
        "us-central": "us",
        "us-east": "us",
        "us-east-2": "us",
        "usgov-arizona": "us",
        "usgov-iowa": "us",
        "usgov-texas": "us",
        "usgov-virginia": "us",
        "us-north-central": "us",
        "us-south-central": "us",
        "us-west": "us",
        "us-west-2": "us",
        "us-west-central": "us"
    };

    var IT_SKILLS = ['android', 'css', 'html5', 'mac', 'windows'];
    var IT_SKILLS_NAMES = ['Android', 'CSS', 'HTML 5', 'Mac', 'Windows'];

    var columnDefs = [
        {
            headerName: '', width: 70, checkboxSelection: true, suppressSorting: true,
            suppressMenu: true
        },
        {
            headerName: 'VM Size',
            children: [
                {
                    headerName: "OfferName", field: "OfferName",
                    width: 150
                },
                {
                    headerName: "Name", field: "name",
                    width: 80
                },
                {
                    headerName: "Tier", field: "tier", 
                    width: 80
                },
                {
                    headerName: "Region", field: "region", width: 150,
                    cellRenderer: countryCellRenderer,
                    filterParams: {cellRenderer: countryCellRenderer, cellHeight: 20}
                },
                {
                    headerName: "Contract Type", field: "contract",
                    width: 90
                }
            ]
        },
        {
            headerName: 'Pricing (per Hour)',
            children: [

                {
                    headerName: "EUR", field: "price_EUR", filter: 'number',
                    width: 80
                },
                {
                    headerName: "USD", field: "price_USD", filter: 'number',
                    width: 80
                },
                {
                    headerName: "CAD", field: "price_CAD", filter: 'number',
                    width: 80
                }
            ]
        },
        {
            headerName: 'Compute',
            children: [
                {
                    headerName: "Cores", field: "cores", filter: 'number',
                    width: 70
                },
                {
                    headerName: "ACU", field: "ACU", filter: 'number',
                    width: 70
                },
                {
                    headerName: "Hyperthreaded", field: "Hyperthreaded",
                    width: 120
                },
                {
                    headerName: "Burstable", field: "burstable",
                    width: 100
                },
                {
                    headerName: "Isolated", field: "isolated",
                    width: 100
                }
            ]
        },
        {
            headerName: 'Storage',
            children: [
                {
                    headerName: "Max. # Disks", field: "MaxDataDiskCount", filter: 'number',
                    width: 120
                },
                {
                    headerName: "Max. IOPS", field: "MaxVmIops", filter: 'number',
                    width: 120
                },
                {
                    headerName: "Max. Throughput (MB/s)", field: "MaxVmThroughputMBs", filter: 'number',
                    width: 175
                },
                {
                    headerName: "Max. Size of Data Volume(s)", field: "MaxDataDiskSizeGB", filter: 'number',
                    width: 200
                }
            ]
        },
        {
            headerName: 'Networking',
            children: [
                {
                    headerName: "Max. # NICs", field: "MaxNics", filter: 'number',
                    width: 110
                },
                {
                    headerName: "Bandwidth (Mbps)", field: "Bandwidth", filter: 'number',
                    width: 140
                }
            ]
        },
        {
            headerName: 'Temp. Disk',
            children: [
                {
                    headerName: "Disk Size (in GB)", field: "TempDiskSizeInGB", filter: 'number',
                    width: 140
                },
                {
                    headerName: "Max. IOPS", field: "TempDiskIops", filter: 'number',
                    width: 110
                },
                {
                    headerName: "Max. Read Throughput (MB/s)", field: "TempDiskReadMBs", filter: 'number',
                    width: 210
                },
                {
                    headerName: "Max. Write Throughput (MB/s)", field: "TempDiskWriteMBs", filter: 'number',
                    width: 210
                }
            ]
        },
        {
            headerName: 'SAP',
            children: [
                {
                    headerName: "SAPS Two Tier", field: "SAPS2T", filter: 'number',
                    width: 130
                },
                {
                    headerName: "SAPS Three Tier", field: "SAPS3T", filter: 'number',
                    width: 130
                },
                {
                    headerName: "HANA Support", field: "HANA",
                    width: 130
                }
            ]
        }
    ];

    var gridOptions = {
        columnDefs: columnDefs,
        rowSelection: 'multiple',
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        enableRangeSelection: true,
        suppressRowClickSelection: true,
        animateRows: true,
        onModelUpdated: modelUpdated,
        debug: true
    };

    var btBringGridBack;
    var btDestroyGrid;

    // wait for the document to be loaded, otherwise
    // ag-Grid will not find the div in the document.
    document.addEventListener("DOMContentLoaded", function () {
        btBringGridBack = document.querySelector('#btBringGridBack');
        btDestroyGrid = document.querySelector('#btDestroyGrid');
        btExport = document.querySelector('#btExport');

        // this example is also used in the website landing page, where
        // we don't display the buttons, so we check for the buttons existance
        if (btBringGridBack) {
            btBringGridBack.addEventListener('click', onBtBringGridBack);
            btDestroyGrid.addEventListener('click', onBtDestroyGrid);
            btExport.addEventListener('click', onBtExport);
        }

        addQuickFilterListener();
        onBtBringGridBack();
    });

    function onBtBringGridBack() {
        var eGridDiv = document.querySelector('#vmchoosergrid');
        new agGrid.Grid(eGridDiv, gridOptions);
        if (btBringGridBack) {
            btBringGridBack.disabled = true;
            btDestroyGrid.disabled = false;
        }
        // createRowData is available in data.js
        gridOptions.api.setRowData(createRowData());
    }

    function onBtDestroyGrid() {
        btBringGridBack.disabled = false;
        btDestroyGrid.disabled = true;
        gridOptions.api.destroy();
    }

    // Export

    function onBtExport() {
        var params = {
            fileName: 'exportVMchooser.csv',
            columnSeparator: ','
        };
    
        gridOptions.api.exportDataAsCsv(params);
    }

    function addQuickFilterListener() {
        var eInput = document.querySelector('#quickFilterInput');
        eInput.addEventListener("input", function () {
            var text = eInput.value;
            gridOptions.api.setQuickFilter(text);
        });
    }

    function modelUpdated() {
        var model = gridOptions.api.getModel();
        var totalRows = model.getTopLevelNodes().length;
        var processedRows = model.getRowCount();
        var eSpan = document.querySelector('#rowCount');
        eSpan.innerHTML = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
    }

    function countryCellRenderer(params) {
        var flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='https://flags.fmcdn.net/data/flags/mini/" + COUNTRY_CODES[params.value] + ".png'>";
        return flag + " " + params.value;
    }

})();
