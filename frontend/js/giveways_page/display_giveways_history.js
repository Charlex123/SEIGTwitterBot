function get_update_display_giveway() {
  ipc.send("get_all_giveways", "get");
}

refresh_all();

function documentContainsGiveway(id) {
  let element = document.getElementById(id);
  return Boolean(element);
}

function updateGiveWayValuesOnPage(giveway) {
  let element = $("#" + giveway.id + " > div > p:nth-child(2)");
  if (giveway.isFinished) {
    element.removeClass().addClass("vert");
    element.text("Done");
    return;
  }
  if (!giveway.isRunning) {
    element.removeClass().addClass("red");
    element.text("Waiting");
    return;
  }
  let all = giveway.users.length;
  let left = getUsersToProcess(giveway).length;
  let finished = giveway.users.length - left;
  let text = "Running " + finished + "/" + all;
  element.removeClass().addClass("orange");
  element.text(text);
}

function insertGiveWayToDocument(giveway, isInitiallCall) {
  if (giveway && giveway.provider_screen_name) {
    let fist_div = document.createElement("div");
    fist_div.classList.add("el-list");
    fist_div.id = giveway.id;
    let div_2 = document.createElement("div");
    div_2.classList.add("el-liste");
    fist_div.appendChild(div_2);
    let text1 = document.createElement("p");
    text1.appendChild(document.createTextNode(giveway.provider_screen_name));
    text1.classList.add("nom");
    div_2.appendChild(text1);
    if (giveway.isFinished) {
      var text2 = document.createElement("p");
      text2.appendChild(document.createTextNode("Done"));
      text2.classList.add("vert");
    } else if (giveway.isRunning) {
      var text2 = document.createElement("p");
      let all = giveway.users.length;
      let left = getUsersToProcess(giveway).length;
      let finished = all - left;
      text2.appendChild(
        document.createTextNode("Running " + finished + "/" + all)
      );
      text2.classList.add("orange");
    } else {
      var text2 = document.createElement("p");
      text2.appendChild(document.createTextNode("Waiting"));
      text2.classList.add("red");
    }
    div_2.appendChild(text2);
    let btn = document.createElement("button");
    btn.classList.add("addbtn");
    btn.classList.add("delete");
    btn.classList.add("testcao");
    if (giveway.isRunning) {
      // btn.disabled = true;
    }
    btn.textContent = "delete";

    btn.id = giveway.id;
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      delete_giveways(event);
    });
    div_2.appendChild(btn);
    let containerElement = document.getElementById("list_all_giveways");
    let entries = containerElement.children.length;
    if (isInitiallCall || entries == 0) {
      containerElement.append(fist_div);
    } else {
      containerElement.prepend(fist_div);
    }
  }
}

function update_display_giveway(event, giveways) {
  let isInitialCall = isDocumentEmpty();
  for (let i in giveways) {
    let giveway = giveways[i];
    if (giveway) {
      if (documentContainsGiveway(giveway.id)) {
        updateGiveWayValuesOnPage(giveway);
      } else {
        insertGiveWayToDocument(giveway, isInitialCall);
      }
    }
  }
}

function isDocumentEmpty() {
  let containerElement = document.getElementById("list_all_giveways");
  let entries = containerElement.children.length;
  if (entries == 0) {
    return true;
  }
  return false;
}

ipc.on("all_giveways_value", function (event, data) {
  update_display_giveway(event, data);
  $(function () {
    $("#list_all_giveways").sortable({
      update: (event, ui) => {
        reorderGiveWays($("#list_all_giveways").sortable("toArray"));
      },
    });
  });
});

function reorderGiveWays(newList) {
  ipc.send("reorder_giveways", newList.reverse());
}

function refresh_all() {
  //document.getElementById("list_all_giveways").innerHTML = "";
  get_update_display_giveway();
}

function delete_giveways(event) {
  console.log(event);
  let acc = event.target.id;
  ipc.send("delete_app_giveway", acc);
  let node = document.getElementById(acc);
  node.remove();
  user_displayed = [];
  refresh_all();
}

ipc.on("giveaway_changed", (event, data) => {
  if (!data.isDeleted) {
    renderGiveAway(data);
  }
});

function renderGiveAway(giveAway) {
  if (documentContainsGiveway(giveAway.id)) {
    updateGiveWayValuesOnPage(giveAway);
  } else {
    insertGiveWayToDocument(giveAway, isDocumentEmpty());
  }
}

function getUsersToProcess(giveAway) {
  let usersToProgress = [];
  if (giveAway) {
    usersToProgress = giveAway.users
      .filter((user) => !user.processed)
      .map((u) => u.user);
    console.log("getUsersToProcess called");
    console.log(usersToProgress);
  }
  return usersToProgress;
}
