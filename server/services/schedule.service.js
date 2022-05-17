const {
  getLinkMessage,
  publishMessage,
  readMessage,
} = require("./slack.service");

class SchedulePullRequets {
  queuePR;
  reactions;
  minutesDelay;
  delay;

  constructor() {
    this.queuePR = [];
    this.reactions = ["pr_approved", "pr_reviewing", "pr_disapproved"];
    this.minutesDelay = process.env.DELAY || 5;
    this.delay = this.minutesDelay * 60 * 1000;
  }

  static build() {
    return new SchedulePullRequets();
  }

  async schedule({ channelId, ts }) {
    if (this.queuePR.find((prId) => prId == ts)) {
      return;
    }

    this.queuePR.push(ts);

    setTimeout(async () => {
      const oldMessage = await readMessage(channelId, ts);

      if (oldMessage.ts != ts) {
        return popQueue(ts);
      }

      oldMessage.reactions =
        oldMessage.reactions && oldMessage.reactions.length
          ? oldMessage.reactions
          : [];

      if (
        this.reactions.find((react) =>
          oldMessage.reactions.find((r) => r.name == react)
        )
      ) {
        return popQueue(ts);
      }

      await publishMessage(
        channelId,
        `<${
          process.env.SLACK_GROUP_ID
        }> This pull-request timed out. ${getLinkMessage({ channelId, ts })}`
      );

      popQueue(ts);

      schedule({ channelId, ts });
    }, this.delay);
  }

  popQueue(ts) {
    this.queuePR = this.queuePR.filter((prId) => prId != ts);
  }

  getQueue() {
    return this.queuePR;
  }

  resetQueue() {
    this.queuePR = [];
  }
}

module.exports = SchedulePullRequets.build();
