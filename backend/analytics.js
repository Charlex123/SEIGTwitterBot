const request = require("request");

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function get_perso_id(settings_ds) {
  if (!settings_ds.get_D("perso_id")) {
    settings_ds.add_D("perso_id", makeid(20));
  }
  return settings_ds.get_D("perso_id");
}

function send_alive(id) {
  //request("http://51.83.99.197:5000/startbot?id=" + id)
  // try {
  //   request.get(
  //     "http://api.seigrobotics.com:5000/startbot?id=" + id,
  //     (error, res, body) => {
  //       if (error) {
  //         console.error(error);
  //         return;
  //       }
  //     }
  //   );
  // } catch (error) {
  //   console.error(error);
  // }
}

module.exports.get_perso_id = get_perso_id;
module.exports.send_alive = send_alive;
