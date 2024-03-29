module.exports = (io) => {
	let line_history = [];

	io.on("connection", (socket) => {
		for (let i in line_history) {
			socket.emit("draw_line", { line: line_history[i].line, color: line_history[i].color, width: line_history[i].width });
		}

		socket.on("draw_line", (data) => {
			line_history.push({ line: data.line, color: data.color, width: data.size });
			io.emit("draw_line", { line: data.line, color: data.color, width: data.size });
		});

		socket.on("clear_canvas", () => {
			line_history = [];
			io.emit("clear_canvas");
		});

		socket.on("join-room", (roomId, userId) => {
			socket.join(roomId);
			socket.to(roomId).emit("user-connected", userId);

			socket.on("disconnect", () => {
				socket.to(roomId).emit("user-disconnected", userId);
			});
		});
	});
};
