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

      const isDiffMessage = oldMessage.ts != ts;

      if (!oldMessage.reactions || !Array.isArray(oldMessage.reactions)) {
        oldMessage.reactions = [];
      }

      const hasReaction = this.reactions.find((react) =>
        oldMessage.reactions.find((r) => r.name == react)
      );

      if (hasReaction || isDiffMessage) {
        return this.popQueue(ts);
      }

      await publishMessage(
        channelId,
        `<${
          process.env.SLACK_GROUP_ID
        }> This pull-request timed out. ${getLinkMessage({ channelId, ts })}`
      );

      this.popQueue(ts);

      this.schedule({ channelId, ts });
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
