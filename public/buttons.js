document.getElementById("selectColor").addEventListener("click", () => {
	let element = document.getElementById("buttons-wrapper");
	if (element.style.display === "none") {
		element.style.display = "grid";
	} else {
		element.style.display = "none";
	}
});

//for each color inside document.getElementsById("color-container") add an event listener to get its backgroundColor
document
	.getElementById("buttons-container")
	.querySelectorAll("button")
	.forEach((button) => {
		if (button.id === "clear-button") return;
		button.addEventListener("click", () => {
			color = button.style.backgroundColor;
			document.getElementById("selected-color").style.backgroundColor =
				color;
			document.getElementById("buttons-wrapper").style.display = "none";
			if (mouse.color !== eraser) {
				mouse.color = color;
			}
		});
	});

document.getElementById("clear-button").addEventListener("click", () => {
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	socket.emit("clear_canvas");
	document.getElementById("buttons-wrapper").style.display = "none";
});

document.getElementById("pencil").addEventListener("click", () => {
	line_width = 2;
	mouse.color = color;
	document.getElementById("selected-color").style.backgroundColor =
		mouse.color;
	document.getElementById("buttons-wrapper").style.display = "none";
});

document.getElementById("eraser").addEventListener("click", () => {
	mouse.color = eraser;
	line_width = 20;
	document.getElementById("selected-color").style.backgroundColor =
		mouse.color;
	document.getElementById("buttons-wrapper").style.display = "none";
});

socket.on("clear_canvas", () => {
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);
});

//show modal that ask for the name of the user and wont let the user draw until the name is set

let modal = document.createElement("modal");
modal.id = "modal";
let modalContent = document.createElement("div");
modalContent.id = "modal-content";
let modalInput = document.createElement("input");
let modalButton = document.createElement("button");
let h1 = document.createElement("h1");
h1.innerText = "Welcome to the whiteboard! Please enter your name";
modalInput.setAttribute("type", "text");
modalInput.setAttribute("placeholder", "Enter your name");
modalButton.innerText = "Submit";

modalButton.addEventListener("click", () => {
	if (modalInput.value) {
		modal.style.display = "none";
		name = modalInput.value;
		webrtc();
	}
});

let isTyping = false;
let textButton = document.getElementById("text");

// Evento de clic para activar la inserción de texto
textButton.addEventListener("click", function () {
	isTyping = true;
});

canvas.addEventListener("click", handleCanvasClick);
canvas.addEventListener("keypress", handleKeyPress);

function handleCanvasClick(event) {
	if (isTyping) {
		line_width = 0;
		let rect = canvas.getBoundingClientRect();
		let scaleX = canvas.width / rect.width;
		let scaleY = canvas.height / rect.height;
		let mouseX = (event.clientX - rect.left) * scaleX;
		let mouseY = (event.clientY - rect.top) * scaleY;

		let inputText = prompt("Enter the text:");
		if (inputText) {
			context.font = "30px Arial";
			context.fillStyle = color;
			let textWidth = context.measureText(inputText).width;
			let textHeight = 30;

			let textX = mouseX - textWidth / 2;
			let textY = mouseY - textHeight / 2;

			isTyping = false;
			socket.emit("draw_text", {
				text: inputText,
				x: textX / width,
				y: textY / height,
				color: color,
			});
			line_width = 2;
		}
	}
}

function handleKeyPress(event) {
	if (isTyping && event.key === "Enter") {
		event.preventDefault();
		isTyping = false;
	}
}

function saveCanvasAsImage() {
	let canvas = document.getElementById("drawing");
	let context = canvas.getContext("2d");
	let link = document.createElement("a");

	let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	let image = canvas.toDataURL("image/png");

	context.putImageData(imageData, 0, 0);

	link.href = image;
	link.download = "canvas_image.png";

	link.click();
}
document
	.getElementById("saveScreen")
	.addEventListener("click", saveCanvasAsImage);

modalContent.appendChild(h1);
modalContent.appendChild(modalInput);
modalContent.appendChild(modalButton);
modal.appendChild(modalContent);
document.body.appendChild(modal);
