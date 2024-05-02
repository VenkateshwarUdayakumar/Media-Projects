// noinspection JSUnresolvedReference
import "./App.css"
import SampleData from "./sample.json"
import statstaker from "./sample_args.json"
import {Link, Route, Routes} from "react-router-dom"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Dot,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'

let stats = statstaker
let currentFileName = "None"

function App() {
    const transpose = matrix => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    function tabletoJSON() {
        let data = [];
        let table = document.getElementById('outputtable');
        let headers = [];
        let headerRow = table.rows[0];
        for (let j = 1; j < headerRow.cells.length; j++) {
            headers.push(headerRow.cells[j].textContent.trim());
        }
        for (let i = 1; i < table.rows.length; i++) {
            let rowData = {};
            for (let j = 1; j < table.rows[i].cells.length; j++) {
                let cell = table.rows[i].cells[j];
                rowData[headers[j - 1]] = cell.textContent.trim();
            }
            data.push(rowData);
        }
        return data
    }
    function downloadObjectAsJson(){
        let data = tabletoJSON()
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "PolyData.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    function handleFile() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            let file = e.target.files[0];
            currentFileName = file.name;
            let r = new FileReader();
            r.readAsText(file,'UTF-8');
            let parts = currentFileName.split('.');
            r.onload = readerEvent => {
                let content = readerEvent.target.result;
                if (parts[parts.length - 1] === 'json') {
                    let jsonSTUFF2 = JSON.parse(content.toString());
                    document.getElementById('titledatatitle').style.whiteSpace = "pre";
                    document.getElementById('titledatatitle').textContent = "   Displaying " + currentFileName;
                    addTableJSON(jsonSTUFF2);
                } else if (parts[parts.length - 1] === 'csv') {
                    document.getElementById('titledatatitle').style.whiteSpace = "pre";
                    document.getElementById('titledatatitle').textContent = "   Displaying " + currentFileName;
                    content = readerEvent.target.result;
                    let contentRows = content.split(/\r?\n/);
                    let CSVdata = [];
                    for (let i = 0; i < contentRows.length; i++) {
                        CSVdata[i] = contentRows[i].split(",");
                        for (let j = 0; j < CSVdata[i].length; j++) {
                            CSVdata[i][j] = CSVdata[i][j].replace(/['"]+/g, '');
                        }
                    }
                    if (CSVdata.length < CSVdata[0].length) addTableCSV(transpose(CSVdata));
                    else addTableCSV(CSVdata);
                }
            };
        };
        input.click();
    }
    function addTableCSV(datastuff) {
        document.getElementById("mithu").style.backgroundColor = "aliceblue"
        document.getElementById("aidan").style.backgroundColor = "darkgray"
        document.getElementById("aidan").style.color = "lightgray"
        document.getElementById("mithu").style.color = "darkseagreen"
        let extraTable = document.getElementById("outputtable"),
            row, column
        extraTable.className = "scrollingtablemithu"
        extraTable.innerHTML = ""
        for (let i = 0; (i < datastuff.length && i < 500); i++) {
            if (datastuff[i].length === 0 || (datastuff[i].length === 1 && datastuff[i][0] === "")) {
                continue
            }
            row = document.createElement("tr")
            extraTable.appendChild(row)
            for(let j = 0; j < datastuff[i].length + 1; j++) {
                column = document.createElement("td")
                if(i === 0 || j === 0) {
                    if(datastuff[i][j - 1] === "Outliers") column.className = "outliertableheader"
                    else column.className = "scrollingtablemithu"
                } else {
                    column.className = "regtable"
                }
                if(datastuff[0][j - 1] === "Outliers")
                    if(datastuff[i][j - 1] !== "No Outlier") column.className = "outliertablebody"
                if(j === 0) {
                    if(i !== 0) {
                        if(datastuff[i][datastuff[0].lastIndexOf("Outliers")] !== "No Outlier" &&
                            datastuff[i][datastuff[0].lastIndexOf("Outliers")] !== undefined)
                            column.className = "outliertableheader"
                        column.textContent = String(i)
                    }
                } else {
                    if(datastuff[i][datastuff[0].lastIndexOf("Outliers")] !== undefined &&
                        datastuff[i][datastuff[0].lastIndexOf("Outliers")].includes(datastuff[0][j - 1]) && i !== 0)
                        column.className = "outliertablebody"
                    column.textContent = datastuff[i][j - 1]
                }
                row.appendChild(column)
            }
        }
        localStorage.clear()
        localStorage.setItem("CSVDATA", JSON.stringify(tabletoJSON()))
    }
    function addTableJSON(jsonstuff) {
        document.getElementById("mithu").style.backgroundColor = "darkgray"
        document.getElementById("mithu").style.color = "lightgray"
        document.getElementById("aidan").style.backgroundColor = "aliceblue"
        document.getElementById("aidan").style.color = "lightsalmon"
        let extraTable = document.getElementById("outputtable"),
            row, column
        extraTable.className = "scrollingtableaidan"
        extraTable.innerHTML = ""
        for (let i = 0; (i < jsonstuff.data[0].y.length + 1  && i < 500); i++) {
            row = document.createElement("tr")
            extraTable.appendChild(row)
            if (i === 0) {
                column = document.createElement("td")
                column.className = "scrollingtableaidan"
                row.appendChild(column)
                column = document.createElement("td")
                column.textContent = "Time: "
                row.appendChild(column)
                for(let j = 0; j < jsonstuff.data.length; j++) {
                    column = document.createElement("td")
                    column.textContent = jsonstuff.data[j].title
                    row.appendChild(column)
                }
            } else {
                column = document.createElement("td")
                column.className = "scrollingtableaidan"
                column.textContent = String(i)
                row.appendChild(column)
                column = document.createElement("td")
                column.className = "regtable"
                column.textContent = String(parseFloat(jsonstuff.start_time) + (i - 1) / parseFloat(jsonstuff.sample_rate))
                row.appendChild(column)
                for(let j = 0; j < jsonstuff.data.length; j++) {
                    column = document.createElement("td")
                    column.className = "regtable"
                    column.textContent = String(parseFloat(jsonstuff.data[j].y[i - 1]))
                    row.appendChild(column)
                }
            }
        }
        localStorage.clear()
        for(let i = 0; i < jsonstuff.data.length; i++)
            localStorage.setItem(String(i), JSON.stringify(setGraphDataJSON(i)))
    }
    function setGraphDataJSON(tableindex) {
        let jsonTable = document.getElementById("outputtable")
        let stuff = []
        if(jsonTable.rows[1].cells[1].innerHTML) {
            for (let i = 1; i < jsonTable.rows.length; i++) {
                stuff.push({
                    time: parseFloat(jsonTable.rows[i].cells[1].innerHTML),
                    Amplitude: parseFloat(jsonTable.rows[i].cells[2 + tableindex].innerHTML),
                    title: jsonTable.rows[0].cells[2 + tableindex].innerHTML
                })
            }
        }
        return stuff
    }
    function oldTable() {
        currentFileName = "Sample.json"
        addTableJSON(SampleData)
    }
    function doJSONfunction() {
        let stuffstuff = []
        let i = 0
        let j
        let mean
        let answer
        for(;;){
            mean = 0
            answer = 0
            if(localStorage.getItem(String(i)) != null) {
                for(j = 0; j < JSON.parse(localStorage.getItem(String(i))).length; j++) {
                    mean += JSON.parse(localStorage.getItem(String(i)))[j].Amplitude
                }
                mean /= JSON.parse(localStorage.getItem(String(i))).length
                for(j = 0; j < JSON.parse(localStorage.getItem(String(i))).length; j++) {
                    answer += (JSON.parse(localStorage.getItem(String(i)))[j].Amplitude - mean) ** 2
                }
                answer = Math.sqrt(answer/(JSON.parse(localStorage.getItem(String(i))).length - 1))
                let generateCustomDot = (mean, answer) => {
                    return ({ cx, cy, stroke, payload }) => {
                        let color = stroke
                        if (payload.Amplitude > (mean + 3 * answer) || payload.Amplitude < (mean - 3 * answer)) {
                            color = "firebrick"
                        }
                        return (
                            <Dot cx={cx} cy={cy} r={4} fill={color} />
                        )
                    }
                }
                stuffstuff.push(<>
                    <h2 style={{textIndent: 85, fontSize: 25, marginTop: 0}}>
                        {JSON.parse(localStorage.getItem(String(i)))[0].title}</h2>
                    <ResponsiveContainer width="100%" height={500} style={{marginBottom: 30}}>
                        <LineChart className="tooltip"
                                   width={500}
                                   height={300}
                                   data={JSON.parse(localStorage.getItem(String(i)))}
                                   margin={{
                                       top: 5,
                                       right: 30,
                                       left: 20,
                                       bottom: 5,
                                   }}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                className="graphbubble"
                                dataKey="time"
                                label={{
                                    value: `Time (s)`,
                                    style: { textAnchor: 'middle' },
                                    position: 'left',
                                    offset: 0,
                                    dy: 15
                                }}
                                interval={Math.ceil(JSON.parse(localStorage.getItem(String(i))).length / 10)}
                            />

                            <YAxis className="graphbubble"
                                   label={{
                                       value: `Amplitude`,
                                       style: {textAnchor: 'middle'},
                                       angle: -90,
                                       position: 'bottom',
                                       offset: -30,
                                       dx: -25
                                   }}
                            />
                            <Tooltip
                                labelClassName="tooltip"
                            />
                            <Line type="monotone" dataKey="Amplitude" stroke="lightsalmon" dot={generateCustomDot(mean, answer)}/>
                            <ReferenceLine y={mean+(3*answer)} stroke="firebrick"/>
                            <ReferenceLine y={mean-(3*answer)} stroke="firebrick"/>
                        </LineChart>
                    </ResponsiveContainer>
                </>)
            }
            else break
            i++
        }
        let thingthing = () => (
            <div>
                {stuffstuff}
            </div>
        )
        return (thingthing())
    }
    function dofunction() {
        if (localStorage.getItem("CSVDATA") !== null) {
            return doCSVfunction()
        } else {
            return doJSONfunction();
        }
    }
    let calculateFrequency = (data) => {
        const frequency = {};
        data.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
        });
        return frequency;
    };
    function doCSVfunction() {
        let stuffstuff = [];
        // Parse JSON
        let data = JSON.parse(localStorage.getItem("CSVDATA"));

        // Initialize objects to store data points for each parameter
        let parameters = {
            yy: [],
            dat: [],
            trip: [],
            effort: [],
            gr: [],
            sp: [],
            l_cm: [],
            w_cm: [],
            Exist: [],
            Outliers: []
        };

        // Extract data points for each parameter
        data.forEach(item => {
            parameters.yy.push(item.yy);
            parameters.dat.push(item.dat);
            parameters.trip.push(item.trip);
            parameters.effort.push(item.effort);
            parameters.gr.push(item.gr);
            parameters.sp.push(item.sp);
            parameters.l_cm.push(item.l_cm);
            parameters.w_cm.push(item.w_cm);
            parameters.Exist.push(item.Exist);
            parameters.Outliers.push(item.Outliers);
        });

        // Function to create histogram bins and count occurrences
        let createHistogramBins = (data, binSize) => {
            let bins = {};
            data.forEach(value => {
                let binIndex = Math.floor(value / binSize) * binSize;
                bins[binIndex] = (bins[binIndex] || 0) + 1;
            });
            return bins;
        };

        // Sort parameters.yy numerically
        parameters.yy.sort((a, b) => parseInt(a) - parseInt(b));
        parameters.trip.sort((a, b) => parseInt(a) - parseInt(b));
        parameters.effort.sort((a, b) => parseInt(a) - parseInt(b));
        parameters.l_cm.sort((a, b) => parseInt(a) - parseInt(b));
        parameters.w_cm.sort((a, b) => parseInt(a) - parseInt(b));
        parameters.dat.sort((a, b) => parseInt(a) - parseInt(b));

        // Convert parameters to histogram data
        let histogramBinsYY = createHistogramBins(parameters.yy.map(yy => parseInt(yy)), 1);
        let histogramBinsTrip = createHistogramBins(parameters.trip.map(trip => parseInt(trip)), 1);
        let histogramBinsEffort = createHistogramBins(parameters.effort.map(effort => parseInt(effort)), 10);
        let histogramBinsLCM = createHistogramBins(parameters.l_cm.map(l_cm => parseInt(l_cm)), 100);
        let histogramBinsWCM = createHistogramBins(parameters.w_cm.map(w_cm => parseInt(w_cm)), 100);

        // Convert histogram data to Recharts format
        let histogramDataYY = Object.keys(histogramBinsYY).map(bin => ({ bin: parseInt(bin), frequency: histogramBinsYY[bin] }));
        let histogramDataTrip = Object.keys(histogramBinsTrip).map(bin => ({ bin: parseInt(bin), frequency: histogramBinsTrip[bin] }));
        let histogramDataEffort = Object.keys(histogramBinsEffort).map(bin => ({ bin: parseInt(bin), frequency: histogramBinsEffort[bin] }));
        let histogramDataLCM = Object.keys(histogramBinsLCM).map(bin => ({ bin: parseInt(bin), frequency: histogramBinsLCM[bin] }));
        let histogramDataWCM = Object.keys(histogramBinsWCM).map(bin => ({ bin: parseInt(bin), frequency: histogramBinsWCM[bin] }));

        // Convert frequency data to Recharts format for other parameters
        let frequencyDataDat = calculateFrequency(parameters.dat);
        let frequencyDataGR = calculateFrequency(parameters.gr);
        let frequencyDataOutliers = calculateFrequency(parameters.Outliers);
        let frequencyDataSP = calculateFrequency(parameters.sp);

        // Convert frequency data to Recharts format
        let ledataDat = Object.keys(frequencyDataDat).map(dat => ({ dat, frequency: frequencyDataDat[dat] }));
        let ledataGR = Object.keys(frequencyDataGR).map(gr => ({ gr, frequency: frequencyDataGR[gr] }));
        let ledataOutliers = Object.keys(frequencyDataOutliers).map(outlier => ({ outlier, frequency: frequencyDataOutliers[outlier] }));
        let ledataSP = Object.keys(frequencyDataSP).map(sp => ({ sp, frequency: frequencyDataSP[sp] }));

        // Pushing charts onto stuffstuff
        stuffstuff.push(
            <>
                {/* Histograms */}
                <h2>Histogram of yy</h2>
                <ResponsiveContainer key="yy" width="100%" height={300}>
                    <BarChart
                        data={histogramDataYY}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="bin"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
                <h2>Histogram of trip</h2>
                <ResponsiveContainer key="trip" width="100%" height={300}>
                    <BarChart
                        data={histogramDataTrip}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="bin"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
                <h2>Histogram of effort</h2>
                <ResponsiveContainer key="effort" width="100%" height={300}>
                    <BarChart
                        data={histogramDataEffort}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="bin"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
                <h2>Histogram of l_cm</h2>
                <ResponsiveContainer key="l_cm" width="100%" height={300}>
                    <BarChart
                        data={histogramDataLCM}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="bin"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
                <h2>Histogram of w_cm</h2>
                <ResponsiveContainer key="w_cm" width="100%" height={300}>
                    <BarChart
                        data={histogramDataWCM}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="bin"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>

                {/* Bar Graphs */}
                <h2>Frequency Distribution of dat</h2>
                <ResponsiveContainer key="dat" width="100%" height={300}>
                    <BarChart
                        data={ledataDat}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="dat"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
                <h2>Frequency Distribution of gr</h2>
                <ResponsiveContainer key="gr" width="100%" height={300}>
                    <BarChart
                        data={ledataGR}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="gr"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
                <h2>Frequency Distribution of Outliers</h2>
                <ResponsiveContainer key="outliers" width="100%" height={300}>
                    <BarChart
                        data={ledataOutliers}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="outlier"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
                <h2>Frequency Distribution of sp</h2>
                <ResponsiveContainer key="sp" width="100%" height={300}>
                    <BarChart
                        data={ledataSP}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="sp"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="frequency" fill="darkseagreen"/>
                    </BarChart>
                </ResponsiveContainer>
            </>
        );
        // Helper function to calculate statistics or determine most and least popular categories
        const calculateStatistics = (data) => {
            const numericData = data.map(value => parseFloat(value)).filter(value => !isNaN(value));
            if (numericData.length === 0) {
                // If no numeric data, determine most and least popular categories
                const frequencyData = calculateFrequency(data);
                const categories = Object.keys(frequencyData);
                const mostPopular = categories.reduce((a, b) => frequencyData[a] > frequencyData[b] ? a : b);
                const leastPopular = categories.reduce((a, b) => frequencyData[a] < frequencyData[b] ? a : b);
                return {
                    'Most Popular': mostPopular,
                    'Least Popular': leastPopular
                };
            }

            // If numeric data, calculate statistics
            numericData.sort((a, b) => a - b);

            const min = numericData[0];
            const firstQuartile = numericData[Math.floor(numericData.length * 0.25)];
            const median = numericData[Math.floor(numericData.length * 0.5)];
            const mean = numericData.reduce((acc, val) => acc + val, 0) / numericData.length;
            const thirdQuartile = numericData[Math.floor(numericData.length * 0.75)];
            const max = numericData[numericData.length - 1];

            return {
                min,
                '1st Qu.': firstQuartile,
                Median: median,
                Mean: mean.toFixed(2),
                '3rd Qu.': thirdQuartile,
                max
            };
        };

        // Create summary text
        let summaryText = '';
        for (const param in parameters) {
            const stats = calculateStatistics(parameters[param]);
            summaryText += `${param.padEnd(15, ' ')}${' '.repeat(9)}\n`;
            for (const key in stats) {
                summaryText += `${key.padEnd(15, ' ')} : ${stats[key]}\n`;
            }
            summaryText += '\n';
        }

        // Create text file
        const textFileBlob = new Blob([summaryText], { type: 'text/plain' });
        const textFileURL = URL.createObjectURL(textFileBlob);

        // Trigger download
        const link = document.createElement('a');
        link.href = textFileURL;
        link.download = 'summary.txt';
        document.body.appendChild(link);
        link.click();
        return stuffstuff;
    }


    function updateconfig() {
        for (let i = 0; i < Object.keys(stats.args).length; i++) {
            for (let j = 0; j < Object.keys(stats.args[i].values).length; j++) {
                let element = document.getElementById(stats.args[i].display_name + " " +
                    stats.args[i].values[j].display_name)
                let elementradio = document.querySelector('input[name="'+stats.args[2].display_name + " " +
                    stats.args[2].values[1].display_name+'"]:checked')
                if (element || elementradio) {
                    if (stats.args[i].values[j].type === "textbox") {
                        let inputValue = parseFloat(element.value)
                        if (!isNaN(inputValue)) {
                            stats.args[i].values[j].value = inputValue
                        } else {
                            stats.args[i].values[j].value = 0
                        }
                    } else if (stats.args[i].values[j].type === "checkbox") {
                        stats.args[i].values[j].value = element.checked
                    } else {
                        if(stats.args[i].values[j].value) {
                            stats.args[i].values[j].value = elementradio.value
                        } else {
                            stats.args[i].values[j].value = ""
                        }
                    }
                }
            }
        }
    }
    function doconfigurations() {
        let htmlboxes = []
        let temp = []
        let submitter = []
        let tempmini = []
        for(let i = 0; i < Object.keys(stats.args).length; i++) {
            for(let j = 0; j < Object.keys(stats.args[i].values).length; j++) {
                if(stats.args[i].values[j].type === "textbox")
                    tempmini.push(<input type="text" placeholder="Enter your text here" id={stats.args[i].display_name + " " +
                        stats.args[i].values[j].display_name}/>)
                else if(stats.args[i].values[j].type === "checkbox")
                    tempmini.push(<input type="checkbox" id={stats.args[i].display_name + " " +
                        stats.args[i].values[j].display_name}/>)
                else if(stats.args[i].values[j].type === "radiobutton")
                    for(let k = 0; k < Object.keys(stats.args[i].values[j].items).length; k++)
                        tempmini.push(
                            <label>
                                <br/>
                                <input type="radio" name={stats.args[i].display_name + " " +
                                    stats.args[i].values[j].display_name} value={stats.args[i].values[j].items[k]}/>
                                {stats.args[i].values[j].items[k]}
                            </label>
                        )
                temp.push(<div style={{fontSize: "15px"}}>
                    {stats.args[i].values[j].display_name.toString() + ":"}
                    {tempmini}
                </div>)
                tempmini = []
            }
            htmlboxes.push(<div style={{fontSize: "15px", marginBottom:"0"}}>
                {stats.args[i].display_name.toString()}
                <blockquote style={{marginTop: "0", marginBottom:"0"}}>
                    {temp}
                </blockquote>
            </div>)
            temp = []
        }
        submitter.push(<div style={{fontSize: "25px"}}>
            Configurations:
            <br/>
            <blockquote style={{marginTop: "0"}}>
                {htmlboxes}
            </blockquote>
        </div>)
        return submitter
    }
    return (
        <>
            <Routes>
                <Route path="/" element={
                    <div>
                        <h1 className="title">
                            DataWrangler's Pal
                            <h2 className="bubble">
                                <form>
                                    <label form="username1">Username</label>
                                    <br/>
                                    <input type="text" id="username1" className="userinfo"/>
                                    <br/>
                                    <label form="password1">Password</label>
                                    <br/>
                                    <input type="text" id="password1" className="userinfo"/>
                                </form>
                                <Link to="/mainmenu">
                                    <button type="button" className="basic">
                                        Login
                                    </button>
                                </Link>
                                <Link to="/signup">
                                    <button type="button" className="basic">
                                        Signup
                                    </button>
                                </Link>
                            </h2>
                        </h1>
                    </div>
                }/>
                <Route path="/mainmenu" element={
                    <div>
                        <h1 className="datatableheader">
                            HomePage
                            <h2 className="datatablecontainer">
                                <h3 className="leftcontainer">
                                    <button type="button" className="uploader" id="uploadbutton" onClick={handleFile}>
                                        <i className="fa-solid fa-arrow-up-from-bracket"></i>
                                        &nbsp;Upload Data
                                    </button>
                                    <button type="button" className="uploader" onClick={oldTable}>
                                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                        &nbsp;Default Data
                                    </button>
                                    <button type="button" className="uploader" onClick={updateconfig}
                                            style={{color: "darkseagreen"}}
                                            id="mithu">
                                        <i className="fa-solid fa-stairs"></i>
                                        &nbsp;Structure Data
                                    </button>
                                    <button type="button" className="uploader" style={{color: "lightsalmon"}}
                                            id="aidan">
                                        <i className="fa-solid fa-wave-square"></i>
                                        &nbsp;Process Signal
                                    </button>
                                    <Link to="/output" target="_blank">
                                        <button type="button" className="uploader">
                                            <i className="fa-solid fa-chart-line"></i>
                                            &nbsp;Graph Data
                                        </button>
                                    </Link>
                                    <button type="button" className="uploader" id="downloadtime"
                                            onClick={downloadObjectAsJson}>
                                        <i className="fa-solid fa-arrows-down-to-line"></i>
                                        &nbsp;Download Data
                                    </button>
                                    <h4 className="extrasconfig" id="configs">
                                        {doconfigurations()}
                                    </h4>
                                </h3>
                                <h3 style={{margin: "0", fontSize: "40px"}} id="titledatatitle">
                                    &nbsp;&nbsp;&nbsp;No File to Display
                                </h3>
                                <h3 className="rightcontainer">
                                <table className="scrollingtable" id="outputtable"></table>
                                </h3>
                            </h2>
                        </h1>
                    </div>}/>
                <Route path="/signup" element={
                    <div>
                        <div>
                            <h2 className="bubble">
                                <form>
                                    <label form="email2">Email</label>
                                    <br/>
                                    <input type="text" id="email2" className="userinfo"/>
                                    <br/>
                                    <label form="username2">Username</label>
                                    <br/>
                                    <input type="text" id="username2" className="userinfo"/>
                                    <br/>
                                    <label form="password2">Password</label>
                                    <br/>
                                    <input type="text" id="password2" className="userinfo"/>
                                </form>
                                <Link to="/">
                                    <button type="button" className="basic">
                                        Submit
                                    </button>
                                </Link>
                            </h2>
                        </div>
                    </div>}/>
                <Route path="/output" element={
                    <body>
                    <h1 className="graphtitle">
                        PolyData Graph
                        <h2 className="graphbubble" style={{marginTop: 25}}>
                            {dofunction()}
                        </h2>
                    </h1>
                    </body>}/>
            </Routes>
        </>
    )
}

export default App
