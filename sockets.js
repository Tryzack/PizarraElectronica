module.exports = (io) => {
	let line_history = {};

	io.on("connection", (socket) => {
		/* 		socket.on("draw_line", (data) => {
			line_history.push({ line: data.line, color: data.color, width: data.size });
			io.emit("draw_line", { line: data.line, color: data.color, width: data.size });
		});

		socket.on("clear_canvas", () => {
			line_history = [];
			io.emit("clear_canvas");
		}); */

		socket.on("join-room", (roomId, userId, customName) => {
			for (let i in line_history[roomId]) {
				socket.emit("draw_line", {
					line: line_history[roomId][i].line,
					color: line_history[roomId][i].color,
					width: line_history[roomId][i].width,
				});
			}

			socket.join(roomId);
			socket.to(roomId).emit("user-connected", userId, customName);

			socket.on("draw_line", (data) => {
				if (!line_history[roomId]) {
					line_history[roomId] = [];
				}
				line_history[roomId].push({ line: data.line, color: data.color, width: data.size });
				io.to(roomId).emit("draw_line", { line: data.line, color: data.color, width: data.size });
			});

			socket.on("clear_canvas", () => {
				line_history[roomId] = [];
				io.to(roomId).emit("clear_canvas");
			});

			socket.on("disconnect", () => {
				socket.to(roomId).emit("user-disconnected", userId);
			});
		});
	});
};
