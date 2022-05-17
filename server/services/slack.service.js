const slack = require("slack");

class Slack {
  static build() {
    return new Slack();
  }

  async readMessage(channelId, ts) {
    try {
      const response = await slack.conversations.history({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        latest: ts,
        limit: 1,
        inclusive: true,
      });

      return response.messages[0];
    } catch (error) {
      return {};
    }
  }

  async publishMessage(channelId, message) {
    const result = await slack.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL_ALERT_ID,
      text: message,
    });

    return result;
  }

  getLinkMessage({ channelId, ts }) {
    ts = !!~ts.indexOf(".") ? ts.replace(".", "") : ts;
    return `https://devmagic.slack.com/archives/${channelId}/p${ts}`;
  }
}

module.exports = Slack.build();
