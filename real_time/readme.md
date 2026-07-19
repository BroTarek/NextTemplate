# Real-Time Communication Methods

Improving **latency** is essential for building responsive real-time applications. There are three common techniques used for real-time communication between clients and servers:

- **Server-Sent Events (SSE)**
- **WebSockets**
- **Long Polling**

---

# Server-Sent Events (SSE)

## Overview

**Server-Sent Events (SSE)** provide a streamlined approach for **server-to-client** communication.

Unlike traditional HTTP, where the client repeatedly sends requests asking for updates, SSE allows the server to automatically push new data to the client whenever it becomes available.

This is achieved through a **single HTTP connection** that remains open for as long as necessary, making SSE ideal for applications that require continuous real-time updates without the overhead of repeated HTTP requests.

---

## How It Works

1. The client opens a standard HTTP connection.
2. The server keeps the connection open.
3. Whenever new data is available, the server pushes it through the same connection.
4. The connection remains open until either side closes it.

```
Client ─────────────► Server
        HTTP Request

Client ◄───────────── Server
      Event Stream

Client ◄───────────── Server
      New Update

Client ◄───────────── Server
      New Update
```

---

## Characteristics

- Uses a single long-lived HTTP connection.
- One-way communication (**Server → Client**).
- Automatically reconnects if the connection is lost.
- Supports only text-based data.

---

## Advantages

- ✅ Very lightweight
- ✅ Automatic reconnection
- ✅ Uses standard HTTP
- ✅ Lower overhead than polling
- ✅ Excellent for live feeds and dashboards

---

## Limitations

- ❌ Client cannot send data through the same connection.
- ❌ Text data only (no binary support).
- ❌ One-way communication.

---

## Ideal Use Cases

- Live notifications
- News feeds
- Stock prices
- Analytics dashboards
- Social media timelines

---

# WebSockets

## Overview

**WebSockets** provide **bidirectional (full-duplex)** communication between the client and server.

Unlike SSE, both the client and the server can send messages to each other at any time.

A WebSocket connection begins as a normal HTTP request, then performs a **handshake** that upgrades the connection to the WebSocket protocol. Once established, the connection remains open, enabling continuous two-way communication.

---

## How It Works

1. Client sends an HTTP request.
2. Server upgrades the connection using the WebSocket handshake.
3. A persistent connection is established.
4. Both client and server can exchange messages simultaneously.

```
Client ─────HTTP Request────► Server

Client ◄── HTTP 101 Switching Protocols ── Server

═══════════════════════════════════════════
Persistent WebSocket Connection
═══════════════════════════════════════════

Client ◄────────────► Server
Client ◄────────────► Server
Client ◄────────────► Server
```

---

## Characteristics

- Persistent connection.
- Full-duplex communication.
- Supports both text and binary data.
- Very low latency.
- No built-in automatic reconnection.

---

## Advantages

- ✅ Two-way communication
- ✅ Extremely low latency
- ✅ Supports binary data
- ✅ Ideal for frequent updates
- ✅ Minimal message overhead after connection establishment

---

## Limitations

- ❌ Requires more server resources.
- ❌ No built-in reconnection mechanism.
- ❌ More complex to implement than SSE.

---

## Ideal Use Cases

- Chat applications
- Multiplayer games
- Collaborative editing
- Live trading systems
- Video conferencing
- IoT communication

---

# Long Polling

## Overview

Long Polling is a legacy technique that simulates real-time communication using standard HTTP requests.

Although less efficient than SSE or WebSockets, it remains useful as a fallback for environments where newer technologies are unavailable.

---

## How It Works

1. Client sends an HTTP request.
2. Server keeps the request open while waiting for new data.
3. When data becomes available (or the request times out), the server responds.
4. The client immediately sends another request.

The cycle then repeats.

```
Client ─────────► Server
      "Any updates?"

Server waits...

Server ─────────► Client
    "Here's the update."

Client ─────────► Server
      "Any updates?"

(repeat)
```

---

## Characteristics

- Simulates real-time communication.
- Uses standard HTTP.
- Works with every browser.
- Requires a new HTTP request after every response.

---

## Advantages

- ✅ Universal browser support
- ✅ Easy to implement
- ✅ Firewall-friendly
- ✅ No special protocols required

---

## Limitations

- ❌ Higher latency than SSE and WebSockets.
- ❌ Larger bandwidth usage (HTTP headers every request).
- ❌ Increased server load.
- ❌ Not truly real-time.
- ❌ Can cause "thundering herd" problems under heavy traffic.

---

## Ideal Use Cases

- Legacy browser support
- Restricted network environments
- Low-frequency updates
- HTTP-only infrastructures

---

# Comparison

| Feature | Long Polling | SSE | WebSockets |
|---------|--------------|-----|------------|
| Communication | Client ↔ Server (Repeated HTTP) | Server → Client | Client ↔ Server |
| Connection Type | New HTTP request every update | Persistent HTTP | Persistent WebSocket |
| Real-Time Performance | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Latency | High | Low | Very Low |
| Bandwidth Usage | High | Low | Very Low |
| Automatic Reconnection | Client implements | ✅ Built-in | ❌ Manual |
| Binary Data | ❌ | ❌ | ✅ |
| Text Data | ✅ | ✅ | ✅ |
| Complexity | Low | Low | Medium |
| Server Resource Usage | Medium | Low | High |
| Browser Support | Excellent | Excellent (Modern Browsers) | Excellent |

---

# When Should You Use Each?

### Use **Long Polling** when:

- Supporting legacy browsers.
- Only HTTP is available.
- Update frequency is low.

---

### Use **SSE** when:

- Data flows only from the server to the client.
- You need automatic reconnection.
- You're streaming text updates such as:
  - Notifications
  - Dashboards
  - News feeds
  - Live scores

---

### Use **WebSockets** when:

- Both client and server need to communicate.
- Very low latency is required.
- You need to send binary data.
- Building:
  - Chat applications
  - Multiplayer games
  - Collaborative editors
  - Trading platforms
  - Video calls

---

# Summary

| Technology | Best For |
|------------|----------|
| **Long Polling** | Legacy systems and maximum compatibility |
| **SSE** | Lightweight, one-way server-to-client updates |
| **WebSockets** | Full-duplex, ultra-low-latency communication |