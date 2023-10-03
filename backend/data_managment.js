const Store = require("electron-store");

class Users_DS extends Store {
  constructor() {
    super();
    this.data_name = "user_list";
    this.datas = this.get(this.data_name) || []; // [screen_name, {user_id, tokens(json), app_name, state:good/bad}, ...]
  }

  get_D(screen_name) {
    return this.datas.find((d) => d[0] == screen_name);
  }

  get_All() {
    return this.datas;
  }

  get_All_screen_name() {
    return this.datas.map((d) => d[0]);
  }

  get_All_ids() {
    return this.datas.map((d) => d[1]);
  }

  add_D(data) {
    let index = this.datas.findIndex((d) => d[0] == data[0]);
    if (index >= 0) {
      this.datas[index] = data;
    } else {
      this.datas.push(data);
    }
    this.set(this.data_name, this.datas);
  }

  remove_D(screen_name) {
    this.datas = this.datas.filter((d) => d[0] != screen_name);
    this.set(this.data_name, this.datas);
  }

  reorder(new_order) {
    this.datas = new_order.map((id) => this.get_D(id)).filter((d) => d);
    this.set(this.data_name, this.datas);
  }

  get_followed(screen_name) {
    let data = this.get_D(screen_name);
    if (!data) {
      return [];
    }
    if (!data[2].user_followed) {
      data[2].user_followed = [screen_name];
      this.add_D(data);
    }
    return data[2].user_followed;
  }

  set_as_followed(user_screen_name, followed_screen_name) {
    let data = this.get_D(user_screen_name);
    if (!data) {
      return;
    }
    data[2].user_followed = data[2].user_followed || [];
    data[2].user_followed.push(followed_screen_name);
    this.add_D(data);
  }
}

class App_DS extends Store {
  constructor() {
    super();
    this.data_name = "app_list";
    this.datas = this.get(this.data_name) || []; // [name, {tokens(json), bot_on_it}, ...]
    //this.datas = [["a"],["b"],["be"]]
  }

  get_D(screen_name) {
    return this.datas.find((d) => d[0] == screen_name);
  }

  get_All() {
    return this.datas;
  }

  get_All_app_name() {
    return this.datas.map((d) => d[0]);
  }

  add_D(data) {
    if (data.length == 1) {
      return;
    }
    let index = this.datas.findIndex((d) => d[0] == data[0]);
    if (index >= 0) {
      this.datas[index] = data;
    } else {
      this.datas.push(data);
    }
    this.set(this.data_name, this.datas);
  }

  remove_D(screen_name) {
    this.datas = this.datas.filter((d) => d[0] != screen_name);
    this.set(this.data_name, this.datas);
  }
}

class Giveways_DS extends Store {
  constructor() {
    super();
    this.data_name = "giveway_data";
    this.giveAwaysOrderName = "giveAwaysOrder";
    this.giveAwaysOrder = this.get(this.giveAwaysOrderName) || [];
    this.giveAways = this.get(this.data_name) || [];
  }

  get_D(id) {
    return this.giveAways.find((g) => g.id == id);
  }

  get_All() {
    return this.get_All_In_Order();
  }

  get_All_In_Order() {
    return this.giveAwaysOrder.map((id) => this.get_D(id)).filter((g) => g);
  }

  getNextGiveAwayToProcess() {
    return this.get_D(
      this.giveAwaysOrder.find((id) => !this.get_D(id)?.isFinished)
    );
  }

  addGiveAwayToQueue(id) {
    if (!id || this.giveAwaysOrder.includes(id)) {
      return;
    }
    this.giveAwaysOrder.push(id);
    this.set(this.giveAwaysOrderName, this.giveAwaysOrder);
  }

  removeGiveAwayFromQueue(id) {
    this.giveAwaysOrder = this.giveAwaysOrder.filter((entry) => entry != id);
    this.set(this.giveAwaysOrderName, this.giveAwaysOrder);
  }

  add_D(giveAway) {
    if (!giveAway) {
      return;
    }
    giveAway.timeStamp = Math.floor(Date.now() / 1000);
    giveAway.isRunning = false;
    giveAway.isFinished = false;
    giveAway.isDeleted = false;
    let index = this.giveAways.findIndex((g) => g.id == giveAway.id);
    if (index >= 0) {
      this.giveAways[index] = giveAway;
    } else {
      this.giveAways.push(giveAway);
    }
    this.set(this.data_name, this.giveAways);
    this.addGiveAwayToQueue(giveAway.id);
  }

  remove_D(id) {
    this.giveAways = this.giveAways.filter((g) => g.id != id);
    this.set(this.data_name, this.giveAways);
  }

  set_remaining_progression(id, progression) {
    console.log("set_remaining_progression called");
    console.log("giveAway id: " + id + ", progression: " + progression);
    let giveAway = this.get_D(id);
    if (!giveAway) {
      return;
    }
    giveAway.progress = progression;
    this.updateState(giveAway);
  }

  updateState(giveAway) {
    if (!giveAway) {
      return;
    }
    let index = this.giveAways.findIndex((g) => g.id == giveAway.id);
    if (index < 0) {
      return;
    }
    this.giveAways[index] = giveAway;
    //Object.assign(this.giveAways[index], giveAway);
    this.set(this.data_name, this.giveAways);
  }

  set_done(id) {
    let giveAway = this.get_D(id);
    if (!giveAway) {
      return;
    }
    giveAway.isRunning = false;
    giveAway.isFinished = true;
    this.updateState(giveAway);
  }

  set_running(id) {
    let giveAway = this.get_D(id);
    if (!giveAway) {
      return;
    }
    giveAway.isRunning = true;
    giveAway.isFinished = false;
    this.updateState(giveAway);
  }

  clear_running() {
    this.get_running().forEach((g) => this.set_done(g.id));
  }

  get_done() {
    return this.giveAways.filter((g) => g.isFinished);
  }

  get_not_done() {
    return this.giveAways.filter((g) => !g.isFinished);
  }

  get_running() {
    return this.giveAways.filter((g) => g.isRunning);
  }

  reorder(new_order) {
    this.giveAwaysOrder = new_order;
    this.set(this.giveAwaysOrderName, this.giveAwaysOrder);
  }

  setUsersToProcess(id, users) {
    let giveAway = this.get_D(id);
    if (!giveAway) {
      return;
    }
    giveAway.users = users.map((user) => ({
      user: user,
      processed: false,
    }));
    this.updateState(giveAway);
  }

  markGiveWayToBeDeleted(id) {
    let giveAway = this.get_D(id);
    if (!giveAway) {
      return;
    }
    giveAway.isDeleted = true;
    this.updateState(giveAway);
  }
}

class Notif_DS extends Store {
  constructor() {
    super();
    this.data_name = "notif_save";
    this.defaut = this.datas = this.get(this.data_name) || []; // [source (user or system), type(dm, mention, error), datas{message, date, ect}]
    //this.datas = [["a"],["b"],["be"]]
  }

  get_D(id) {
    return this.datas.find((d) => d[0] == id);
  }

  get_All() {
    return this.datas;
  }

  clear_All() {
    this.datas = [];
    this.set(this.data_name, this.datas);
  }

  add_D(datas_notif) {
    if (this.get_D(datas_notif[0])) {
      return false;
    }
    datas_notif.push(Math.floor(Date.now() / 1000));
    this.datas.push(datas_notif);
    this.set(this.data_name, this.datas);
    return true;
  }
}

class Settings_DS extends Store {
  constructor() {
    super();
    this.data_default = {
      key: "",
      cooldown_giveaways: 190000,
      cooldown_account: 50000,
      flash_cooldown_giveaways: 190000,
      flash_cooldown_account: 50000,
      webhook_url: "",
    };
    this.data_name = "setings";
    this.datas = this.get(this.data_name) || this.data_default; // [screen_name, tokens(json), ...]
    if (this.datas.cooldown_giveaways === undefined) {
      this.datas.cooldown_giveaways = this.data_default.cooldown_giveaways;
    }
    if (this.datas.cooldown_account === undefined) {
      this.datas.cooldown_account = this.data_default.cooldown_account;
    }
    if (this.datas.flash_cooldown_giveaways === undefined) {
      this.datas.flash_cooldown_giveaways =
        this.data_default.flash_cooldown_giveaways;
    }
    if (this.datas.flash_cooldown_account === undefined) {
      this.datas.flash_cooldown_account =
        this.data_default.flash_cooldown_account;
    }
    if (this.datas.webhook_url === undefined) {
      this.datas.webhook_url = this.data_default.webhook_url;
    }

    if (this.datas.bots_headless === undefined) {
      this.datas.bots_headless = false;
    }
    if (this.datas.tasks_headless === undefined) {
      this.datas.tasks_headless = true;
    }
    if (this.datas.notifs_headless === undefined) {
      this.datas.notifs_headless = true;
    }
    if (this.datas.human_headless === undefined) {
      this.datas.human_headless = true;
    }

    this.set(this.data_name, this.datas);
    //this.datas = [["a"],["b"],["be"]]
  }

  get_All() {
    return this.datas;
  }

  get_D(key) {
    return this.datas[key];
  }

  add_D(key, data) {
    if (this.get_D(key) === data) {
      return false;
    }
    this.datas[key] = data;
    this.set(this.data_name, this.datas);
    return true;
  }

  remove_D(key) {
    this.datas[key] = undefined;
    this.set(this.data_name, this.datas);
  }
}

class Unstored_DS {
  constructor() {
    this.datas = {
      ready: false,
      version: "2.0.0",
      giveways_state: 0,
    };
  }
  get_D(key) {
    return this.datas[key];
  }

  set_D(key, data) {
    this.datas[key] = data;
  }

  remove_D(key) {
    this.datas[key] = undefined;
  }
}

module.exports.Settings_DS = Settings_DS;
module.exports.Giveways_DS = Giveways_DS;
module.exports.Users_DS = Users_DS;
module.exports.App_DS = App_DS;

module.exports.Notif_DS = Notif_DS;
module.exports.Unstored_DS = Unstored_DS;
