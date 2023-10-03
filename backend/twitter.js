const fsP = require("fs").promises;
const fs = require("fs");
const electron = require("electron");
const cookies_path =
  (electron.app || electron.remote.app).getPath("userData") + "/cookies";

if (!fs.existsSync(cookies_path)) {
  fs.mkdirSync(cookies_path);
}

const puppeteer = require("puppeteer-extra");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Page, Browser } = require("puppeteer");
puppeteer.use(StealthPlugin());

const wait = (timeout) =>
  new Promise((res) => setTimeout(() => res(), timeout));

/**
 * login of a user, eigher by existing cookie or with puppeteer user info (manual)
 * @param {Browser} browser
 * @param {*} account_info
 * @param {import("electron").WebContents} ipc
 * @returns
 */
async function login(browser, account_info, ipc) {
  console.log("Logging in " + account_info.username);
  const page = await newPage(browser, account_info);
  let user_cookies_path =
    cookies_path + "/cookies_" + account_info.username + ".json";
  let cookies = null;

  try {
    const cookiesString = await fsP.readFile(user_cookies_path);
    cookies = JSON.parse(cookiesString);
  } catch (e) {
    if (e.code == "ENOENT") {
      console.error("NO COOKIES");
    } else {
      console.error("login:", e);
    }
  }

  if (await login_with_cookies(page, cookies, ipc)) {
    cookies = await page.cookies();
    await fsP.writeFile(user_cookies_path, JSON.stringify(cookies, null, 2));
    return page;
  }

  console.log("plan B de connection");

  if (await login_with_account_info(page, account_info, ipc)) {
    cookies = await page.cookies();
    await fsP.writeFile(user_cookies_path, JSON.stringify(cookies, null, 2));
    return page;
  }
}

/**
 *
 * @param {Page} page
 * @param {*} cookies
 * @param {import("electron").WebContents} ipc
 * @returns
 */
async function login_with_cookies(page, cookies, ipc) {
  if (!cookies) {
    return false;
  }

  try {
    await page.setCookie(...cookies);
    await page.goto("https://twitter.com/login", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction('window.location.pathname == "/home"');

    console.log("COOKIES GOOD");
    ipc.send("new_user_state", {
      type: "success",
      message: "Login good",
    });
    return true;
  } catch (e) {
    console.log("BAD COOKIES");
    console.error("login:", e);
    return false;
  }
}

/**
 *
 * @param {Page} page
 * @param {*} account_info
 * @param {import("electron").WebContents} ipc
 * @returns
 */
async function login_with_account_info(page, account_info, ipc) {
  try {
    await page.goto("https://twitter.com/login", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForFunction('window.location.pathname == "/i/flow/login"');

    let username_selector = "input[autocomplete='username']";
    await page.waitForSelector(username_selector);
    await page.focus(username_selector);
    await page.keyboard.type(account_info.username);

    await page.keyboard.press("Enter");
    await wait(1000);

    const email_alerts = await page.evaluate(() => {
      return !!document.querySelectorAll("div[role='alert']");
    });

    if (!!email_alerts.length) {
      console.log("BAD LOGIN");
      ipc.send("new_user_state", {
        type: "error",
        message: "Bad Login",
      });
      return false;
    }

    let password_selector = "input[autocomplete='current-password']";
    await page.waitForSelector(password_selector);
    await page.focus(password_selector);
    await page.keyboard.type(account_info.password);

    await page.keyboard.press("Enter");
    await wait(1000);

    const login_alerts = await page.evaluate(() => {
      return !!document.querySelectorAll("div[role='alert']");
    });

    if (!!login_alerts.length) {
      console.log("BAD LOGIN");
      ipc.send("new_user_state", {
        type: "error",
        message: "Bad Login",
      });
      return false;
    }

    await page.waitForFunction(
      '["/home", "/login/error", "/account/login_challenge"].includes(window.location.pathname)'
    );
    let pathname = await page.evaluate("window.location.pathname");

    if (pathname == "/home") {
      console.log("LOGIN GOOD");
      ipc.send("new_user_state", {
        type: "success",
        message: "Login good",
      });
      return true;
    }

    if (pathname == "/account/login_challenge") {
      console.log("LOGIN CHALLENGE");
      ipc.send("new_user_state", {
        type: "error",
        message: "Login Challenge",
      });
      return false;
    }
  } catch (e) {
    console.error("login:", e);
    ipc.send("new_user_state", {
      type: "error",
      message: e.message,
    });
    return false;
  }
}

/**
 *
 * @param {Browser} browser
 * @param {*} account_info
 * @returns
 */
async function newPage(browser, account_info) {
  var page = await browser.newPage();
  await page.authenticate({
    username: account_info.proxy_username,
    password: account_info.proxy_password,
  });
  return page;
}

const GET_ATTRIBUTE = "((element, name) => element.getAttribute(name))";

async function getAttribute(element, name) {
  return await element.evaluate(eval(GET_ATTRIBUTE), name);
}

/**
 *
 * @param {Browser} browser
 * @param {*} account_info
 * @param {*} user_to_follow
 */
async function follow_someone(browser, account_info, user_to_follow) {
  let page = await newPage(browser, account_info);
  console.log(user_to_follow);
  await page.goto("https://twitter.com/" + user_to_follow);

  let selector_follow = "[data-testid*=-follow]";
  let selector_unfollow = "[data-testid*=-unfollow]";
  let handle = await page.waitForSelector(
    [selector_follow, selector_unfollow].join(", "),
    { visible: true }
  );
  let dataTestId = await getAttribute(handle, "data-testid");

  if (dataTestId.indexOf("-follow") >= 0) {
    await page.click(selector_follow);
    await wait(1200);
  }

  await page.close();
}

module.exports.login = login;
module.exports.newPage = newPage;
module.exports.follow_someone = follow_someone;
module.exports.login_with_account_info = login_with_account_info;
