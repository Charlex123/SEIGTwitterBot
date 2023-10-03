// Modules to control application life and create native browser window
//Electron modules
const { app, BrowserWindow } = require("electron");
const ipc = require("electron").ipcMain;
const { autoUpdater } = require("electron-updater");

//module perso
const Twitter = require("twitter-lite");

//http modules
var http = require("http");
var url = require("url");
var querystring = require("querystring");
const request = require("request");

//modules perso
const {
  get_redirect_url,
  add_new_app,
  add_new_proxy_user,
} = require("./user_app_managment.js");
const {
  Users_DS,
  App_DS,
  Giveways_DS,
  Settings_DS,
  Unstored_DS,
  Notif_DS,
} = require("./data_managment.js");
const { get_giveway_info, start_giveway } = require("./giveways.js");
const { activation, resetPwd } = require("./auth.js");
const { get_perso_id, send_alive } = require("./analytics.js");
const { check_all_notifs, win_notification } = require("./notifs.js");

const {
  make_bot_follow_between_themself,
  tweet_something,
} = require("./hm.js");
//declaration classes perso
const unstored_data = new Unstored_DS();
const users_DS = new Users_DS();
const giveways_ds = new Giveways_DS();
const notif_ds = new Notif_DS();
const settings_ds = new Settings_DS();
const app_ds = new App_DS();

function activate2(key, settings_ds) {
  return [1, "x"];

  // try {
  //   key = settings_ds.get_D("key");
  // } catch (e) {
  //   return [1, "x"];
  // }

  // L1s.SetProductData(okkp);
  // L1s.SetProductId(okks, L2s.LA_USER);
  // try {
  //   L1s.SetLicenseKey(key);
  //   L1s.SetActivationMetadata("key1", "value1");
  //   const status = L1s.ActivateLicense();
  //   if (L4s.LA_OK == status) {
  //     settings_ds.add_D("key", key);
  //     return [1, ""];
  //   } else if (L4s.LA_EXPIRED == status) {
  //     return [0, ""];
  //   } else if (L4s.LA_SUSPENDED == status) {
  //     return [0, ""];
  //   } else if (L4s.LA_FAIL == status) {
  //     return [-1, ""];
  //   }
  // } catch (error) {
  //   return [0, error.message, error.code];
  // }
}

function send_activity() {
  send_alive(get_perso_id(settings_ds));
}

send_activity();

let security_counter = 0;

function security() {
  let status = activate2("", settings_ds)[0];

  if (status == 1) {
    security_counter = 8;
  } else if (status == -1) {
    security_counter = Math.max(0, security_counter - 1);
  } else {
    security_counter = 0;
  }

  if (security_counter == 0) {
    app.quit();
  }
}

function app_window() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    frame: false,
    movable: true,
    backgroundColor: "#091821",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      affinity: "window",
    },
  });
  mainWindow.setResizable(false);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  // and load the index.html of the app.
  mainWindow.loadFile("./frontend/Giveaways.html");
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

function activation_windows() {
  const mainWindow = new BrowserWindow({
    width: 450,
    height: 260,
    frame: false,
    movable: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      affinity: "window",
    },
  });

  mainWindow.setResizable(false);

  // and load the index.html of the app.
  mainWindow.loadFile("./frontend/Activation.html");
  return mainWindow;
}

/**
 * @type {BrowserWindow}
 */
var mainWindow;

async function main() {
  if ((await activation("", settings_ds)[0]) != 1) {
    mainWindow = activation_windows();
  } else {
    mainWindow = app_window();
    setInterval(security, 15 * 60 * 1000);
    //notif_ds.clear_All();
    //check_all_notifs(users_DS, notif_ds, settings_ds);
    //setInterval(check_all_notifs, 240000, users_DS, notif_ds, settings_ds);
    setInterval(() => {
      start_giveway(
        giveways_ds,
        users_DS,
        unstored_data,
        notif_ds,
        settings_ds,
        mainWindow.webContents
      );
    }, 1000);
    //giveways_ds.clear_running();
  }
}

//all
ipc.on("close_app", (event, data) => {
  app.quit();
});

ipc.on("stop_interval", (event, data) => {
  if (giveAwayTaskIntervalId) {
    clearInterval(giveAwayTaskIntervalId);
  }
});

//activation window
ipc.on("login", async (event, data) => {
  let login_status = await activation(data, settings_ds);
  if (login_status[0] == 0) {
    event.sender.send("login_response", login_status[1]);
  } else {
    mainWindow.close();
    mainWindow = null;
    mainWindow = app_window();
  }
});
ipc.on("reset_pwd", async (event, data) => {
  let reset_pwd_status = await resetPwd(data, settings_ds);
  event.sender.send("reset_pwd_response", reset_pwd_status[1]);
});

//Giveaway windows
//display giveways
ipc.on("get_all_giveways", (event, data) => {
  let all = giveways_ds.get_All_In_Order();
  mainWindow.webContents.send("all_giveways_value", all);
});

//set new giveways
ipc.on("get_giveway_info", (event, data) => {
  get_giveway_info(data, users_DS, settings_ds, mainWindow.webContents);
});

ipc.on("add_new_giveway", (event, giveAway) => {
  let users = users_DS.get_All_screen_name();
  giveways_ds.add_D(giveAway);
  giveways_ds.setUsersToProcess(giveAway.id, users);
  mainWindow.webContents.send("giveaway_changed", giveAway);
});
ipc.on("delete_app_giveway", (event, data) => {
  giveways_ds.markGiveWayToBeDeleted(data);
  giveways_ds.removeGiveAwayFromQueue(data);
  giveways_ds.remove_D(data);
});
ipc.on("reorder_giveways", (event, data) => {
  console.log("ipc.on(reorder_giveways) called");
  giveways_ds.reorder(data);
});

//bot managment window (add new user)
ipc.on("add_account", (event, data) => {
  add_new_proxy_user(data, users_DS, settings_ds, mainWindow.webContents);
});

//display all bots
ipc.on("get_bot_list", (event, data) => {
  mainWindow.webContents.send("bot_list", users_DS.get_All());
});
ipc.on("delete_account", (event, data) => {
  users_DS.remove_D(data);
});
ipc.on("reorder_bots", (event, data) => {
  users_DS.reorder(data);
});

//app managment window
ipc.on("get_app_list", (event, data) => {
  mainWindow.webContents.send("app_list", app_ds.get_All());
});
ipc.on("delete_app", (event, data) => {
  app_ds.remove_D(data);
});

ipc.on("add_new_app", (event, data) => {
  add_new_app(data[0], data[1], app_ds, mainWindow.webContents);
});

//notif window
ipc.on("get_list_notif", (event, data) => {
  mainWindow.webContents.send("list_notif", notif_ds.get_All());
});

ipc.on("win_notification", (event, data) => {
  let notif_data = data;
});
ipc.on("clear_notifs", (event, data) => {
  notif_ds.clear_All();
});
ipc.on("check_notif", (event, data) => {
  check_all_notifs(users_DS, notif_ds, settings_ds, mainWindow.webContents);
});

//human activity
ipc.on("make_all_follow", (event, data) => {
  make_bot_follow_between_themself(
    users_DS,
    settings_ds,
    mainWindow.webContents
  );
});

ipc.on("make_tweet", (event, data) => {
  tweet_something(
    data.user,
    data.text,
    users_DS,
    settings_ds,
    mainWindow.webContents
  );
});

//settings window

ipc.on("remove_key", (event, data) => {
  settings_ds.add_D("key", "No key");
  // try {
  //   request.get(
  //     "http://api.seigrobotics.com:5000/del_activation?key=" + key_x,
  //     (error, res, body) => {
  //       if (error) {
  //         console.error(error);
  //         return;
  //       }
  //     }
  //   );
  // } catch (e) {
  //   console.error(e);
  // }
});

ipc.on("get_settings", (event, data) => {
  mainWindow.webContents.send("all_settings", settings_ds.get_All());
});
ipc.on("set_settings", (event, data) => {
  console.log("set : ", data.key, " as : ", data.data);

  if (settings_ds.add_D(data.key, data.data)) {
    if (data.key == "webhook_url") {
      test_webhook(data.data);
    }
  }
});

ipc.on("test_webhook", (event, data) => {
  test_webhook(data);
});

function test_webhook(webhook_url) {
  let perso_id = settings_ds.get_D("perso_id");
  let notif_data = {
    date: "28/10/2015",
    text: "That test was successfully failed",
    by: "Marty",
    on: "",
    id: "test_webhook",
    type: "mention",
  };
  win_notification(
    {
      notif_data: notif_data,
      user_id: perso_id,
    },
    webhook_url
  );
}

let update_status = null;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.on("checking-for-update", (ev, info) => {
  update_status = "checking";
  mainWindow?.webContents?.send("update_status", update_status);
});
autoUpdater.on("update-downloaded", (ev, info) => {
  console.log("update downloaded");
  update_status = "downloaded";
  mainWindow.webContents.send("update_status", update_status);
});
autoUpdater.on("update-available", (ev, info) => {
  console.log("update available");
  update_status = "available";
  mainWindow.webContents.send("update_status", update_status);
});
autoUpdater.on("update-not-available", (ev, info) => {
  console.log("update not available");
  update_status = "not-available";
  mainWindow.webContents.send("update_status", update_status);
});
autoUpdater.on("error", (ev, err) => {
  console.log("error in updater");
  update_status = "error";
  mainWindow.webContents.send("update_status", update_status);
});

ipc.on("get_update_status", (event, data) => {
  mainWindow.webContents.send("update_status", update_status);
});
ipc.on("download_update", (event, data) => {
  update_status = "downloading";
  mainWindow.webContents.send("update_status", update_status);
  autoUpdater.downloadUpdate();
});
ipc.on("install_update", (event, data) => {
  update_status = "installing";
  mainWindow.webContents.send("update_status", update_status);
  autoUpdater.quitAndInstall();
});

app.on("ready", function () {
  autoUpdater.checkForUpdates();
});

app.whenReady().then(main);
// Quit when all windows are closed.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) main();
});
