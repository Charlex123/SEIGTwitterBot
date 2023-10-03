var btn_Dm = document.getElementById("Btn_Dm");
var btn_Mentions = document.getElementById("Btn_Mentions");
var btn_errors = document.getElementById("Btn_Errors");

var soulig_en_cours = btn_Dm;

function changer_jaune(btn) {
  soulig_en_cours.classList.remove("jaune");
  btn.classList.add("jaune");
  soulig_en_cours = btn;
}

function get_notif() {
  ipc.send("get_list_notif", "");
}

changer_jaune(btn_Dm);
var displayed = "dm";

get_notif();
setInterval(get_notif, 15000);

btn_Mentions.addEventListener("click", function(event) {
  soulig_en_cours.classList.remove("jaune");
  changer_jaune(btn_Mentions);
  displayed = "mention";
  get_notif();
});

btn_Dm.addEventListener("click", function(event) {
  changer_jaune(btn_Dm);
  displayed = "dm";
  get_notif();
});

btn_errors.addEventListener("click", function(event) {
  changer_jaune(btn_errors);
  displayed = "error";
  get_notif();
});

function timeConverter(value) {
  if (isFinite(value)) {
    value = value * 1;
  }
  let time = new Date(value);
  if (time.toUTCString() == "Invalid Date") {
    return value;
  }
  let locale = "en-DE";
  let options = {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"};
  return time.toLocaleString(locale, options).replace(",", "");
}

const keywords = [
  "win",
  "winner",
  "winners",
  "congrats",
  "congratulation",
  "congratulations",
  "dm",
  "claim",
  "won",
  "remporte",
  "bravo",
  "gagnant",
  "gagne",
  "gagné",
  "remporté",
  "remportent",
  "offert"
];

function bold_chaine(chaine) {
  var yes = false;
  for (var i in keywords) {
    if (chaine.toLowerCase().includes(keywords[i])) {
      yes = true;
    }
  }
  if (yes) {
    var text = document.createElement("b");
    text.appendChild(document.createTextNode(chaine));
    var node = document.createElement("p");
    //console.log(node)
    node.appendChild(text);
  } else {
    var node = document.createElement("p");
    node.appendChild(document.createTextNode(chaine));
  }
  //console.log(node, yes)
  return node;
}

function display_notif(data) {
  let main_div = document.getElementById("notifs_place");
  main_div.innerHTML = "";
  let displayed_message = [];
  var data_to_display = [];
  for (var i in data) {
    notif = data[i];
    if (notif[2] == displayed && notif[3] != undefined) {
      data_to_display.push(notif);
    }
  }

  if (displayed == "mention") {
    data_to_display.sort((a, b) => {
      let a_date = new Date(a[3].date);
      let b_date = new Date(b[3].date);
      return b_date.getTime() - a_date.getTime();
    });
  }
  if (displayed == "dm") {
    data_to_display.sort((a, b) => {
      return b[3] - a[3];
    });
  }
  for (var i in data_to_display) {
    let notif = data_to_display[i];
    if (displayed == "error") {
      date = timeConverter(notif[0]);
      message = date + " @" + notif[1] + " Error -> " + notif[3].errors[0].message;
      if (displayed_message.includes(message) == false) {
        let p_text = bold_chaine(message);
        main_div.appendChild(p_text);
      } else {}
    }
    if (displayed == "mention") {
      date = timeConverter(notif[3].date);
      message = date + " @" + notif[3].send_by + " send -> " + notif[3].message;
      let p_text = bold_chaine(message);
      main_div.appendChild(p_text);
    }
    if (displayed == "dm") {
      date = timeConverter(notif[3].date);
      message = date + " @" + notif[1] + " --> " + notif[3].message;
      let p_text = bold_chaine(message);
      main_div.appendChild(p_text);
    }
  }
}

ipc.on("list_notif", (event, data) => {
  display_notif(data);
});

get_notif();

var btn_clear = document.getElementById("clear_notifs");
btn_clear.addEventListener("click", (event) => {
  event.preventDefault();
  ipc.send("clear_notifs");
  get_notif();
});

last_check = 0;
delay_between_checks = 60000;
var btn_check = document.getElementById("check_notifs");
btn_check.addEventListener("click", (event) => {
  event.preventDefault();
  if (Date.now() > last_check + delay_between_checks) {
    ipc.send("check_notif");
    last_check = Date.now();
  } else {
    console.log("no");

  }
});