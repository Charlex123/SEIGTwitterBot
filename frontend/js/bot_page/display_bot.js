function get_bot_list() {
  ipc.send("get_bot_list", "");
}
get_bot_list();
setInterval(get_bot_list, 10000);

var user_displayed = [];

function delete_acc(event) {
  console.log(event);
  acc = event.target.id;
  //console.log(acc);
  ipc.send("delete_account", acc);
  user_displayed = [];
  document.getElementById("all_bots").innerHTML = "";
  get_bot_list();
}

function display_bot_list(data) {
  main_div = document.getElementById("all_bots");

  for (var i in data) {
    botname = data[i][0];
    bot_app = data[i][2].app_name;

    if (user_displayed.includes(botname) == false) {
      user_displayed.push(botname);

      let div1 = document.createElement("div");
      div1.id = botname;
      div1.classList.add("el-list");
      let div2 = document.createElement("div");
      div2.classList.add("el-liste");
      div1.appendChild(div2);
      let p1 = document.createElement("p");
      p1.classList.add("nom_bot");
      p1.textContent = botname;
      div2.appendChild(p1);

      let p2 = document.createElement("p");
      p2.classList.add("nom_bot_app");
      p2.textContent = bot_app;
      div2.appendChild(p2);

      let div3 = document.createElement("div");
      div3.classList.add("btn-group");
      div3.classList.add("mr-2");
      div2.appendChild(div3);
      let btn = document.createElement("button");
      btn.classList.add("addbtn");
      btn.classList.add("delete");
      btn.classList.add("testcao");
      btn.textContent = "delete";
      btn.id = botname;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        delete_acc(event);
      });

      div3.appendChild(btn);
      main_div.appendChild(div1);
    }
  }
  $(function () {
    $("#all_bots").sortable({
      update: (event, ui) => {
        ipc.send("reorder_bots", $("#all_bots").sortable("toArray"));
        user_displayed = [];
      },
    });
  });
}

ipc.on("bot_list", (event, data) => {
  display_bot_list(data);
});

//
