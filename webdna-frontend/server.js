var express = require('express');
var favicon = require('serve-favicon');
var join = require('path').join;
var proxy = require('http-proxy-middleware');
var binaryjs = require('binaryjs');
var fs = require('fs');
var cors = require('cors');
require('dotenv').config();

//eval(fs.readFileSync('htmol/local/config.js') + '');

var port = process.env.PORT || 8080;

var app = express();
var distDir = __dirname + "/dist/";
app.use(cors());
app.use(express.static(join(distDir)));
app.use(favicon(__dirname + "/src/favicon.ico"));

app.use('/simfiles', express.static(join(__dirname, process.env.SIMULATION_DIR)));
app.use('/static', express.static(join(__dirname, 'oxvis')));
app.use('/api', proxy('http://' + process.env.LAN_IP + ':8000/api'));

var server = app.listen(port, process.env.LAN_IP, () => {
    var server_port = server.address().port;
    console.log("App now running on port " + server_port);
});

var binaryServer = binaryjs.BinaryServer({
    server: server
});

binaryServer.on('connection', client => {
    client.on('stream', (stream, meta) => {
        if (meta.reqsize == true) {
            var path = join(__dirname, process.env.SIMULATION_DIR, meta.fpath);
            fs.exists(path, function (exists) {
                if (exists) {
                    var stats = fs.statSync(path);
                    var fileSizeInBytes = stats["size"];
                    client.send("size" + fileSizeInBytes);
                } else {
                    client.send('error');
                }
            });
        } else {
            var path = join(__dirname, process.env.SIMULATION_DIR, meta.fpath)
            fs.exists(path, function (exists) {
                if (exists) {
                    if (meta.verif == true) {
                        var file = fs.createReadStream(path, {
                            start: 4,
                            end: 7
                        });
                        client.send(file, {
                            natoms: true
                        });
                    } else {
                        var file = fs.createReadStream(path, {
                            start: meta.start,
                            end: meta.end
                        });

                        client.send(file, {
                            natoms: false
                        });
                    }
                } else {
                    client.send('error');
                }
            });
        }
    });
});
