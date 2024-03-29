let peers = {}; // Use let instead of const to allow modification
let myPeer;

function webrtc() {
	const conectionsGrid = document.getElementById("connected-users-container");
	myPeer = new Peer(undefined, {
		host: "/",
		port: "8182",
	});

	myPeer.customName = name;

	const myAudio = document.createElement("audio");
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

	myPeer.on("error", (error) => {
		console.error("Peer error:", error);
	});
}
