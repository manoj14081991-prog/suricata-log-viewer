# AI Prompts Used

This file documents the AI prompts used during the development of the Suricata Log Viewer assignment.

## 1. Understand the Assignment

I have a coding assignment for a Senior Software Developer role.

Build a small Suricata JSONL log viewer using plain HTML, CSS and JavaScript.

Requirements:
- Load an eve.jsonl file
- Parse one JSON object per line
- Display log entries in a readable format
- Show timestamp, event type, source and destination
- Show a human-readable summary
- Handle malformed JSON
- Filter by event type
- Sort by timestamp
- Display alert severity
- Provide a clean responsive UI

Provide a step-by-step development plan.

## 2. Project Architecture

Suggest a clean project structure for a plain HTML, CSS and JavaScript implementation of the Suricata JSONL log viewer.

Keep the project simple, modular and easy to understand.

## 3. HTML Structure

Create the HTML structure for a responsive Suricata log viewer.

Include:
- Header
- File upload section
- Event type filter
- Sort controls
- Event statistics
- Log/event container
- Empty state
- Error/message area

## 4. JSONL File Parsing

Implement JavaScript logic to load an `.jsonl` file using the browser File API.

Requirements:
- Read the file as text
- Process one line at a time
- Parse each line as JSON
- Ignore empty lines
- Handle malformed JSON without stopping the complete process
- Keep track of parsing errors

## 5. Event Display

Create reusable JavaScript logic to display Suricata events.

Each event should show:
- Timestamp
- Event type
- Source IP and port
- Destination IP and port
- Human-readable summary
- Alert severity when available

Handle different Suricata event types appropriately.

## 6. Event Summary

Create human-readable summaries for common Suricata event types such as:
- alert
- dns
- http
- tls
- flow
- fileinfo
- ssh

If an event type does not have a specific summary, provide a sensible generic summary.

## 7. Filtering

Implement event-type filtering using plain JavaScript.

The user should be able to:
- View all events
- Filter by a specific event type
- Update the displayed event count

## 8. Sorting

Implement timestamp sorting.

Requirements:
- Newest first
- Oldest first
- Keep the original event data unchanged
- Update the UI after sorting

## 9. Alert Severity

For Suricata alert events, display the alert severity clearly.

Map severity values to readable labels where appropriate.

Do not display alert-specific information for events that do not contain an alert object.

## 10. Malformed JSON Handling

Improve error handling for malformed JSONL records.

The application should:
- Continue processing valid records
- Count invalid records
- Inform the user about parsing errors
- Avoid crashing the application

## 11. Responsive UI

Create a clean responsive design using plain CSS.

The UI should work on:
- Desktop
- Tablet
- Mobile

Use readable cards, spacing, buttons, filters and clear visual hierarchy.

## 12. Code Review

Review the complete implementation against the assignment requirements.

Check:
- JSONL parsing
- Error handling
- Event rendering
- Filtering
- Sorting
- Alert severity
- Responsive design
- JavaScript errors
- Code readability
- Browser compatibility

Identify missing or incorrect functionality.

## 13. Final Testing

Test the application using the sample `eve-sample.jsonl` file.

Verify:
- File loading works
- Valid events are displayed
- Invalid JSON does not crash the application
- Filters work
- Sorting works
- Alert severity is displayed
- Event summaries are readable
- UI works on different screen sizes

## 14. Documentation

Create a README explaining:
- Project overview
- Features
- Technologies used
- How to run the application
- How to load the sample JSONL file
- Project structure
- Error handling approach