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
			document.getElementById("selected-color").style.backgroundColor = color;
			document.getElementById("buttons-wrapper").style.display = "none";
			if (mouse.color !== eraser) {
				mouse.color = color;
			}
		});
	});

document.getElementById("clear-button").addEventListener("click", () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
	socket.emit("clear_canvas");
	document.getElementById("buttons-wrapper").style.display = "none";
});

document.getElementById("pencil").addEventListener("click", () => {
	line_width = 2;
	mouse.color = color;
	document.getElementById("selected-color").style.backgroundColor = mouse.color;
	document.getElementById("buttons-wrapper").style.display = "none";
});

document.getElementById("eraser").addEventListener("click", () => {
	mouse.color = eraser;
	line_width = 20;
	document.getElementById("selected-color").style.backgroundColor = mouse.color;
	document.getElementById("buttons-wrapper").style.display = "none";
});

socket.on("clear_canvas", () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
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



modalContent.appendChild(h1);
modalContent.appendChild(modalInput);
modalContent.appendChild(modalButton);
modal.appendChild(modalContent);
document.body.appendChild(modal);
