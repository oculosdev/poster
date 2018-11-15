

var viewModel = {
};

function Post(text, userId, timestamp) {
    this.text = text;
    this.userId = userId;
    this.timestamp = timestamp;
}

function renderPost(post) {
    var dialogPanel = document.getElementById("dialogPanel");

    var postDiv = document.createElement("div");
    postDiv.classList.add("post");

    var topDiv = document.createElement("div");

    var userDiv = document.createElement("div");
    var timeDiv = document.createElement("div");
    var textDiv = document.createElement("div");

    postDiv.appendChild(topDiv);
    topDiv.appendChild(userDiv);
    topDiv.appendChild(timeDiv);
    postDiv.appendChild(textDiv);

    userDiv.innerText = post.userId;
    timeDiv.innerText = post.timestamp;
    textDiv.innerText = post.text;
    
    document.getElementById("dialogPanel").appendChild(postDiv);
}

function createPost() {
    var text = document.getElementById("inputText");
    var post = new Post(text.value, viewModel.userId, moment.utc().valueOf());

    getCollection("messages")
        .add(JSON.parse(JSON.stringify(post)))
        .then(function(docRef) {
            post.id = docRef.id;
            //renderPost(post);
        })
        .catch(function(error) {
            console.log(error);
            return error;
        });

    text.value = "";
}

function postButtonClick() {
    createPost();
}

function enterHit(event) {
    if(event.keyCode === 13) {
        createPost();
    }
}

function setCurrentUser(user) {
    viewModel.userId = user.uid;
    viewModel.userName = user.email;

    document.getElementById("userName").innerText = user.email;
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


function loadMessages() {
    const postsQuery = getCollection("messages")
        .orderBy('timestamp', 'asc');

        postsQuery.onSnapshot(function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                if(!snapshot.size) {
                    return;
                }

                if (change.type === 'added') {
                    renderPost(change.doc.data());
                }
            });
        });
}

function start(){
    document.getElementById("postButton").addEventListener("click", postButtonClick);
    document.getElementById("inputText").addEventListener("keyup", enterHit);

    setUpSession();
    loadMessages();
}

window.addEventListener("load", start);