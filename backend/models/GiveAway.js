class GiveAway {
  constructor(
    id,
    status_id,
    user_to_follow,
    text_to_add,
    need_like,
    need_rt,
    tag_friend,
    nb_friend_to_tag,
    provider_id,
    link,
    provider_screen_name,
    flash_giveaway
  ) {
    this.id = id;
    this.status_id = status_id;
    this.follow_provider = true;
    this.user_to_follow = user_to_follow;
    this.text_to_add = text_to_add;
    this.need_like = need_like;
    this.need_rt = need_rt;
    this.tag_friend = tag_friend;
    this.nb_friend_to_tag = nb_friend_to_tag;
    this.provider_id = provider_id;
    this.link = link;
    this.provider_screen_name = provider_screen_name;
    this.flash_giveaway = flash_giveaway;
    this.isFinished = false;
    this.isRunning = false;
    this.progress = "";
    this.timeStamp = Math.floor(Date.now() / 1000);
    this.users = [];
  }
}
