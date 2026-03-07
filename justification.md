# Vehicle Analytics Fullstack Assessment – Justification

## API

Use this file to briefly explain your design decisions. Bullet points are fine.

### 1. Overall API design

> Summary of your API structure and main routes (paths, methods, and what they return):

- All routes are separated by tag (health, sensors, telemetry) in the routes folder.

- GET `/health` - Previously implemented, changed error case to use error schema for consistency.

- Sensor metadata is fetched once on startup, and subsequent calls to `/sensors` retrieve metadata from the API store to avoid unnecessary calls to the emulator. Stored in a hashmap for efficient lookup.

- GET `/sensors` - Returns an array of objects containing sensorId, sensorName and unit for each sensor. This keeps it consistent with the fetching of metadata from the emulator. 

- GET `/sensors/:sensorId` - Returns a metadata object for the given sensorId.

- API connects to emulator via websockets to receive telemetry data stream. For each message received, the data is parsed and validated. If the reading is invalid, it is either dropped or recovered depending on recoverability. The recovered reading is then stored in a map to store each latest reading by sensorId.

- GET `/telemetry` - Returns an array of objects containing sensorId, value and timestamp for each sensor. These readings are the latest reading stored in the API store.

- GET `/telemetry/stream` - Opens an SSE Stream. For every telemetry message received from the emulator, pushes a reading event string. SSE was chosen over websockets as data is only sent one way; The frontend never sends data back to the API (At least in the scope of the assessment).

- GET `/telemetry/:sensorId` - Returns a telemetry reading object for the given sensor. Readings also taken from the store.

- GET `/docs` - Opens Swagger UI to see documentation.

### 2. Data vs metadata separation

> How clients should use your metadata route(s) vs your data route(s) (and streaming, if implemented):

- Separation allows static metadata to only be loaded once and cached, while the telemetry data values are updated live.

- For all metadata - use GET `/sensors`. Since metadata is generally static, clients access this once to receive metadata about all sensors. GET `/sensors/:sensorId` can be used to access a single sensor. This acts as an extension of the resource model and will be useful if clients only need to access a specific sensor. Acts as a natural RESTful extension to the `/sensors` route.

- Same for telemetry, GET `/telemetry` returns the latest reading for every sensor. This is useful for an overview. GET `/telemetry/:sensorId` is again useful if only one sensor's reading is needed, such as for a specific look up or detailed view.

- GET `/telemetry/stream` uses Server Sent Events to keep an updated stream of new readings. SSE offers the lowest latency compared to polling and reduces network overhead by maintaing one connection rather than opening and closing new ones. This will be the best to use for live feeds and charts.

- Clients should use `/telemetry` on initial load to receive initial values for the dashboard, then use `/telemetry/stream` to keep values updated.

### 3. Emulator (read-only)

- Confirm you did not modify the emulator service (`emulator/`) or its `sensor-config.json`. If you needed to work around anything, note it here: N

- I confirm I did not modify the emulator service. 

- I did view the invalid data output code, to determine the possible invalid data formats, and developed handling in accordance. 

- This means that the invalid data handling specifically accounts for all possible invalid data formats from the emulator, but not any more (E.g. I did not account for missing value or missing timestamp, because these are not possible from the emulator).

- In the context of the assessment, I believe this shows deep understanding of the full stack, but I recognise in reality more rigorous invalid data handling will be required.

### 4. OpenAPI / Swagger

> Where your final OpenAPI spec lives and how to view or use it (e.g. Swagger UI):

- Swagger UI provides an in-depth interface to view paths, methods and responses.

- This can be viewed at `http://localhost:4000/docs`, after running `docker compose up`.

### 5. Testing and error handling

> - What you chose to test and any notable error-handling decisions:

- I tested end to end for all routes using Postman. This includes positive responses, as well as 4xx responses such as invalid input. 

- Also turned off the emulator to test for 503 error responses on `/health` and `/sensors`.

- Notable error handling includes lack of 503 for GET `/telemetry` routes. This is because it retrieves data from the telemetry store in the API, not directly from emulator. In the case of an empty array, this is not necessarily an error, as the sensor could be connected but readings have not come in yet.

- In comparison, `/sensors` route do contain 503 errors, because if there is no metadata in the store, then that means it was unable to load the metadata from the emulator.

### 6. Invalid data from the emulator (Task 2)

> - How you detect invalid readings from the emulator stream:
> - What you do with invalid data (drop, log, count, etc.) and why:

- Validation function can be found in `validation.ts`. The function `parseReading()` receives unknown raw data and for each key value and attempts to convert to a number using Number(). If sensorId is 
missing or either conversion produces NaN, the reading is dropped. 
If conversion succeeds but the original type was a string, the 
reading is recovered and logged.

- If value is missing or unparseable, then it is dropped, if value is recoverable (e.g. numeric string) then it is recovered. Any time a drop or recovery occurs, it is logged to console so any missing data points is explained.

### 7. Out-of-range values per sensor (Task 3)

> - How you use the valid-range table (sensor name or sensorId → min/max) and count out-of-range readings per sensor in a 5-second window:
> - How you log the timestamp and error message (including sensor) when a sensor exceeds the threshold (&gt;3 out-of-range in 5 s):

- Hard coded valid-range table into the API at validation.ts. Min and max values are keyed by sensorName. This is because sensorId can change and is determined by hardware, min and max values will always be attributed to a certain sensor type (sensorName).

- Although this information is available in sensor-config.json in emulator, this information is not exposed to the API. The table could be placed in a json file, however for this assessment I believe it is unnecessary.

- A sliding window is implemented to keep track of all out of range events in the last 5 seconds. If the length of this array is greater than 3, it logs the error to console providing sensor name and sensor Id.

- Currently, an error is outputted every instance that there is more than 3 out of range values in the last 5 seconds. This could lead to console spam and this is a known limitation, but for the purposes of the assessment it does not appear to be an issue.


## Frontend

Use this section to briefly explain your frontend design decisions. Bullet points are fine.

### 1. Figma mockup

- Link to your low-fidelity Figma mockup and what it shows:

https://www.figma.com/design/knDEAwYKND6wre5NSCcOvc/Vehicle-Dynamics-Dashboard?node-id=0-1&t=vekMD4IprkFLbKyi-1

- Header contains a title and API connection status. Shows the sidebar that changes colour depending if the colour is in range, nearing out of range and out of range.
Main body, One chart for each sensor. The bottom shows visual indicators for steering angle, vehicle speed brake pressure and pack state of charge.



### 2. Layout and information hierarchy

- Why you structured the dashboard the way you did:

- The header shows API connection status to indicate no issues with the backend.
- Sidebar provides a quick way to view current values for each sensor, as well as colour to indicate safe, warning and danger.
- Vehicle speed, steering angle and brake pressure have taller and longer charts, as they are the most important (vehicle dynamics).
- Pack voltage and pack voltage are smaller, but share time axis to show relation power output relation to vehicle dynamics.
- Right column consists of all tyre pressures, the two temperature sensors and pack SOC at the bottom. pack SOC is separated as it is least likely to have large fluctuations (in reality).
- Red reference areas have been added to show when a value goes out of range for clarity.
- Each chart header contains the current value again for quick reference.
- Visual indicators for vehicle dynamics and pack SOC have been added at the bottom for an intuitive visual of each value.
- Chart layout has been prioritised for readability and referencing between each value. As such, charts use a shared time axis, to easily compare values at a given time.

### 3. API consumption

- How you use `/sensors` and `/telemetry` (and WebSocket, if used):

- `useTelemetry()` handles all telemetry usage.
- `/sensors` is called once upon startup to gather sensormetadata. `/telemetry` is also called to initially populate data. The metadata and data are then used to populate initial values for the sidebar and charts.
- `/telemetry/stream` is then used to update latest readings and history array, which is used to update data.

### 4. Visual design and usability

- Choices around colours, typography, states, and responsiveness:

- Chart colours have been separated by type for clarity (vehicle dynamics, pack state, tyre pressure, and temperature).

- Sidebar uses green for safe, amber for warning and red for unsafe

- Value takes priority in typography, bold or larger. Unit is least important, and is smaller and muted.

- Sidebar cards have four different states - the three colours and no colour for no data yet.

- Charts have two states - no data yet and receiving data. Red reference areas are used to show danger zone

- Charts are updated every time a new value comes in for that sensor via telemetry stream, maximising responsiveness.

### 5. Trade-offs and limitations

- Anything you would do with more time or a different stack:

- If I had more time, I would implement detailed popups when clicking on a chart or a sensor on the sidebar.

- This could show additional information, such as the minimum and maximum value reached, min and max ranges, and number of times gone out of range.

- I would add the ability to add scaleable time windows, and to store all history of data from startup.

- Ability to export recorded data.

- Interactive charts, to go back and view data at a certain time.

- Configurable layout, ability to add, remove, edit, scale charts to your liking.
