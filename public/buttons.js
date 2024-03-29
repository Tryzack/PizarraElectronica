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


let draggableText = {
    text: "", 
    x: 50, 
    y: 50, 
    isDragging: false, 
    offsetX: 0, 
    offsetY: 0, 
    fontSize: 20, 
    fontFamily: "Arial" 
};

// Función para dibujar el texto en el canvas
function drawText() {
    let context = drawing.getContext('2d');
    context.clearRect(0, 0, drawing.width, drawing.height); 
    context.font = `${draggableText.fontSize}px ${draggableText.fontFamily}`; 
    context.fillText(draggableText.text, draggableText.x, draggableText.y); 
}

// Función para detener el arrastre del texto
function stopDragging() {
    draggableText.isDragging = false;
    drawing.classList.remove('dragging'); 
    drawing.removeEventListener('mousemove', dragText); 
    drawing.removeEventListener('mouseup', stopDragging); 
    updateCursor(); // Actualizar el cursor
}

// Función para iniciar el arrastre del texto
function startDragging(event) {
    let rect = drawing.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    // Verificar si se hizo clic en el texto
    if (isClickedOnText(mouseX, mouseY)) {
        draggableText.isDragging = true; 
        draggableText.offsetX = mouseX - draggableText.x;
        draggableText.offsetY = mouseY - draggableText.y;
        drawing.addEventListener('mousemove', dragText); 
        drawing.addEventListener('mouseup', stopDragging); 
        drawing.classList.add('dragging'); 
        updateCursor(); 
    }
}

// Función para arrastrar el texto
function dragText(event) {
    let rect = drawing.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    // Actualizar la posición del texto arrastrable
    draggableText.x = mouseX - draggableText.offsetX;
    draggableText.y = mouseY - draggableText.offsetY;

    // Volver a dibujar el canvas para actualizar la posición del texto
    drawText();
}

// Función para verificar si se hizo clic en el texto
function isClickedOnText(mouseX, mouseY) {
    let context = drawing.getContext('2d');
    context.font = `${draggableText.fontSize}px ${draggableText.fontFamily}`;
    let textWidth = context.measureText(draggableText.text).width;
    let textHeight = draggableText.fontSize; 
    return mouseX >= draggableText.x && mouseX <= draggableText.x + textWidth &&
        mouseY >= draggableText.y - textHeight && mouseY <= draggableText.y;
}

// Evento de clic para agregar texto al canvas
document.getElementById('text').addEventListener('click', function() {
    let input = prompt("Ingrese el texto:");
    if (input !== null) {
        draggableText.text = input;
        drawText();
    }
});

// Evento de clic para iniciar el arrastre del texto
drawing.addEventListener('mousedown', startDragging);

// Dibujar el texto inicial
drawText();

modalContent.appendChild(h1);
modalContent.appendChild(modalInput);
modalContent.appendChild(modalButton);
modal.appendChild(modalContent);
document.body.appendChild(modal);
