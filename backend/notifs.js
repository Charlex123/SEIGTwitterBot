const request = require("request");
const discord = require("./discord.js");

const { login } = require("./twitter.js");

const puppeteer = require("puppeteer-extra").default;

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function timeConverter(value) {
  if (isFinite(value)) {
    value = value * 1;
  }
  let time = new Date(value);
  if (time.toUTCString() == "Invalid Date") {
    return value;
  }
  return time.toUTCString();
}

const wait = (timeout) =>
  new Promise((res) => setTimeout(() => res(), timeout));

/**
 * upserts a notification to DS
 * @param {*} notif_data
 * @param {*} notif_ds
 * @param {*} settings_ds
 * @returns
 */
function notification(notif_data, notif_ds, settings_ds) {
  let perso_id = settings_ds.get_D("perso_id");
  let webhook_url = settings_ds.get_D("webhook_url");

  let datas = {
    date: timeConverter(notif_data.date),
    message: notif_data.text,
    send_by: notif_data.by,
  };

  if (!notif_ds.add_D([notif_data.id, notif_data.on, notif_data.type, datas])) {
    return;
  }

  win_notification(
    {
      notif_data: notif_data,
      user_id: perso_id,
    },
    webhook_url
  );
}

/**
 * TODO: where does this data gets to? => ensure, old no user-data will be exported without user-notice
 * @param {*} param0
 * @param {*} webhook_url
 */
function win_notification({ notif_data, user_id }, webhook_url) {
  // request
  //   .post("http://api.seigrobotics.com:5000/win_notification", {
  //     json: {
  //       notif_data: notif_data,
  //       user_id: user_id,
  //     },
  //   })
  //   .on("error", function (err) {
  //     console.error(err);
  //   });

  if (webhook_url) {
    request
      .post(webhook_url, {
        json: discord.format_message(notif_data),
      })
      .on("error", function (err) {
        console.error(err);
      });
  }
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked");
}

async function check(user, users_DS, notif_ds, settings_ds, ipc) {
  user = users_DS.get_D(user);
  let account_info = user[2];

  const browser = await puppeteer.launch({
    args: [
      "--enable-features=NetworkService",
      "--proxy-server=" + account_info.proxyhost,
    ],
    ignoreHTTPSErrors: true,
    slowMo: 20,
    headless: settings_ds.get_D("notifs_headless"),
    executablePath: getChromiumExecPath(),
  });

  try {
    const page = await login(browser, account_info, ipc);

    if (!page) {
      return;
    }

    const page2 = await browser.newPage();

    try {
      try {
        console.log("Check for notifications in DMs");

        const [response, _] = await Promise.all([
          page2.waitForResponse((response) =>
            response
              .url()
              .startsWith(
                "https://twitter.com/i/api/1.1/dm/inbox_initial_state.json"
              )
          ),
          page2
            .goto("https://twitter.com/home", {
              waitUntil: "domcontentloaded",
            })
            .then(() => wait(Math.random() * 1000 + 1000))
            .then(() =>
              page.goto("https://twitter.com/notifications/mentions", {
                waitUntil: "domcontentloaded",
              })
            ),
        ]);

        const data = await response.json();
        const inbox_initial_state = data.inbox_initial_state;
        const entries = inbox_initial_state.entries
          ? inbox_initial_state.entries.map(
              (entry) => entry.message.message_data
            )
          : [];
        const users = inbox_initial_state.users;

        for (const entry of entries) {
          const notif_data = {
            date: entry.time,
            text: entry.text,
            by: users[entry.sender_id].screen_name,
            on: users[entry.recipient_id].screen_name,
            id: entry.id,
            type: "dm",
          };
          notification(notif_data, notif_ds, settings_ds);
        }
      } catch (e) {
        console.error(e);
      }

      await wait(Math.random() * 2000 + 1000);

      try {
        console.log("Check for notifications in mentions");

        const [response, _] = await Promise.all([
          page2.waitForResponse((response) =>
            response
              .url()
              .startsWith(
                "https://twitter.com/i/api/2/notifications/mentions.json"
              )
          ),
          // simulate user behavior => clicked on notifications => takes time to click on mentions to get them
          page2
            .goto("https://twitter.com/notifications", {
              waitUntil: "domcontentloaded",
            })
            .then(() => wait(Math.random() * 1000 + 1000))
            .then(() =>
              page.goto("https://twitter.com/notifications/mentions", {
                waitUntil: "domcontentloaded",
              })
            ),
        ]);

        const data = await response.json();
        const globalObjects = data.globalObjects;
        const tweets = globalObjects.tweets;
        const users = globalObjects.users;

        for (const id in tweets) {
          const tweet = tweets[id];
          const notif_data = {
            date: tweet.created_at,
            text: tweet.full_text,
            by: users[tweet.user_id_str].screen_name,
            on: user[0],
            id: tweet.id_str,
            type: "mention",
          };
          notification(notif_data, notif_ds, settings_ds);
        }
      } catch (e) {
        console.error(e);
      }

      ipc.send("list_notif", null);
    } catch (e) {
      console.error(e);
    }
  } catch (e) {
    console.error(e);
  } finally {
    // setTimeout(() => browser.close(), Math.random() * 15 * 1000 + 3000);
  }
}

function check_all_notifs(users_DS, notif_ds, settings_ds, ipc) {
  let all_user = users_DS.get_All_screen_name();
  let delay_between_user_check = 10000;

  for (let i in all_user) {
    let user = all_user[i];
    setTimeout(
      check,
      delay_between_user_check * i,
      user,
      users_DS,
      notif_ds,
      settings_ds,
      ipc
    );
  }
}

module.exports.check_all_notifs = check_all_notifs;
module.exports.win_notification = win_notification;
