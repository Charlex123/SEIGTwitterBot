function get_app_list() {
  ipc.send("get_app_list", "");
}

var app_displayed = [];

function delete_app(event) {
  app = event.path[0].id; // TODO: maybe same error, as somewhere else => move to event.target.id
  //console.log(acc);
  ipc.send("delete_app", app);
  app_displayed = [];
  document.getElementById("all_app").innerHTML = "";
  get_app_list();
}

function display_app_list(data) {
  console.log(data);
  main_div = document.getElementById("all_app");

  for (var i in data) {
    appname = data[i][0];

    if (app_displayed.includes(appname) == false) {
      app_displayed.push(appname);

      let div1 = document.createElement("div");
      div1.classList.add("el-list");
      let div2 = document.createElement("div");
      div2.classList.add("el-liste");
      div1.appendChild(div2);
      let p1 = document.createElement("p");
      p1.classList.add("nom");
      p1.textContent = appname;
      div2.appendChild(p1);

      let div3 = document.createElement("div");
      div3.classList.add("btn-group");
      div3.classList.add("mr-2");
      div2.appendChild(div3);
      let btn = document.createElement("button");
      btn.classList.add("btn");
      btn.classList.add("btn-danger");
      btn.classList.add("testcao");
      btn.textContent = "Delete";
      btn.id = appname;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        delete_app(event);
      });

      div3.appendChild(btn);
      main_div.appendChild(div1);
    }
  }
}

ipc.on("app_list", (event, data) => {
  display_app_list(data);
});

get_app_list();
setInterval(get_app_list, 20000);
