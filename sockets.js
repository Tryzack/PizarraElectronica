module.exports = (io) => {
	let rooms = {};

	io.on("connection", (socket) => {
		socket.on("join-room", (roomId, userId, customName) => {
			if (!rooms[roomId]) {
				rooms[roomId] = { users: 1 };
			} else {
				rooms[roomId].users++;
				for (let i in rooms[roomId].line_history) {
					socket.emit("draw_line", {
						line: rooms[roomId].line_history[i].line,
						color: rooms[roomId].line_history[i].color,
						width: rooms[roomId].line_history[i].width,
					});
				}
				for (let i in rooms[roomId].text_history) {
					socket.emit("draw_text", {
						text: rooms[roomId].text_history[i].text,
						color: rooms[roomId].text_history[i].color,
						x: rooms[roomId].text_history[i].x,
						y: rooms[roomId].text_history[i].y,
					});
				}
			}

			socket.join(roomId);
			socket.to(roomId).emit("user-connected", userId, customName);

			socket.on("draw_line", (data) => {
				if (!rooms[roomId].line_history) {
					rooms[roomId].line_history = [];
				}
				rooms[roomId].line_history.push({
					line: data.line,
					color: data.color,
					width: data.size,
					userId: data.userId,
					userName: data.userName,
				});
				io.to(roomId).emit("draw_line", {
					line: data.line,
					color: data.color,
					width: data.size,
					userId: data.userId,
					userName: data.userName,
				});
			});

			socket.on("draw_text", (data) => {
				if (!rooms[roomId].text_history) {
					rooms[roomId].text_history = [];
				}
				rooms[roomId].text_history.push({
					text: data.text,
					color: data.color,
					x: data.x,
					y: data.y,
				});
				io.to(roomId).emit("draw_text", {
					text: data.text,
					color: data.color,
					x: data.x,
					y: data.y,
				});
			});

			socket.on("clear_canvas", () => {
				rooms[roomId].line_history = [];
				io.to(roomId).emit("clear_canvas");
			});

			socket.on("disconnect", () => {
				socket.to(roomId).emit("user-disconnected", userId);
				rooms[roomId].users--;
				if (rooms[roomId].users === 0) {
					delete rooms[roomId];
				}
			});

			socket.on("mute-status", (userId, isMuted) => {
				io.to(roomId).emit("mute-status", userId, isMuted);
			});
		});
	});
};
