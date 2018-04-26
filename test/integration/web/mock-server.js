const http = require('http');
const SocketIO = require('socket.io');

function startAGMockServer() {
    const server = http.createServer();
    const io = SocketIO(server);

    server.listen(9348);

    io.on('connection', (socket) => {
        socket.on('ACTION_GATE_TRANSPORT', (payload) => {
            socket.emit('ACTION_GATE_TRANSPORT', {type: 'B', payload})
        });
    });
}

function startAGWithPrefixMockServer() {
    const server = http.createServer();
    const io = SocketIO(server);

    server.listen(9349);

    io.on('connection', (socket) => {
        socket.on('ACTION_GATE_TRANSPORT', (payload) => {
            socket.emit('ACTION_GATE_TRANSPORT', {type: 'API/B', payload})
        });
    });
}

startAGMockServer();
startAGWithPrefixMockServer();

process.on('SIGTERM', () => {
    process.exit(0);
});
