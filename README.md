# Suricata Log Viewer

A lightweight web-based viewer for Suricata `eve.jsonl` logs.

The application reads a Suricata JSONL file, parses individual log entries, and displays them in a readable card-based interface. Users can filter events by event type and sort them by timestamp.

## Features

- Upload `.jsonl` or `.json` files
- Parse JSONL data line by line
- Handle malformed JSON entries without stopping the complete file
- Display:
  - Timestamp
  - Event type
  - Source IP and port
  - Destination IP and port
  - Human-readable event summary
- Filter logs by event type
- Sort logs by timestamp:
  - Newest first
  - Oldest first
- Alert severity indicators:
  - High
  - Medium
  - Low
  - Unknown
- Display total valid events
- Display invalid JSON entry count
- Responsive layout for smaller screens
- Error handling for invalid files and files without valid events

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- JavaScript `async/await`
- FileReader API

No frontend framework is used.

## Project Structure

```text
suricata-log-viewer/
│
├── index.html
├── style.css
├── app.js
├── eve-sample.jsonl
├── README.md
└── AI_PROMPTS.md
```

## How to Run

### Option 1: VS Code Live Server

1. Open the project folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. The application will open in the browser.

Example:

```text
http://127.0.0.1:5500
```

### Option 2: Any Static Web Server

The project contains only static HTML, CSS and JavaScript, so it can be served using any local static web server.

## How It Works

### 1. Select Log File

The user selects a `.jsonl` or `.json` file from the file upload control.

### 2. Read the File

JavaScript uses the FileReader API with a Promise-based wrapper and `async/await` to read the file.

### 3. Parse JSONL

The file is split into individual lines.

Each non-empty line is parsed separately using `JSON.parse()`.

If a line contains invalid JSON, that line is skipped and counted as an invalid entry.

The remaining valid events are still displayed.

### 4. Generate Event Types

Event types are generated dynamically from the loaded data.

For example:

```text
ALERT
DNS
HTTP
FLOW
FILEINFO
SSH
ANOMALY
```

### 5. Generate Event Summary

The application creates a short human-readable summary based on the event type.

For example:

```text
DNS query: example.com
```

or:

```text
GET example.com/page — HTTP 200
```

### 6. Filter and Sort

Users can filter events by `event_type`.

They can also sort events by timestamp:

```text
Newest First
Oldest First
```

## Invalid Data Handling

The application does not modify or clean the original log file.

If a file contains some malformed JSON lines:

```text
Valid events → Displayed
Invalid lines → Skipped and counted
```

For example, if the sample contains 11 valid events and 1 malformed entry:

```text
Total Events: 11
Invalid Entries: 1
Showing: 11
```

If the selected file contains no valid events, an `Invalid File` error message is displayed and no log cards are rendered.

## Alert Severity

Alert events can contain a severity value.

The UI displays severity using visual indicators:

```text
1 → High
2 → Medium
3 → Low
Missing/Unknown → Unknown
```

Non-alert events do not display an alert severity badge.

## Testing

The application should be tested with:

- Valid `eve-sample.jsonl`
- Invalid file extension
- Empty file
- File containing malformed JSON
- File containing valid and invalid JSON entries
- Event type filtering
- Newest/oldest sorting
- Alert severity display
- Responsive screen sizes

## Data Handling

The provided Suricata sample file is used as input data and is not modified or manually cleaned.

Each JSONL line is processed independently so that one malformed entry does not prevent valid events from being displayed.

## AI Usage

AI assistance was used during development for:

- Understanding the assignment requirements
- Planning the implementation
- JavaScript implementation guidance
- JSONL parsing
- Error handling
- Event summary logic
- UI improvements
- Testing and documentation

The development prompt history is documented separately in:

```text
AI_PROMPTS.md
```

## Submission

The repository should contain the complete working source code, sample input file, README documentation, and AI prompt history.

```text
index.html
style.css
app.js
eve-sample.jsonl
README.md
AI_PROMPTS.md
```