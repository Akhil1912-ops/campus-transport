# Campus Transport — Phoenix Backend

## Run

```cmd
cd c:\Users\Akhil\campus-transport\phoenix_backend
mix phx.server
```

Server: **http://localhost:4000**

## API

| Endpoint | Description |
|----------|-------------|
| GET /api/state | Full state (autos, buggies, passengers) |

## WebSocket (Phoenix Channels)

Connect to: `ws://localhost:4000/socket/websocket`

Channel: `transport:app`

### Client → Server (handle_in)

| Event | Payload |
|-------|---------|
| register_auto | { lat, lng, state?, passengerCount? } |
| register_buggy | { lat, lng, route } |
| register_passenger | { lat, lng, type: "within"\|"outside" } |
| location_update | { type: "auto"\|"buggy"\|"passenger", id?, lat, lng, ... } |
| auto_pickup | { id?, passengerCount } |
| auto_drop | { id? } |
| passenger_done | { id? } |

### Server → Client (broadcast)

| Event | Payload |
|-------|---------|
| (join reply) | { autos, buggies, passengers } |
| auto_registered, buggy_registered, passenger_registered | { id } |
| auto_updated, buggy_updated, passenger_added | entity object |
| passenger_removed | { id } |

## JavaScript Client Example

```js
import { Socket } from "phoenix"

const socket = new Socket("ws://localhost:4000/socket", {})
socket.connect()

const channel = socket.channel("transport:app", {})
channel.join()
  .receive("ok", state => console.log("State:", state))
  .receive("error", err => console.log("Join failed:", err))

channel.on("auto_updated", payload => console.log("Auto:", payload))
channel.push("register_passenger", { lat: 12.97, lng: 77.59, type: "within" })
```
