const request = require("request");

var task_cooldown = document.getElementById("task_cooldown");
var acc_cooldown = document.getElementById("account_cooldown");

var flash_task_cooldown = document.getElementById("flash_task_cooldown");
var flash_acc_cooldown = document.getElementById("flash_account_cooldown");

var btn_save_settings = document.getElementById("btn_save_settings");
var btn_reset_settings = document.getElementById("btn_reset_settings");

var clef_affichage = document.getElementById("clef_affichage");

var btn_test_webhooks = document.getElementById("test_webhook");

var key_x = "";

ipc.on("all_settings", (event, data) => {
  clef_affichage.textContent = data.key;
  task_cooldown.value = data.cooldown_giveaways / 1000;
  flash_acc_cooldown.value = data.flash_cooldown_account / 1000;
  flash_task_cooldown.value = data.flash_cooldown_giveaways / 1000;
  acc_cooldown.value = data.cooldown_account / 1000;
  key_x = data.key;
  input_webhooks.value = data.webhook_url;

  $("#bots_headless").prop("checked", data.bots_headless);
  $("#tasks_headless").prop("checked", data.tasks_headless);
  $("#notifs_headless").prop("checked", data.notifs_headless);
  $("#human_headless").prop("checked", data.human_headless);
});
ipc.send("get_settings");

var btn_delete_key = document.getElementById("btn_delete_key");
btn_delete_key.addEventListener("click", (event) => {
  event.preventDefault();
  ipc.send("set_settings", {
    key: "key",
    data: "",
  });
  ipc.send("get_settings");
  // request.get("http://api.seigrobotics.com:5000/del_activation?key=" + key_x, (error, res, body) => {
  //   if (error) {
  //     console.error(error)
  //     return
  //   }
  //   console.log(`statusCode: ${res.statusCode}`)
  // })
});
btn_test_webhooks.addEventListener("click", (event) => {
  event.preventDefault();
  ipc.send("test_webhook", $("#input_webhooks").val().trim());
});

function send_settings() {
  ipc.send("set_settings", {
    key: "cooldown_giveaways",
    data: $("#task_cooldown").val() * 1000,
  });
  ipc.send("set_settings", {
    key: "cooldown_account",
    data: $("#account_cooldown").val() * 1000,
  });
  ipc.send("set_settings", {
    key: "flash_cooldown_giveaways",
    data: $("#flash_task_cooldown").val() * 1000,
  });
  ipc.send("set_settings", {
    key: "flash_cooldown_account",
    data: $("#flash_account_cooldown").val() * 1000,
  });
  ipc.send("set_settings", {
    key: "webhook_url",
    data: $("#input_webhooks").val().trim(),
  });

  ipc.send("set_settings", {
    key: "bots_headless",
    data: $("#bots_headless").is(":checked"),
  });
  ipc.send("set_settings", {
    key: "tasks_headless",
    data: $("#tasks_headless").is(":checked"),
  });
  ipc.send("set_settings", {
    key: "notifs_headless",
    data: $("#notifs_headless").is(":checked"),
  });
  ipc.send("set_settings", {
    key: "human_headless",
    data: $("#human_headless").is(":checked"),
  });
}

ipc.on("all_settings", function (event, data) {
  console.log(data);
});

btn_save_settings.addEventListener("click", function (event) {
  event.preventDefault();
  console.log("oooo");
  send_settings();
});

btn_reset_settings.addEventListener("click", function (event) {
  event.preventDefault();
  task_cooldown.value = 190;
  acc_cooldown.value = 50;
  flash_task_cooldown.value = 190;
  flash_acc_cooldown.value = 50;
  input_webhooks.value = "";
  send_settings();
});
