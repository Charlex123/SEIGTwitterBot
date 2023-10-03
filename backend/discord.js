const template = {
  "embeds": [
    {
      "title": null,
      "description": null,
      "url": null,
      "timestamp": null,
      "color": 529293,
      "footer": {
        "text": "Seig Robotics",
        "icon_url": null,
        "proxy_icon_url": null
      },
      "image": null,
      "thumbnail": {
        "url": "https://cdn.discordapp.com/attachments/689459597186039894/707246484646658049/image0.png",
        "proxy_url": null,
        "height": null,
        "width": null
      },
      "video": null,
      "provider": null,
      "author": null,
      "fields": [
        {
          "name": "Date",
          "value": null,
          "inline": true
        },
        {
          "name": "Receive on :",
          "value": null,
          "inline": true
        },
        {
          "name": "Sent by :",
          "value": null,
          "inline": true
        },
        {
          "name": "Message :",
          "value": null,
          "inline": false
        }
      ]
    }
  ]
};

function format_message(notif_data) {
  let message = JSON.parse(JSON.stringify(template));
  let embed = message.embeds[0];
  embed.title = "New seig " + notif_data.type;
  let fields = embed.fields;
  let [date_field, on_field, by_field, text_field] = fields;
  date_field.value = notif_data.date;
  on_field.value = "@" + notif_data.on;
  by_field.value = "@" + notif_data.by;
  text_field.value = notif_data.text;
  return message;
}

module.exports.format_message = format_message;
