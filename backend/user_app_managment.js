const Twitter = require("twitter-lite");
var http = require("http");
var url = require("url");
var querystring = require("querystring");

//pupeteer things
const fs = require("fs").promises;
const fsS = require("fs");
const electron = require("electron");
const cookies_path =
  (electron.app || electron.remote.app).getPath("userData") + "/cookies";
if (!fsS.existsSync(cookies_path)) {
  fsS.mkdirSync(cookies_path);
}
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

function getChromiumExecPath() {
  return puppeteer.executablePath().replace("app.asar", "app.asar.unpacked");
}

const wait = (timeout) =>
  new Promise((res) => setTimeout(() => res(), timeout));

const login_with_account_info = require("./twitter").login_with_account_info;

// TODO: fold into twitter.login
async function add_new_proxy_user(user_data, users_DS, settings_ds, ipc) {
  /*
  lunar.astroproxies.com:7777:customer-astro_4198358-cc-fr-sessid-McGdpr5fHcuN:bdc984c262
  lunar.astroproxies.com:7777:customer-astro_4198358-cc-fr-sessid-PTHnYsMiKYqW:bdc984c262
  lunar.astroproxies.com:7777:customer-astro_4198358-cc-fr-sessid-HFlABx1zMV3q:bdc984c262
  lunar.astroproxies.com:7777:customer-astro_4198358-cc-fr-sessid-RRTrGprKVhTF:bdc984c262
  username: "launcher112",
  password: "NVP16K7F"
  */

  account_info = user_data;

  const browser = await puppeteer.launch({
    args: [
      "--enable-features=NetworkService",
      "--proxy-server=" + account_info.proxyhost,
    ],
    ignoreHTTPSErrors: true,
    slowMo: 30,
    headless: settings_ds.get_D("bots_headless"),
    executablePath: getChromiumExecPath(),
  });

  try {
    const page = await browser.newPage();

    try {
      await page.authenticate({
        username: account_info.proxy_username,
        password: account_info.proxy_password,
      });

      try {
        await page.goto("https://twitter.com/login", {
          timeout: 100000,
          waitUntil: "domcontentloaded",
        });
        await page.waitForFunction(
          'window.location.pathname == "/i/flow/login"'
        );
        await wait(Math.random() * 4000 + 1500);
      } catch (err) {
        console.log("ERROR : ", err.message);
        ipc.send("new_user_state", {
          type: "error",
          message: err.message,
        });
        return;
      }

      await wait(1000);
      const [button_accept] = await page.$x("//button[contains(., 'Accept')]"); //click on save info
      if (button_accept) {
        await button_accept.click();
      }

      // authentifiction
      try {
        if (!(await login_with_account_info(page, account_info, ipc))) return;
      } catch (err) {
        ipc.send("new_user_state", {
          type: "error",
          message: err.message,
        });
        return;
      }

      await wait(3000);
      console.log("ok");
      let reg_error = new RegExp("error");

      if (reg_error.test(page.url())) {
        ipc.send("new_user_state", {
          type: "error",
          message: "Password incorect ",
        });
        console.log("ERROR");
        return;
      } else {
        console.log("Loog for challenge");
        await wait(1000);
        let regex1 = new RegExp("challenge|reset|begin_password_reset");
        console.log(page.url());
        if (regex1.test(page.url())) {
          ipc.send("new_user_state", {
            type: "error",
            message: "Please solve the challenge",
          });
          for (var i = 0; i < 100; i++) {
            await wait(2000);
            if (i == 98) {
              console.log("ERROR : ", "Challenge not completed" + i);
              ipc.send("new_user_state", {
                type: "error",
                message: "Challenge not completed",
              });
              return;
            }
            if (!regex1.test(page.url())) {
              break;
            }
          }
        }
        await wait(3000);
        console.log("LOGIN GOOD");
        ipc.send("new_user_state", {
          type: "success",
          message: "successfully added",
        });
        data_to_add = [
          account_info.username,
          account_info.username,
          account_info,
        ];
        users_DS.add_D(data_to_add);
      }

      const [button_save] = await page.$x("//button[contains(., 'Save')]"); //click on save info
      if (button_save) {
        await button_save.click();
      }
      await wait(1000);
      const cookies = await page.cookies();
      await fs.writeFile(
        cookies_path + "/cookies_" + account_info.username + ".json",
        JSON.stringify(cookies, null, 2)
      );
      await wait(400);
    } catch (err) {
      ipc.send("new_user_state", {
        type: "error",
        message: err.message,
      });
      console.log("ERROR : ", err.message);
    }
  } catch (err) {
    console.log("ERROR", err.message);
    ipc.send("new_user_state", {
      type: "error",
      message: err.message,
    });
  } finally {
    setTimeout(() => browser.close(), Math.random() * 15 * 1000 + 3000);
  }
}

function get_redirect_url(app_name, app_ds, mainWindow) {}

function add_new_app(name, tokens, app_ds, mainWindow) {}

module.exports.add_new_proxy_user = add_new_proxy_user;
module.exports.get_redirect_url = get_redirect_url;
module.exports.add_new_app = add_new_app;
