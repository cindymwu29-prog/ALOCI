function sendMessage() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const contactMsg = document.getElementById("contactMsg");

  if (!name || !email || !message) {
    contactMsg.textContent = "Please fill in all fields.";
    return;
  }

  contactMsg.textContent = "Thank you! Your message has been sent.";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";
}
