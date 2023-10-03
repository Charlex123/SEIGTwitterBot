const Twitter = require("twitter-lite");

const { login, newPage, follow_someone } = require("./twitter.js");

const puppeteer = require("puppeteer-extra");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked");
}

async function make_bot_follow_between_themself(users_DS, settings_ds, ipc) {
  let all_user = users_DS.get_All_screen_name();

  for (let user of all_user) {
    let followings = users_DS.get_followed(user);
    user_info = users_DS.get_D(user);

    if (!all_user.some((user1) => !followings.includes(user1))) {
      console.log(user, `already follows all bots in application`);
      continue;
    }

    const browser = await puppeteer.launch({
      args: [
        "--enable-features=NetworkService",
        "--proxy-server=" + user_info[2].proxyhost,
      ],
      ignoreHTTPSErrors: true,
      slowMo: 25,
      headless: settings_ds.get_D("human_headless"),
      executablePath: getChromiumExecPath(),
    });

    try {
      await login(browser, user_info[2], ipc);

      for (let user1 of all_user) {
        if (!followings.includes(user1)) {
          await wait(15000);
          console.log("lets follow", user1, "with", user);

          follow_someone(browser, user_info[2], user1);
          console.log("need follow ", user1);

          users_DS.set_as_followed(user, user1);
        }
      }
    } catch (e) {
      console.log("oups", e.message);
    } finally {
      setTimeout(() => browser.close(), Math.random() * 15 * 1000 + 3000);
    }
  }

  ipc.send("make_bot_follow_between_themself_finished");
}

async function tweet_something(user, text, users_DS, settings_ds, ipc) {
  user_info = users_DS.get_D(user);

  const browser = await puppeteer.launch({
    args: [
      "--enable-features=NetworkService",
      "--proxy-server=" + user_info[2].proxyhost,
    ],
    ignoreHTTPSErrors: true,
    slowMo: 25,
    headless: settings_ds.get_D("human_headless"),
    executablePath: getChromiumExecPath(),
  });

  try {
    let page = await login(browser, user_info[2], ipc);

    let selector_NewTweet = "[data-testid=tweetTextarea_0]";
    await page.waitForSelector(selector_NewTweet);
    await page.click(selector_NewTweet);
    await wait(Math.random() * 1000 + 1500);

    await page.keyboard.type(text);
    await wait(Math.random() * 1000 + 1500);

    let selector_tweetButton = "[data-testid=tweetButtonInline]";
    await page.waitForSelector(selector_tweetButton);
    await page.click(selector_tweetButton);
    await wait(Math.random() * 1000 + 1500);
  } catch (e) {
    console.error("tweet_something:", e);
  } finally {
    setTimeout(() => browser.close(), Math.random() * 15 * 1000 + 3000);
  }
}

module.exports.tweet_something = tweet_something;
module.exports.make_bot_follow_between_themself =
  make_bot_follow_between_themself;
