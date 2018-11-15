
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
    var post = new Post(text.value, "user-id", moment.utc().valueOf());

    renderPost(post);

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

function start(){
    document.getElementById("postButton").addEventListener("click", postButtonClick);
    document.getElementById("inputText").addEventListener("keyup", enterHit);
}

window.addEventListener("load", start);