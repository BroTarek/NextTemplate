improving latency is essnetial for improving any real time application

server sent event svs web sockets

SSE: streamlined approach for server to client communication, unlike traditional HTTP requests where the client has to constantly pull the server for updates, SSE allows the server to automatically push the updates to the client , this is acheived  through a single  http connection that remains open as long as needed. Appeaking for applications that requires continous real time data update witout overhead of repeated requests .

In case of lost connection , SSE will auto reconnect 
Ideal for server to client updates (one way communication)
One way communication , client can not send data to server 
SSE only send text data


---------------------------------------------------------------------

Web-Sockets: bidirectional enables full duplex communication between the client and server. WebSockets establish a persistent connection allowing both parties to send data simultaneously.the duplex commincation is handled by handshack which begins with the http request but then upgrades the connection to the websocket protocol , once the connection is established it remains open 

websockets are not limited to text , they supports binary data
WebSockets requires more server resources
websockets does not have built in support for lost connection


----------------------------------------------------------------------

long polling:


----------------------------------------------------------------------

short polling:
