function display_error(data) {
  if (data.errors != undefined) {
    let erreur_s = document.getElementById("erreurs");
    erreur_s.textContent = data.errors[0].message
  } else {
    document.getElementById('exampleInputEmail1').value = ""
    document.getElementById('exampleInputEmail2').value = ""
    document.getElementById('inputtoken').value = ""
    document.getElementById("erreurs").textContent = ""
    get_app_list()

  }
}




ipc.on("add_app_error", (event, data) => {
  console.log(data);
  display_error(data)
})

function validate_app_info() {
  let name = document.getElementById('exampleInputEmail1').value.trim();

  let consumer_key = document.getElementById('exampleInputEmail2').value.trim();
  let consumer_secret = document.getElementById('inputtoken').value.trim();
  let callback = document.getElementById("input-callback").value.trim();
  console.log("send");
  ipc.send("add_new_app", [name, {
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    callback: callback
  }])
}

var add_app_btn = document.getElementById("btn_add_new_app")
add_app_btn.addEventListener("click", (event) => {
  validate_app_info()
})
