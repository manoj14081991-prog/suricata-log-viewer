// =====================================================================
// Suricata Log Viewer - app.js
//
// What this file does (in simple words):
//   1. User picks a Suricata log file (eve.jsonl) from their computer.
//   2. We read the file and convert every line into a JavaScript object.
//   3. Bad / broken lines are skipped and counted (the app never crashes).
//   4. We show each event as a card, with filter (event type) and sort.
// =====================================================================
//
// ---- Step 0: Grab the HTML elements we need to work with ----
// (Each id below matches an element in index.html)
// File picker input
const fileInput = document.getElementById("fileInput");
// Small text under the picker, e.g. 'eve-sample.jsonl loaded successfully.'
const fileStatus = document.getElementById("fileStatus");
// Number boxes shown in the statistics section
const totalEvents = document.getElementById("totalEvents");
const invalidEvents = document.getElementById("invalidEvents");
// Big box where all log cards are drawn
const logContainer = document.getElementById("logContainer");

// Dropdowns used for filtering and sorting
const eventTypeFilter = document.getElementById("eventTypeFilter");
const sortOrder = document.getElementById("sortOrder");


// 'Showing' counter = how many events match the current filter
const showingEvents = document.getElementById("showingEvents");
// Memory of the app: every valid event from the loaded file is kept here.
// Filtering and sorting always start from this list, so the original data is never lost.
let allEvents = [];

// When the user chooses a file, run handleFileUpload()
fileInput.addEventListener("change", handleFileUpload);

// ---------------------------------------------------------------------
// Main function: runs when a file is selected.
// Reads the file, checks it, parses it and shows the logs.
// ---------------------------------------------------------------------
async function handleFileUpload(event) {
    // The file the user selected (undefined if they cancelled)
    const file = event.target.files[0];

    // Reset previous state
    // Note: 'errorMessage' is the red message box in index.html (id="errorMessage").
    // Browsers expose elements that have an id as global variables, so it works without declaring it here.
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
    logContainer.innerHTML = "";
    totalEvents.textContent = "0";
    invalidEvents.textContent = "0";
    showingEvents.textContent = "0";
    fileStatus.textContent = "";
    allEvents = [];

    // User cancelled the dialog - nothing to do, stop here
    if (!file) {
        return;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".jsonl") && !fileName.endsWith(".json")) {
        errorMessage.textContent =
            "Invalid File: Please select a valid .jsonl or .json file.";

        errorMessage.style.display = "block";

        logContainer.innerHTML = `
            <div class="empty-state">
                <h2>No logs loaded</h2>
                <p>Please select a valid Suricata eve.jsonl file.</p>
            </div>
        `;

        return;
    }

    // Wrap file reading + parsing in try/catch so any unexpected problem shows a friendly error
    try {
        // Read the whole file as plain text
        const text = await readFile(file);

        // JSONL format = one JSON object per line.
        // So we split the text into lines (works for both Windows and Linux line endings).
        const lines = text.split(/\r?\n/);
        // 'events' = valid lines, 'invalidCount' = broken lines
        const events = [];
        let invalidCount = 0;

        // Go through each line one by one
        lines.forEach(function (line, index) {

            // Skip empty lines
            if (!line.trim()) {
                return;
            }

            try {
                // Try to convert the line text into a JavaScript object
                const json = JSON.parse(line);
                events.push(json);

            // The line is not valid JSON: count it, print a warning in the browser console
            // (with the line number) and continue with the next line
            } catch (error) {
                invalidCount++;

                console.warn(
                    `Invalid JSON at line ${index + 1}`,
                    error
                );
            }
        });

        // No valid events
        if (events.length === 0) {

            errorMessage.textContent =
                "Invalid File: No valid Suricata log entries found.";

            errorMessage.style.display = "block";

            invalidEvents.textContent = invalidCount;

            logContainer.innerHTML = `
                <div class="empty-state">
                    <h2>No logs loaded</h2>
                    <p>The selected file does not contain valid Suricata log entries.</p>
                </div>
            `;

            return;
        }

        // Valid events
        allEvents = events;

        // Fill the 'Event Type' dropdown using the types found in this file (alert, dns, http ...)
        createEventTypeOptions();

        // Update the statistics boxes
        totalEvents.textContent = allEvents.length;
        invalidEvents.textContent = invalidCount;

        fileStatus.textContent =
            `${file.name} loaded successfully.`;

        // Show warning if some lines are invalid
        if (invalidCount > 0) {
            errorMessage.textContent =
                `${invalidCount} invalid JSON entr${invalidCount === 1 ? "y" : "ies"} skipped.`;

            errorMessage.style.display = "block";
        }

        // Render cards
        // Draw the log cards on the screen
        renderLogs();

    // Something went wrong while reading the file - show an error message
    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            "Invalid File: Unable to read the selected file.";

        errorMessage.style.display = "block";

        logContainer.innerHTML = `
            <div class="empty-state">
                <h2>No logs loaded</h2>
                <p>Unable to read the selected file.</p>
            </div>
        `;
    }
}

// ---------------------------------------------------------------------
// Reads a file and gives back its text.
// FileReader works with callbacks, so it is wrapped in a Promise
// to be able to use the easier 'await' keyword above.
// ---------------------------------------------------------------------
function readFile(file) {
    return new Promise(function (resolve, reject) {

        const reader = new FileReader();

        reader.onload = function (event) {
            resolve(event.target.result);
        };

        reader.onerror = function () {
            reject(reader.error);
        };

        reader.readAsText(file);
    });
}

// ---------------------------------------------------------------------
// Creates one short, human-readable sentence for an event.
// Each event type stores its details in a different place,
// so we pick the right fields depending on event.event_type.
// The '?.' means 'if this exists' - it prevents errors on missing data.
// ---------------------------------------------------------------------
function getSummary(event) {

    switch (event.event_type) {

        // Alert -> show the rule name (signature) that triggered
        case "alert":
            return event.alert?.signature || "Security alert detected";

        // DNS -> show the domain asked, or the IP address answers
        case "dns":
            if (event.dns?.type === "query") {
                return `DNS query: ${event.dns.rrname || "Unknown domain"}`;
            }

            if (event.dns?.answers?.length) {
                const answers = event.dns.answers
                    .map(answer => answer.rdata)
                    .filter(Boolean)
                    .join(", ");

                return `DNS answer: ${event.dns.rrname || "Unknown"} → ${answers}`;
            }

            return "DNS event detected";

        // HTTP -> example: GET example.com/page - HTTP 200
        case "http":
            return `${event.http?.http_method || "HTTP"} ${event.http?.hostname || ""}${event.http?.url || ""} — HTTP ${event.http?.status || "N/A"}`;

        // Flow -> connection state and number of packets in each direction
        case "flow":
            return `Flow ${event.flow?.state || "detected"} — ${
                event.flow?.pkts_toserver || 0
            } packets to server, ${
                event.flow?.pkts_toclient || 0
            } to client`;

        // File transfer -> file name
        case "fileinfo":
            return `File: ${event.fileinfo?.filename || "Unknown file"}`;

        // SSH -> client and server software versions
        case "ssh":
            return `SSH connection — client ${
                event.ssh?.client?.software_version || "Unknown"
            }, server ${
                event.ssh?.server?.software_version || "Unknown"
            }`;

        // Anomaly -> type of unusual behaviour found
        case "anomaly":
            return `Anomaly: ${
                event.anomaly?.type || "Application anomaly detected"
            }`;

        // Any other event type -> generic text
        default:
            return "Network event detected";
    }
}


// ---------------------------------------------------------------------
// Decides the severity label and the CSS class (colour) of a card.
// Only 'alert' events have severity: 1 = High, 2 = Medium, 3 = Low.
// ---------------------------------------------------------------------
function getSeverityInfo(event) {

    // Not an alert -> no badge and no colour
    if (event.event_type !== "alert") {
        return {
            label: "",
            className: ""
        };
    }

    // Severity number given by Suricata
    const severity = event.alert?.severity;

    switch (severity) {

        case 1:
            return {
                label: "High",
                className: "severity-high"
            };

        case 2:
            return {
                label: "Medium",
                className: "severity-medium"
            };

        case 3:
            return {
                label: "Low",
                className: "severity-low"
            };

        // Missing or unexpected number -> Unknown
        default:
            return {
                label: "Unknown",
                className: "severity-unknown"
            };
    }
}

// ---------------------------------------------------------------------
// Draws the cards on screen.
// Order of work: clear old cards -> filter -> sort -> create cards.
// Called after loading a file and every time a dropdown changes.
// ---------------------------------------------------------------------
function renderLogs() {

    // Remove the old cards before drawing new ones
    logContainer.innerHTML = "";

    // Current values of the two dropdowns
    const selectedType = eventTypeFilter.value;
    const selectedSort = sortOrder.value;

    // Filter
    // Filter: keep only the events that match the chosen type ('all' keeps everything).
    // filter() makes a new list, so allEvents stays untouched.
    let filteredEvents = allEvents.filter(function (event) {

        if (selectedType === "all") {
            return true;
        }

        return event.event_type === selectedType;
    });

    // Update the 'Showing' counter
    showingEvents.textContent = filteredEvents.length;

    // Nothing matches the filter -> show a friendly 'No events found' message and stop
    if (filteredEvents.length === 0) {

    logContainer.innerHTML = `
        <div class="empty-state">
            <h2>No events found</h2>
            <p>No logs match the selected event type.</p>
        </div>
    `;

    return;
}

    // Sort by timestamp
    filteredEvents.sort(function (a, b) {

        // Newest first = bigger timestamp first, oldest first = smaller timestamp first
        if (selectedSort === "newest") {
            // toMillis() makes seconds / milliseconds / ISO-text timestamps comparable
            // (a missing or unreadable timestamp counts as 0, so it goes to the end/start safely)
            return (toMillis(b.timestamp) || 0) - (toMillis(a.timestamp) || 0);
        }

        return (toMillis(a.timestamp) || 0) - (toMillis(b.timestamp) || 0);
    });

    // (Same empty-list check as above. It is a harmless duplicate, left as it is.)
    if (filteredEvents.length === 0) {

    logContainer.innerHTML = `
        <div class="empty-state">
            <h2>No events found</h2>
            <p>No logs match the selected event type.</p>
        </div>
    `;

    return;
}


    // Render
    filteredEvents.forEach(function (event) {

        // Create one card for every event: first find its severity colour/label
        const severity = getSeverityInfo(event);

        // Create an empty card box
        const card = document.createElement("div");

        // Apply the card style plus the severity colour class (if any)
        card.className = `log-card ${severity.className}`;

        // Fill the card: event type + severity badge on top, then
        // timestamp, source, destination (IP:port) and the summary sentence.
        card.innerHTML = `
    <div class="log-header">

        <h3>${event.event_type || "Unknown Event"}</h3>

        ${
            severity.label
                ? `<span class="severity-badge">
                    ${severity.label}
                   </span>`
                : ""
        }

    </div>

    <p>
        <strong>Timestamp:</strong>
        ${formatTimestamp(event.timestamp)}
    </p>

    <p>
        <strong>Source:</strong>
        ${event.src_ip || "N/A"}${event.src_port ? ":" + event.src_port : ""}
    </p>

    <p>
        <strong>Destination:</strong>
        ${event.dest_ip || "N/A"}${event.dest_port ? ":" + event.dest_port : ""}
    </p>

    <p>
        <strong>Summary:</strong>
        ${getSummary(event)}
    </p>
`;

        // Put the finished card on the page
        logContainer.appendChild(card);
    });

    // (Not used anywhere right now - kept as it is.)
    const resultCount = filteredEvents.length;
}


// ---------------------------------------------------------------------
// Builds the 'Event Type' dropdown from the loaded data.
// Example result: All Events, ALERT, FLOW, DNS, HTTP ...
// ---------------------------------------------------------------------
function createEventTypeOptions() {

    // 'new Set' removes duplicates, so every event type appears only once
    const eventTypes = [
        ...new Set(
            allEvents.map(event => event.event_type)
        )
    ];

    // Reset the dropdown to just 'All Events', then add one option per type
    eventTypeFilter.innerHTML = `
        <option value="all">All Events</option>
    `;

    eventTypes.forEach(function (type) {

        const option = document.createElement("option");

        option.value = type;
        option.textContent = type.toUpperCase();

        eventTypeFilter.appendChild(option);
    });
}

// Re-draw the cards whenever the user changes the filter or the sort order
eventTypeFilter.addEventListener("change", function () {
    renderLogs();
});

sortOrder.addEventListener("change", function () {
    renderLogs();
});

// ---------------------------------------------------------------------
// NEW helper: turns any timestamp into milliseconds since 1970.
// Suricata logs can contain timestamps in different forms:
//   1786678931                          -> seconds
//   1786678923221                       -> milliseconds
//   "2026-08-14T03:41:58.112000+0000"   -> ISO text (real eve.json style)
// Returns NaN if the value cannot be understood.
// ---------------------------------------------------------------------
function toMillis(timestamp) {

    // Numbers (or text that only has digits)
    if (typeof timestamp === "number" || /^\d+(\.\d+)?$/.test(String(timestamp).trim())) {

        const value = Number(timestamp);

        // Below 100 billion = seconds (that is year ~5138 if read as milliseconds),
        // so multiply by 1000. Bigger numbers are already milliseconds.
        return value < 1e11 ? value * 1000 : value;
    }

    // ISO text: make it readable for every browser
    //   "+0000" -> "+00:00"  and  ".112000" (microseconds) -> ".112" (milliseconds)
    const cleaned = String(timestamp)
        .trim()
        .replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
        .replace(/\.(\d{3})\d+/, ".$1");

    return Date.parse(cleaned);
}

// ---------------------------------------------------------------------
// Converts the raw timestamp number into a readable date/time
// using the user's own language and time zone. Shows N/A if missing.
// ---------------------------------------------------------------------
function formatTimestamp(timestamp) {

    if (!timestamp) {
        return "N/A";
    }

    // Convert to milliseconds first, so seconds-based values do not show as year 1970
    const millis = toMillis(timestamp);

    // Could not understand the value -> show it as it is instead of "Invalid Date"
    if (Number.isNaN(millis)) {
        return String(timestamp);
    }

    const date = new Date(millis);

    return date.toLocaleString();
}


