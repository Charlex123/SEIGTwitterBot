function send_giveway_link() {
  let value = document.getElementById("linkInput").value;
  if (value != "") {
    ipc.send("get_giveway_info", value);
    $("#emailHelp").text("Wait");
  } else {
    let error_place = document.getElementById("emailHelp");
    error_place.textContent = "Please specify a giveaway";
  }
}
var btn_valide_giveway = document.getElementById("btn_valide_giveway");
btn_valide_giveway.addEventListener("click", send_giveway_link);

function validate_giveway_info(data) {
  let user_to_follow = [];
  let need_rt = document.getElementById("customSwitches").checked;
  let need_like = document.getElementById("switch1").checked;
  let flash_giveaway = document.getElementById("flash_giveaways_s").checked;
  let text_to_add = document.getElementById("hashtagsInput").value;
  let otherText = document.getElementById("hashtagsInput");

  let nb_friend_to_tag =
    document.getElementById("exampleFormControlSelect1").value * 1;

  let tag_friend = Boolean(nb_friend_to_tag || text_to_add);

  for (let screen_name of data.user_mentioned) {
    let element = document.getElementById(screen_name);
    if (element.checked) {
      user_to_follow.push(screen_name);
    }
  }

  let giveAwayToAdd = new GiveAway(
    "x" + parseInt(Math.random() * 10 ** 9, 10),
    data.giveway_id,
    user_to_follow,
    text_to_add,
    need_like,
    need_rt,
    tag_friend,
    nb_friend_to_tag,
    data.provider_id,
    data.link,
    data.provider_screen_name,
    flash_giveaway
  );
  ipc.send("add_new_giveway", giveAwayToAdd);

  //remet tout les truc en place :
  var menu = document.getElementById("Settings_menu");
  menu.classList.remove("je");
  otherText.classList.add("zero");
  document.getElementById("linkInput").value = "";
  //setTimeout(refresh_all, 1000);
}

function display_giveway_info(data) {
  $("#emailHelp").text("");
  if (data.errors != undefined) {
    console.log(data.errors);
    console.log(data);
    $("#emailHelp").text(data.errors);
  } else {
    //remmet les truc en place
    let error_place = document.getElementById("emailHelp");
    error_place.textContent = "";
    document.getElementById("hashtagsInput").value = "";
    tag_friend = document.getElementById("switch2").checked = false;

    var menu = document.getElementById("Settings_menu");
    menu.classList.add("je");
    let main_div = document.getElementById("list_to_follow");
    main_div.innerHTML = "";
    for (let screen_name of data.user_mentioned) {
      let el_div = document.createElement("div");
      el_div.classList.add("custom-control");
      el_div.classList.add("custom-checkbox");
      let checkbx = document.createElement("input");
      checkbx.type = "checkbox";
      checkbx.classList.add("custom-control-input");
      checkbx.id = screen_name;
      checkbx.checked = true;
      el_div.appendChild(checkbx);
      let label_screen_name = document.createElement("label");
      label_screen_name.classList.add("custom-control-label");
      label_screen_name.htmlFor = screen_name;
      label_screen_name.textContent = screen_name;
      label_screen_name.id = screen_name + "_checkbox";

      el_div.appendChild(label_screen_name);
      let main_div = document.getElementById("list_to_follow");
      main_div.appendChild(el_div);
    }

    // suite ( en mode function dans fonction)
    var add_giveway_btn = document.getElementById("add_giveway_btn");
    add_giveway_btn.addEventListener("click", (event) => {
      validate_giveway_info(data);
    });
    get_update_display_giveway();
  }
}
ipc.on("giveway_info", (event, data) => {
  console.log("got info", data);

  display_giveway_info(data);
});

//
