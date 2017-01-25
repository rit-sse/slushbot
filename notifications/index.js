
export default function registerNotifications(slushbot) {
  slushbot.api.chat.postMessage({
    text: 'Did it work?',
    channel: 'sse-tech',
  }, (err, res) => {
    if (!err) {
      console.log(res);
    } else {
      console.log(err);
    }
  });
}
