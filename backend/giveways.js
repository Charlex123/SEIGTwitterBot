const dns = require("dns");
const url = require("url");

const { login, newPage, follow_someone } = require("./twitter.js");

const puppeteer = require("puppeteer-extra").default;
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function checkInternet() {
  return new Promise((resolve) => {
    dns.lookup("api.twitter.com", function (err) {
      resolve(!err);
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked");
}

const GET_ATTRIBUTE = "((element, name) => element.getAttribute(name))";

async function getAttribute(element, name) {
  return await element.evaluate(eval(GET_ATTRIBUTE), name);
}

// link: https://twitter.com/<user.screen_name>/status/<id>
async function get_giveway_info(link, users_DS, settings_ds, ipc) {
  if (!link) {
    return;
  }

  link = "https://twitter.com" + url.parse(link).pathname;

  let path_split_url = url.parse(link).pathname.split("/");
  id = path_split_url[path_split_url.length - 1];

  let usr = users_DS.get_All()[0];
  let account_info = usr[2];

  const browser = await puppeteer.launch({
    args: [
      "--enable-features=NetworkService",
      "--proxy-server=" + account_info.proxyhost,
    ],
    ignoreHTTPSErrors: true,
    headless: settings_ds.get_D("tasks_headless"),
    executablePath: getChromiumExecPath(),
  });

  try {
    // login + new page
    const page = await newPage(browser, account_info);

    if (!page) {
      return;
    }

    // fetch data
    let [response, _] = await Promise.all([
      page
        .waitForResponse((response) =>
          response.url().includes("/TweetResultByRestId?")
        )
        .catch((err) => {
          console.error(err);
          throw new Error(
            "Website timed out, while loading. Maybe the proxy of your first bot is blocked. Please try again and remove all bot with this proxy if it failes again."
          );
        }),
      page.goto(link, {
        waitUntil: "domcontentloaded",
      }),
    ]);
    let data = await response.json().catch((err) => {
      if (
        err &&
        err.message &&
        err.message.includes("undefined (reading 'body')")
      ) {
        console.error(err);
        throw new Error(
          "Error while response of tweet-data. Please try again."
        );
      }
      throw err;
    });

    let tweet = data.data.tweetResult.result;
    let user = tweet.core.user_results.result;
    let user_mentions = tweet.legacy.entities.user_mentions || [];
    let hashtags = tweet.legacy.entities.hashtags || [];

    ipc.send("giveway_info", {
      user_mentioned: user_mentions.map((x) => x.screen_name),
      hashtags: hashtags.map((x) => x.text),
      provider_screen_name: user.legacy.screen_name,
      link: link,
      giveway_id: id,
      provider_id: user.rest_id,
    });
  } catch (error) {
    console.error("giveway_info:", error);
    ipc.send("giveway_info", {
      errors: error.message,
    });
  } finally {
    setTimeout(() => browser.close(), Math.random() * 15 * 1000 + 3000);
  }
}

async function start_giveway(
  giveways_ds,
  users_DS,
  unstored_data,
  notif_ds,
  settings_ds,
  ipc
) {
  if (unstored_data.get_D("giveways_state") != 0) {
    return;
  }

  let giveway = giveways_ds.getNextGiveAwayToProcess();

  if (!giveway) {
    return;
  }

  let delay_between_participate = giveway.flash_giveaway
    ? settings_ds.get_D("flash_cooldown_account")
    : settings_ds.get_D("cooldown_account");
  let cooldown_giveaways = giveway.flash_giveaway
    ? settings_ds.get_D("flash_cooldown_giveaways")
    : settings_ds.get_D("cooldown_giveaways");

  unstored_data.set_D("giveways_state", 1);

  try {
    giveways_ds.set_running(giveway.id);
    ipc.send("giveaway_changed", giveway);

    let usersToProcess = getUsersToProcess(giveway);
    let allUsers = giveway.users;

    giveways_ds.set_remaining_progression(
      giveway.id,
      allUsers.length - usersToProcess.length + "/" + allUsers.length
    );
    ipc.send("giveaway_changed", giveway);

    for (let user of usersToProcess) {
      if (giveway.isDeleted) {
        return;
      }

      if (!(await checkInternet())) {
        console.log("Internet down");

        do {
          await wait(delay_between_participate);
        } while (!(await checkInternet()));

        console.log("Internet up");
      }

      try {
        await take_giveway(giveway, user, users_DS, notif_ds, settings_ds, ipc);
      } catch (e) {
        console.error("take_giveway:", e);
      }

      setUserProcessed(giveway, user);
      usersToProcess = getUsersToProcess(giveway);
      giveways_ds.set_remaining_progression(
        giveway.id,
        allUsers.length - usersToProcess.length + "/" + allUsers.length
      );
      ipc.send("giveaway_changed", giveway);
      if (usersToProcess.length != 0) await wait(delay_between_participate);
    }

    giveways_ds.set_done(giveway.id);
    ipc.send("giveaway_changed", giveway);
    await wait(cooldown_giveaways);
  } catch (error) {
    console.error("start_giveway:", error);
  } finally {
    unstored_data.set_D("giveways_state", 0);
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 * performs actions for one bot to one giveaway
 * actions:
 * - follow post-owner
 * - likes post
 * - retweets post
 * - tags friend
 * - add text/comment
 * - follows prefedined users
 * @param {*} giveAway
 * @param {*} user
 * @param {*} users_DS
 * @param {*} notif_ds
 * @param {*} settings_ds
 * @param {*} ipc
 * @returns
 */
async function take_giveway(
  giveAway,
  user,
  users_DS,
  notif_ds,
  settings_ds,
  ipc
) {
  let user_screen_name = user;

  let usr = users_DS.get_D(user);
  if (!usr) {
    return;
  }
  let account_info = usr[2]; //check this

  const browser = await puppeteer.launch({
    args: [
      "--enable-features=NetworkService",
      "--proxy-server=" + account_info.proxyhost,
    ],
    ignoreHTTPSErrors: true,
    slowMo: 25,
    headless: settings_ds.get_D("tasks_headless"),
    executablePath: getChromiumExecPath(),
  });

  try {
    const page = await login(browser, account_info, ipc);

    if (!page) {
      return;
    }

    screen_name = users_DS.get_All_screen_name()[0];

    // follow post-owner
    if (giveAway.follow_provider) {
      await follow_someone(
        browser,
        account_info,
        giveAway.provider_screen_name
      );
      await wait(Math.random() * 3000 + 2000);
    }

    let page_tweet;

    // opens giveaway in browser, if any action is needed
    if (
      giveAway.need_like ||
      giveAway.need_rt ||
      giveAway.tag_friend ||
      giveAway.text_to_add.length > 0
    ) {
      page_tweet = await newPage(browser, account_info);
      await page_tweet.goto(giveAway.link, {
        waitUntil: "domcontentloaded",
      });

      // Needs testing
      /*let cookie_banner = await page_tweet.$('#layers div[role=button]');

      if (cookie_banner) {
        await page_tweet.click(cookie_banner);
        await wait(200);
      }*/
    }

    // likes post
    if (giveAway.need_like) {
      try {
        //let selector_like = '[data-testid=tweet] [data-testid=like]'
        let selector_like = "[data-testid=like]";
        let selector_unlike = "[data-testid=unlike]";
        let handle = await page_tweet.waitForSelector(
          [selector_like, selector_unlike].join(", "),
          { visible: true }
        );
        if ((await getAttribute(handle, "data-testid")) == "like") {
          await page_tweet.click(selector_like);
          await wait(Math.random() * 500 + 1200);
        }
      } catch (e) {
        console.log("No like ", e.message);
        notif_ds.add_D([Date.now(), user_screen_name, "error", e]);
      }
    }

    // retweet
    if (giveAway.need_rt) {
      try {
        //let selector_retweet = '[data-testid=tweet] [data-testid=retweet]'
        let selector_retweet = "[data-testid=retweet]";
        let selector_unretweet = "[data-testid=unretweet]";
        let handle = await page_tweet.waitForSelector(
          [selector_retweet, selector_unretweet].join(", "),
          { visible: true }
        );
        if ((await getAttribute(handle, "data-testid")) == "retweet") {
          await page_tweet.click(selector_retweet);
          await wait(Math.random() * 100 + 200);

          let selector_confirm = "[data-testid=retweetConfirm]";
          await page_tweet.waitForSelector(selector_confirm, { visible: true });
          await page_tweet.click(selector_confirm);
          await wait(Math.random() * 500 + 2100);
        }
      } catch (e) {
        console.log("No rt ", e.message);
        notif_ds.add_D([Date.now(), user_screen_name, "error", e]);
      }
    }

    // tags a friend / add comment/text
    if (giveAway.tag_friend || giveAway.text_to_add.length > 0) {
      let random_screen_name = [];
      let all_screen_name = shuffle(users_DS.get_All_screen_name());
      all_screen_name.forEach(function (item) {
        if (
          item != user_screen_name &&
          random_screen_name.length < giveAway.nb_friend_to_tag
        ) {
          random_screen_name.push("@" + item);
        }
      });
      let random_text = shuffle(giveAway.text_to_add.split(";"))[0];
      let message = random_screen_name.join(" ") + " " + random_text;
      message = " " + message + " ";

      try {
        //let selector_reply = "[data-testid=tweet] [data-testid=reply]"
        let selector_reply = "[data-testid=reply]";
        await page_tweet.waitForSelector(selector_reply, { visible: true });
        await page_tweet.click(selector_reply);
        await wait(200);

        let selector_tweetTextarea = "[data-testid*=tweetTextarea]";
        await page_tweet.waitForSelector(selector_tweetTextarea, {
          visible: true,
        });
        await page_tweet.click(selector_tweetTextarea);
        await wait(200);
        await page_tweet.keyboard.type(message, { delay: 100 });
        await wait(200);

        let selector_tweetButton = "[data-testid=tweetButton]:not([disabled])";
        await page_tweet.waitForSelector(selector_tweetButton, {
          visible: true,
        });
        await page_tweet.click(selector_tweetButton);
        await wait(200);

        await page_tweet.waitForSelector(selector_tweetTextarea, {
          hidden: true,
        });
      } catch (err) {
        console.error(err, "ERROR", err.message);
        notif_ds.add_D([Date.now(), user_screen_name, "error", err]);
      }
    }

    // user to follow
    if (giveAway.user_to_follow) {
      for (let user of giveAway.user_to_follow) {
        await follow_someone(browser, account_info, user);
        await wait(Math.round() * 10000 + 2000);
      }
    }
  } catch (e) {
    console.error("take_giveway:", e);
  } finally {
    setTimeout(() => browser.close(), Math.random() * 15 * 1000 + 3000);
  }
}

function setUserProcessed(giveAway, user) {
  let usr = giveAway.users.find((usr) => usr.user == user);
  if (usr) {
    usr.processed = true;
  }
}

function getUsersToProcess(giveAway) {
  return giveAway.users.filter((user) => !user.processed).map((u) => u.user);
}

module.exports.get_giveway_info = get_giveway_info;
module.exports.start_giveway = start_giveway;
