var clef_affichage = document.getElementById("clef_affichage")

var key_x = ""

ipc.on("all_settings", (event, data) => {
  clef_affichage.textContent = data.key
  key_x = data.key

})



function close() {
  ipc.send("close_app", "")
}

ipc.send("get_settings")
var btn_delete_key = document.getElementById("btn_delete_key")
btn_delete_key.addEventListener("click", (event) => {
  event.preventDefault();
  ipc.send("remove_key")
  setTimeout(() => {
    ipc.send("get_settings");
  }, 500)
  setTimeout(close, 120000)
  console.log("ok");

})

//F3EAAF-305D05-46DF85-F6B15B-364D91-8F9C97