const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const port = 4000;

app.set("view engine", "ejs");
app.use(express.static("public"));

// sockets
require("./sockets")(io);

app.get("/", (req, res) => {
	res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
	res.render("index", { roomId: req.params.room });
});

server.listen(port, () => {
	console.log("Server is running on port " + port);
});
