export default {
  slash: {},
  bot: {},

  registerSlash(matcher) {
    this.slash[matcher.name] = matcher;
  },

  registerBot(matcher) {
    this.bot[matcher.name] = matcher;
  },
};

