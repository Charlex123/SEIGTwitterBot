function download_update() {
  ipc.send("download_update");
}
function install_update() {
  ipc.send("install_update");
}

ipc.send("get_update_status");
ipc.on("update_status", (event, data) => {
  const status = data;
  const version = "v2.2.4";

  const p_version = document.getElementById("actual_version");
  p_version.textContent = version + " PROXY Update: " + status;

  switch (status) {
    case "available":
      p_version.textContent += "\nClick to download";
      p_version.addEventListener("click", download_update);
      break;
    case "downloaded":
      p_version.textContent += "\nClick to install";
      p_version.removeEventListener("click", download_update);
      p_version.addEventListener("click", install_update);
      break;
  }
});
