
let viewModel = {};

viewModel.userName = null;
viewModel.userId = null;
viewModel.users = [];
viewModel.messages = [];

function Message(userId, text, timestamp) {
    this.userId = userId;
    this.text = text;
    this.timestamp = timestamp;
}

function renderMessage(message) {
    let msgContainer = document.createElement("div");

    msgContainer.classList.add("messageContainer");
    
    let upperDiv = document.createElement("div");
    let lowerDiv = document.createElement("div");

    let nameSpan = document.createElement("span");
    nameSpan.classList.add("messageName");

    let timestampSpan = document.createElement("span");

    upperDiv.appendChild(nameSpan);
    upperDiv.appendChild(timestampSpan);

    nameSpan.innerText = viewModel.users
        .filter(u => u.id == message.userId)
        .map(u => u.email);

    timestampSpan.innerText = " " + moment(message.timestamp).format("DD.MM hh:mm A");

    lowerDiv.innerText = message.text;

    msgContainer.appendChild(upperDiv);
    msgContainer.appendChild(lowerDiv);

    document.getElementById("messages").appendChild(msgContainer);
}

function renderUser(user) {
    let userItem = document.createElement("li");
    userItem.innerText = user.email;

    document.getElementById("userList").appendChild(userItem);
}

function addMessage() {
    let userId = viewModel.userId;
    let timestamp = moment.utc().valueOf();
    let inputText = document.getElementById("inputText");
    let text = inputText.value;

    let message = new Message(userId, text, timestamp);

    getCollection("messages").add(JSON.parse(JSON.stringify(message)))
        .then(function(docRef) {
            message.id = docRef.id;
        })
        .catch(function(error) {
            console.log(error);
            return error;
        });

    //renderMessage(message);

    inputText.value = "";
}

function setupEventListeners() {
    document.getElementById("inputButton").addEventListener("click", addMessage);
    document.getElementById("inputText").addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            addMessage();
        }
    });
}

function getDb() {
    let db = firebase.firestore();
    const settings = {/* your settings... */ timestampsInSnapshots: true};
    db.settings(settings);
    return db;
}

function getCollection(name) {
    return getDb().collection(name);
}

function setCurrentUser(user) {
    viewModel.userName = user.email;
    viewModel.userId = user.uid;
    document.getElementById("profileUserName").innerText = viewModel.userName;
}

function setUpSession() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let user = firebase.auth().currentUser;

            setCurrentUser(user);
            
            const usersColl = getCollection("users");

            const userDocRef = usersColl.doc(user.uid);
            userDocRef.get()
            .then(function(doc) {
                return userDocRef.set({
                    id: user.uid,
                    email: user.email,
                    status: 1
                });
            }).catch(function(error) {
                console.log(error);
                return error;    
            });
        } else {
            window.location = "/index.html";
        }
    });
}

function loadUsers() {
    const userQuery = getCollection("users");
    userQuery.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (!snapshot.size) {
                return;
            }
            
            if (change.type === 'added') {
                const user = change.doc.data();

                viewModel.users.push(user);

                renderUser(user);
            }
        });
    });
}

function loadMessages() {
    const postsQuery = getCollection("messages")
        .orderBy('timestamp', 'asc');

        postsQuery.onSnapshot(function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                if(!snapshot.size) {
                    return;
                }

                if (change.type === 'added') {
                    renderMessage(change.doc.data());
                }
            });
        });
}

function start() {
    setUpSession();
    setupEventListeners();
    loadUsers();
    loadMessages();
}

window.addEventListener("load", function() {
    start();
});