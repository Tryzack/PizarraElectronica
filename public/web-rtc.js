let peers = {};
let myPeer;
let isMuted = false;
const myAudio = document.createElement("audio");

function toggleMute() {
	isMuted = !isMuted;
	myAudio.srcObject.getTracks().forEach((track) => {
		if (track.kind === "audio") track.enabled = !isMuted;
	});
	socket.emit("mute-status", myPeer.id, isMuted);

	const circle = document.getElementById(myPeer.id);
	if (circle) {
		const div2 = circle.querySelector(".circle");
		if (div2) {
			div2.style.backgroundColor = isMuted ? "red" : "#55D55A";
		}
	}
}

document.getElementById("mute-button").addEventListener("click", toggleMute);

function webrtc() {
	const conectionsGrid = document.getElementById("connected-users-list");
	myPeer = new Peer(undefined, {
		host: "/",
		port: "8182",
	});

	myPeer.customName = name;

	myAudio.muted = true;

	navigator.mediaDevices
		.getUserMedia({
			audio: true,
		})
		.then((stream) => {
			addAudioStream(myAudio, stream, myPeer.id, myPeer.customName);

			myPeer.on("call", (call) => {
				call.answer(stream);
				const audio = document.createElement("audio");
				call.on("stream", (userAudioStream) => {
					addAudioStream(
						audio,
						userAudioStream,
						call.peer,
						call.metadata.name,
					);
					peers[call.peer] = call;
				});
			});

			socket.on("user-connected", (userId, customName) => {
				const joinmp3 = new Audio("/assets/join.mp3");
				joinmp3.oncanplaythrough = () => {
					joinmp3.play();
					joinmp3.onended = () => {
						joinmp3.remove();
					};
				};

				connectToNewUser(userId, stream, customName);
			});
		});

	socket.on("mute-status", (userId, isMuted) => {
		const circle = document.getElementById(userId);
		if (circle) {
			const div2 = circle.querySelector(".circle");
			if (div2) {
				div2.style.backgroundColor = isMuted ? "red" : "#55D55A";
			}
		}
	});

	socket.on("user-disconnected", (userId) => {
		const leavemp3 = new Audio("/assets/leave.mp3");
		leavemp3.oncanplaythrough = () => {
			leavemp3.play();
			leavemp3.onended = () => {
				leavemp3.remove();
			};
		};

		if (document.getElementById(userId))
			document.getElementById(userId).remove();
		if (peers[userId]) {
			peers[userId].close();
			delete peers[userId];
		}
	});

	myPeer.on("open", (id) => {
		socket.emit("join-room", ROOM_ID, id, myPeer.customName);
		const joinmp3 = new Audio("/assets/join.mp3");
		joinmp3.oncanplaythrough = () => {
			joinmp3.play();
			joinmp3.onended = () => {
				joinmp3.remove();
			};
		};
	});

	function connectToNewUser(userId, stream, customName) {
		let received = false;
		function thisCall() {
			const call = myPeer.call(userId, stream, {
				metadata: { name: myPeer.customName },
			});
			const audio = document.createElement("audio");
			call.on("stream", (userAudioStream) => {
				addAudioStream(audio, userAudioStream, userId, customName);
				received = true;
			});
			call.on("close", () => {
				audio.remove();
			});
			peers[userId] = call;
			setTimeout(() => {
				if (!received) {
					thisCall();
				}
			}, 500);
		}

		thisCall();
	}

	function addAudioStream(audio, stream, id, name) {
		const div = document.createElement("div");
		const p = document.createElement("p");
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const div2 = document.createElement("div");
		div2.className = "circle";
		div2.style.width = "10px";
		div2.style.height = "10px";
		div2.style.backgroundColor = "#55D55A";
		div2.style.borderRadius = "100%";
		div.id = id;
		div.className = "audioUser";
		p.innerHTML = name ? name : myPeer.customName;
		p.style.flexBasis = "70%";
		p.style.width = "100%";
		svg.setAttribute("width", "30");
		svg.setAttribute("height", "30");
		svg.setAttribute("viewBox", "0 0 30 30");
		svg.setAttribute("fill", "none");
		svg.style.flexBasis = "10%";
		svg.innerHTML = `
		<path d="M15 16.25C18.4518 16.25 21.25 13.4518 21.25 10C21.25 6.54822 18.4518 3.75 15 3.75C11.5482 3.75 8.75 6.54822 8.75 10C8.75 13.4518 11.5482 16.25 15 16.25Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M25 26.25C25 23.5978 23.9464 21.0543 22.0711 19.1789C20.1957 17.3036 17.6522 16.25 15 16.25C12.3478 16.25 9.8043 17.3036 7.92893 19.1789C6.05357 21.0543 5 23.5978 5 26.25" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		`;
		svg.style.flexBasis = "10%";
		audio.srcObject = stream;
		audio.addEventListener("loadedmetadata", () => {
			audio.play();
		});
		div.append(svg);
		div.append(p);
		div.append(div2);
		div.append(audio);
		conectionsGrid.append(div);
	}

	myPeer.on("error", (error) => {
		console.error("Peer error:", error);
	});
}

function getCurrentTime() {
	const currentTime = new Date();
	let hours = currentTime.getHours();
	let minutes = currentTime.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	const formattedTime = hours + ":" + minutes + " " + ampm;
	return formattedTime;
}

document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("message-input").addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		sendMessage();
	}
});

function sendMessage() {
	const messageInput = document.getElementById("message-input");
	const message = messageInput.value.trim();
	if (message !== "") {
		const currentTime = getCurrentTime();
		socket.emit("send_message", {
			name: myPeer.customName,
			message,
			time: currentTime,
		});
		messageInput.value = "";
		appendMessage(myPeer.customName, message, currentTime);
	}
}

socket.on("receive_message", ({ name, message, time }) => {
	const userName = name ? name : userId;
	if (userName !== myPeer.customName) {
		const messagemp3 = new Audio("/assets/message.mp3");
		messagemp3.volume = 0.3;
		messagemp3.oncanplaythrough = () => {
			messagemp3.play();
			messagemp3.onended = () => {
				messagemp3.remove();
			};
		};
		appendMessage(userName, message, time);
	}
});

function appendMessage(userName, message, time) {
	const messagesContainer = document.getElementById("messages-container");
	const messageElement = document.createElement("div");
	messageElement.classList.add("message");
	messageElement.style.margin = "20px";

	const timeContainer = document.createElement("div");
	timeContainer.classList.add("time-container");
	timeContainer.innerText = time;

	messageElement.innerHTML = `<strong>${userName}</strong><p style="word-wrap: break-word; overflow-wrap: break-word; max-width: 32vh;">${message}</p>`;
	messageElement.appendChild(timeContainer);

	messageElement.style.position = "relative";
	timeContainer.style.position = "absolute";
	timeContainer.style.right = "0";
	timeContainer.style.top = "110%";
	timeContainer.style.color = "#999999";

	messagesContainer.appendChild(messageElement);
}
