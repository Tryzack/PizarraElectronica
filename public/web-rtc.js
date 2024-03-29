let peers = {}; // Use let instead of const to allow modification
let myPeer;
let isMuted = false;
const myAudio = document.createElement("audio");

// function to toggle the mute state of the audio
function toggleMute() {
	isMuted = !isMuted;
	myAudio.srcObject.getTracks().forEach((track) => {
		if (track.kind === "audio") track.enabled = !isMuted;
	});
	socket.emit("mute-status", myPeer.id, isMuted);
}

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
					addAudioStream(audio, userAudioStream, call.peer, call.metadata.name);
					peers[call.peer] = call;
				});
			});

			socket.on("user-connected", (userId, customName) => {
				console.log("user connected: " + userId + "\nName: " + customName);
				connectToNewUser(userId, stream, customName);
			});
		});

	socket.on("mute-status", (userId, isMuted) => {
		// mi gente, aqui se debe de hacer algo para mostrar que el usuario esta muteado
		// por ejemplo poner un icono de mute en su conexion, lo dejo a su imaginacion
		// para acceder al usuario que esta muteado pueden usar el id del usuario en peers
		// peers[userId].metadata.name es el nombre del usuario que esta muteado y el div que contiene
		// el audio del usuario tiene el id del usuario en userId asi que pueden acceder a el con document.getElementById(userId)
	});

	socket.on("user-disconnected", (userId) => {
		console.log("user disconnected: " + userId);
		if (document.getElementById(userId)) document.getElementById(userId).remove();
		if (peers[userId]) {
			peers[userId].close();
			delete peers[userId];
		}
	});

	myPeer.on("open", (id) => {
		socket.emit("join-room", ROOM_ID, id, myPeer.customName);
	});

	function connectToNewUser(userId, stream, customName) {
		let received = false;
		function call() {
			const call = myPeer.call(userId, stream, { metadata: { name: myPeer.customName } });
			const audio = document.createElement("audio");
			call.on("stream", (userAudioStream) => {
				addAudioStream(audio, userAudioStream, userId, customName);
				received = true;
			});
			call.on("close", () => {
				audio.remove();
			});
			peers[userId] = call;
		}

		call();
		setTimeout(() => {
			if (!received) {
				call();
			}
		}, 500);
	}

	function addAudioStream(audio, stream, id, name) {
		const div = document.createElement("div");
		div.id = id;
		div.className = "audioUser";
		div.innerHTML = name ? name : myPeer.customName;
		audio.srcObject = stream;
		audio.addEventListener("loadedmetadata", () => {
			audio.play();
		});
		div.append(audio);
		conectionsGrid.append(div);
	}

	myPeer.on("error", (error) => {
		console.error("Peer error:", error);
	});
}
