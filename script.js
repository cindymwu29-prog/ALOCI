/* =====================================================
      ALOCI — SUPER SCRIPT.JS (FULL SOCIAL SYSTEM)
===================================================== */

/* ------------------------------
   UTILITY: LOAD / SAVE
------------------------------ */
function load(key, fallback) {
  return JSON.parse(localStorage.getItem(key)) || fallback;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ------------------------------
   USERS SYSTEM
------------------------------ */
function signup() {
  const users = load("users", {});

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !username || !password) {
    alert("Please fill all fields.");
    return;
  }

  if (users[username]) {
    alert("Username already exists.");
    return;
  }

  users[username] = {
    name,
    email,
    password,
    bio: "",
    favorites: [],
    posts: 0,
    likesReceived: 0
  };

  save("users", users);
  alert("Account created!");
  window.location.href = "signin.html";
}

function login() {
  const users = load("users", {});
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (users[username] && users[username].password === password) {
    save("loggedUser", username);
    alert("Welcome " + users[username].name);
    window.location.href = "index.html";
  } else {
    alert("Incorrect username or password.");
  }
}

/* ------------------------------
   NAVBAR LOGIN / LOGOUT
------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const logged = localStorage.getItem("loggedUser");
  const signinLink = document.getElementById("signinLink");
  const logoutLink = document.getElementById("logoutLink");

  if (logged) {
    signinLink.style.display = "none";
    logoutLink.style.display = "inline-block";

    logoutLink.onclick = () => {
      localStorage.removeItem("loggedUser");
      window.location.reload();
    };
  }
});

/* =====================================================
      POST DATABASE
===================================================== */
function loadPosts() {
  return load("postsDB", []);
}

function savePosts(posts) {
  save("postsDB", posts);
}

/* =====================================================
      RENDER POSTS
===================================================== */
function renderPost(post) {
  const feed = document.getElementById("postFeed");
  if (!feed) return;

  const div = document.createElement("div");
  div.classList.add("post");

  /* Convert hashtags */
  const formattedText = post.text.replace(/#\w+/g, tag => {
    return `<a href="search.html?tag=${tag.substring(1)}" class="hashtag">${tag}</a>`;
  });

  /* HTML STRUCTURE */
  div.innerHTML = `
    <p><strong>@${post.user}</strong> • <small>${post.time}</small></p>
    <p>${formattedText}</p>
    ${post.image ? `<img src="${post.image}">` : ""}

    <div class="actions">
      <button class="like-btn">❤️ ${post.likes}</button>
      <button class="comment-btn">💬 Comment</button>
      <button class="edit-btn">✏️ Edit</button>
      <button class="delete-btn">🗑️ Delete</button>
      <button class="save-btn">⭐ Save</button>
    </div>

    <div class="comments"></div>

    <div class="comment-box" style="display:none;">
      <input type="text" placeholder="Write a comment...">
      <button class="send-comment">Send</button>
    </div>
  `;

  setupPostButtons(div, post);
  feed.prepend(div);
}

/* =====================================================
      POST BUTTON LOGIC
===================================================== */
function setupPostButtons(div, post) {
  const likeBtn = div.querySelector(".like-btn");
  const commentBtn = div.querySelector(".comment-btn");
  const deleteBtn = div.querySelector(".delete-btn");
  const editBtn = div.querySelector(".edit-btn");
  const saveBtn = div.querySelector(".save-btn");

  const commentBox = div.querySelector(".comment-box");
  const commentList = div.querySelector(".comments");
  const users = load("users", {});
  const logged = localStorage.getItem("loggedUser");

  /* LIKE BUTTON */
  likeBtn.onclick = () => {
    post.likes++;
    likeBtn.textContent = `❤️ ${post.likes}`;

    users[post.user].likesReceived++;
    save("users", users);

    const posts = loadPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    posts[idx] = post;
    savePosts(posts);
  };

  /* COMMENT BUTTON */
  commentBtn.onclick = () => {
    commentBox.style.display =
      commentBox.style.display === "none" ? "block" : "none";
  };

  /* SEND COMMENT */
  const sendBtn = div.querySelector(".send-comment");
  const input = div.querySelector(".comment-box input");

  sendBtn.onclick = () => {
    if (!input.value.trim()) return;

    const comment = {
      user: logged || "Anonymous",
      text: input.value.trim()
    };

    post.comments.push(comment);

    const p = document.createElement("p");
    p.innerHTML = `<strong>@${comment.user}:</strong> ${comment.text}`;
    commentList.appendChild(p);

    const posts = loadPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    posts[idx] = post;
    savePosts(posts);

    input.value = "";
  };

  /* DELETE POST (only author) */
  deleteBtn.onclick = () => {
    if (logged !== post.user) {
      alert("You can only delete your own posts.");
      return;
    }

    let posts = loadPosts();
    posts = posts.filter(p => p.id !== post.id);
    savePosts(posts);

    div.remove();
  };

  /* SAVE POST */
  saveBtn.onclick = () => {
    if (!logged) {
      alert("Login to save posts.");
      return;
    }

    const users = load("users", {});
    const favs = users[logged].favorites;

    if (!favs.includes(post.id)) favs.push(post.id);

    save("users", users);
    alert("Saved!");
  };

  /* EDIT POST */
  editBtn.onclick = () => {
    if (logged !== post.user) {
      alert("You can only edit your own posts.");
      return;
    }

    const newText = prompt("Edit your post:", post.text);
    if (!newText) return;

    post.text = newText;

    const posts = loadPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    posts[idx] = post;
    savePosts(posts);

    location.reload();
  };

  /* LOAD COMMENTS */
  post.comments.forEach(c => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>@${c.user}:</strong> ${c.text}`;
    commentList.appendChild(p);
  });
}

/* =====================================================
      CREATE POST
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("postBtn");
  const input = document.getElementById("postInput");
  const imgInput = document.getElementById("postImage");
  const preview = document.getElementById("imagePreview");

  if (!btn) return;

  if (imgInput) {
    imgInput.onchange = () => {
      const file = imgInput.files[0];
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    };
  }

  btn.onclick = () => {
    const text = input.value.trim();
    const image = preview?.src || "";
    if (!text && !image) {
      alert("Write something first.");
      return;
    }

    const user = localStorage.getItem("loggedUser") || "Anonymous";
    const users = load("users", {});

    if (users[user]) users[user].posts++;

    save("users", users);

    const post = {
      id: Date.now(),
      user,
      text,
      image: image.includes("blob:") ? image : "",
      likes: 0,
      comments: [],
      time: new Date().toLocaleString()
    };

    const posts = loadPosts();
    posts.push(post);
    savePosts(posts);

    renderPost(post);

    input.value = "";
    preview.style.display = "none";
  };
});

/* =====================================================
      LOAD POSTS ON PAGE OPEN
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("postFeed");
  if (!feed) return;

  const posts = loadPosts();
  posts.reverse().forEach(post => renderPost(post));
});


