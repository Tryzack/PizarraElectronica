let name = "";

let mouse = {
	click: false,
	move: false,
	pos: { x: 0, y: 0 },
	pos_prev: false,
	color: "black",
};

let canvas = document.getElementById("drawing");
let context = canvas.getContext("2d");
let width = window.innerWidth;
let height = window.innerHeight;
let color = mouse.color;
let eraser = "#ffffff";
let line_width = 2;

let socket = io();

canvas.width = width;
canvas.height = height;

canvas.addEventListener("mousedown", (e) => {
	mouse.click = true;
});

document.body.addEventListener("mouseup", (e) => {
	mouse.click = false;
});

canvas.addEventListener("mousemove", (e) => {
	const rect = canvas.getBoundingClientRect();
	mouse.pos.x = (e.clientX - rect.left) / (rect.right - rect.left);
	mouse.pos.y = (e.clientY - rect.top) / (rect.bottom - rect.top);
	mouse.move = true;
});

socket.on("draw_line", (data) => {
	let line = data.line;
	context.beginPath();
	context.lineWidth = data.width;
	context.strokeStyle = data.color;
	context.moveTo(line[0].x * width, line[0].y * height);
	context.lineTo(line[1].x * width, line[1].y * height);
	context.stroke();
	console.log(document.getElementById(data.userId));
});

function mainLoop() {
	if (mouse.click && mouse.move && mouse.pos_prev) {
		socket.emit("draw_line", { line: [mouse.pos, mouse.pos_prev], color: mouse.color, size: line_width, userId: myPeer.id });
		console.log(myPeer.id);
		mouse.move = false;
	}
	mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
	setTimeout(mainLoop, 25);
}

mainLoop();
