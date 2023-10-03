var last = Math.floor(Date.now() / 1000);

var last = 0;
console.log(last);

function add_account() {
  console.log(last);
  var now = Math.floor(Date.now() / 1000);
  if (now - last < 20) {
    $("#erreurs").text("Please wait 20 seconds");
    console.log("not");
    return 0;
  }
  last = now;
  console.log("send something");
  ipc.send("add_account", {
    proxyhost: $("#proxyhost").val().trim().startsWith("http://")
      ? $("#proxyhost").val().trim()
      : `http://${$("#proxyhost").val().trim()}`,
    proxy_username: $("#proxyauth").val().trim().split(":")[0],
    proxy_password: $("#proxyauth").val().trim().split(":")[1] || "",
    username: $("#twitter_username").val().trim(),
    password: $("#twitter_password").val().trim(),
  });
  $("#erreurs").text("Wait");
}

ipc.on("new_user_state", (event, data) => {
  $("#erreurs").text(data.message);
  console.log(data);

  if (data.type == "success") {
    console.log("should clean");
    $("#proxyhost").val("");
    $("#proxyauth").val("");
    $("#proxyauth").val("");
    $("#twitter_username").val("");
    $("#twitter_password").val("");
    ipc.send("get_bot_list", "");
  }
});

var btn = document.getElementById("btn_new_user_proxy");
btn.addEventListener("click", function (event) {
  event.preventDefault();
  add_account();
  //shell.openExternal(this.href);
});

/*
function fill_app_option(data) {
  if (data.length < 1) {
    return 0
  }
  let main_div = document.getElementById("inputGroupSelect01")
  for (var i in data) {
    name = data[i]
    let option = document.createElement("option");
    option.textContent = name
    main_div.appendChild(option)
  }
}
ipc.send("get_all_app_name", "")
ipc.on("all_app_name", (event, data) => {
  fill_app_option(data)
})*/
