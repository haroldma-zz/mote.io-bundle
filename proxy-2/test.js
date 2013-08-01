var options = {
    ....
};

var server = httpProxy.createServer(
    callback/middleware,
    options
);

server.listen(port, function () { ... });
server.on('upgrade', function (req, socket, head) {
    server.proxy.proxyWebSocketRequest(req, socket, head);
});
