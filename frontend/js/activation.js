const ipc = require("electron").ipcRenderer;

// LOGIN
function handle_login() {
  let erreur_text = document.getElementById("erreurs");
  let data = {
    username: document.getElementById("username").value,
    password: document.getElementById("username").value,
  };
  erreur_text.innerHTML = "Wait";
  ipc.send("login", data);
}

ipc.on("login_response", function (event, data) {
  console.log(data);
  let erreur_text = document.getElementById("erreurs");
  erreur_text.innerHTML = data;
});

var btn_valider_key = document.getElementById("btn_valider_key");
btn_valider_key.addEventListener("click", handle_login);

// RESET PWD
function handle_reset_pwd() {
  let erreur_text = document.getElementById("erreurs");
  erreur_text.innerHTML = "";
  let data = {
    username: document.getElementById("username").value,
  };
  if (!data.username) {
    erreur_text.innerHTML = "Provide Username to reset pwd.";
  }
  erreur_text.innerHTML = "Wait";
  ipc.send("reset_pwd", data);
}

ipc.on("reset_pwd_response", function (event, data) {
  console.log(data);
  let erreur_text = document.getElementById("erreurs");
  erreur_text.innerHTML = data;
});

var btn_valider_key = document.getElementById("btn_reset_pwd");
btn_valider_key.addEventListener("click", handle_reset_pwd);
