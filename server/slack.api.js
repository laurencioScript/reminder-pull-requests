const Slack = require("slack");

async function readMessage(channelId, ts) {
  try {
    const response = await Slack.conversations.history({
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

async function publishMessage(channelId, message) {
  const result = await Slack.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_CHANNEL_ALERT_ID,
    text: message,
  });

  return result;
}

function getLinkMessage({ channelId, ts }) {
  ts = !!~ts.indexOf(".") ? ts.replace(".", "") : ts;
  return `https://devmagic.slack.com/archives/${channelId}/p${ts}`;
}

module.exports = { readMessage, publishMessage, getLinkMessage };
