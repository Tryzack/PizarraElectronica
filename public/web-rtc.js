function webrtc() {
	const conectionsGrid = document.getElementById("connected-users-container");
	const myPeer = new Peer(undefined, {
		host: "/",
		port: "8182",
	});

	let peers = {}; // Use let instead of const to allow modification

	const myAudio = document.createElement("audio");
	myAudio.muted = true;

	navigator.mediaDevices
		.getUserMedia({
			audio: true,
		})
		.then((stream) => {
			addAudioStream(myAudio, stream);

			myPeer.on("call", (call) => {
				console.log("call received from: " + call.peer);
				call.answer(stream);
				const audio = document.createElement("audio");
				call.on("stream", (userAudioStream) => {
					addAudioStream(audio, userAudioStream, call.peer);
					peers[call.peer] = call;
				});
			});

			socket.on("user-connected", (userId) => {
				console.log("user connected: " + userId);
				connectToNewUser(userId, stream);
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
		socket.emit("join-room", ROOM_ID, id);
	});

	function addAudioStream(audio, stream, id) {
		const div = document.createElement("div");
		div.id = id;
		div.className = "audioUser";
		div.innerHTML = id ? id : name;
		audio.srcObject = stream;
		audio.addEventListener("loadedmetadata", () => {
			audio.play();
		});
		div.append(audio);
		conectionsGrid.append(div);
	}

	function connectToNewUser(userId, stream) {
		let received = false;
		function call() {
			const call = myPeer.call(userId, stream);
			const audio = document.createElement("audio");
			call.on("stream", (userAudioStream) => {
				addAudioStream(audio, userAudioStream, userId);
				received = true;
			});
			call.on("close", () => {
				audio.remove();
			});
			peers[userId] = call;
		}

		call();
		setTimeout(() => {
			if (!received) call();
		}, 500);

		// If the call is not answered in 15 seconds, retry
	}

	myPeer.on("error", (error) => {
		console.error("Peer error:", error);
	});
}
