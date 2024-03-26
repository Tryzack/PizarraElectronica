module.exports = (io) => {
	let line_history = [];

	io.on("connection", (socket) => {
		for (let i in line_history) {
			socket.emit("draw_line", { line: line_history[i].line, color: line_history[i].color });
		}

		socket.on("draw_line", (data) => {
			line_history.push({ line: data.line, color: data.color });
			io.emit("draw_line", { line: data.line, color: data.color });
		});

		socket.on("clear_canvas", () => {
			line_history = [];
			io.emit("clear_canvas");
		});
	});
};
