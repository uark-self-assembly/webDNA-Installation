var fs = require('fs');
eval(fs.readFileSync('local/config.js') + ''); // this line reads the HTMoL configuration file, needed to know server port and location of trajectory files
var http = require('http');
var express = require('express');
var app = express();
// Serve client side statically
app.use(express.static(__dirname));

var server = http.createServer(app);

// Start Binary.js server
var BinaryServer = require('binaryjs').BinaryServer;
var bs = BinaryServer({
	server: server
});

// Wait for new user connections
bs.on('connection', function (client) {
	client.on('stream', function (stream, meta) {

		if (meta.reqsize == true) {
			var path = TRJDIR + meta.fpath;
			fs.exists(path, function (exists) {
				if (exists) {
					console.log("HTMoL3: " + path);
					var stats = fs.statSync(path);
					var fileSizeInBytes = stats["size"];
					console.log("HTMoL3: " + fileSizeInBytes);
					client.send("size" + fileSizeInBytes);
				} else {
					client.send('error');
				}
			});
		} else {
			var path = TRJDIR + meta.fpath;
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
						//file._readableState.highWaterMark=100536;
						console.log("HTMoL3: " + file._readableState.highWaterMark);
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

server.listen(WebPort);
console.log("HTMoLv3.5: BinServer started on port " + WebPort);