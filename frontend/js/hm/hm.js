ipc.send("get_bot_list", "");

function display_bot_list(data) {
  let list = $("#selectAccount");
  for (var i in data) {
    botname = data[i][0];
    list.append("<option>" + botname + "</option>");
  }
}

ipc.on("bot_list", (event, data) => {
  display_bot_list(data);
});

ipc.on("make_bot_follow_between_themself_finished", (event, data) => {
  enableFollowBetweenThemselvesButton();
});

function setText(element, text) {
  if (element && text) {
    element.innerHTML = text;
  }
}

function enableFollowBetweenThemselvesButton() {
  let activationButton = document.getElementById("followEachOther");
  activationButton.disabled = false;
  setText(activationButton, "Make every included account follow each other");
}

$("#followEachOther").on("click", () => {
  let btn = $("#followEachOther");
  btn.html("Processing...").prop("disabled", true);
  ipc.send("make_all_follow");
});

$("#validerTweetAccount").on("click", () => {
  let user = $("#selectAccount").val();
  let text = $("#texttweet").val();
  ipc.send("make_tweet", {
    user: user,
    text: text,
  });
});
