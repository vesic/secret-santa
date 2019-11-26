const { subscriptions } = require("../shared");
const { Santa } = require("../models/santa");

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = function(app, route, webPush) {
  app.get("/vapidPublicKey", function(req, res) {
    res.send(process.env.VAPID_PUBLIC_KEY);
  });

  app.post("/register", function(req, res) {
    const { subscription } = req.body;
    if (!subscriptions.has(subscription.keys.auth)) {
      subscriptions.set(subscription.keys.auth, subscription);
    }
    console.log(subscriptions.entries());
    res.status(201).send({
      'subscription.keys.auth': subscription.keys.auth
    })
  });

  app.get("/notify-all", async (req, res) => {
    const registrations = (await Santa.find({})).map(s => s.registration);
    const promises = registrations.map(reg =>
      webPush.sendNotification(JSON.parse(reg), JSON.stringify("Notify All!"))
    );
    await Promise.all(promises);
    res.sendStatus(201);
  });

  app.get("/terminate", async (req, res) => {
    const registrations = (await Santa.find({})).map(s => s.registration);
    const promises = registrations.map(reg =>
      webPush.sendNotification(JSON.parse(reg), JSON.stringify("Terminate"))
    );
    await Promise.all(promises);
    res.sendStatus(201);
  });


  app.get('/launch', async (req, res) => {
    const santas = shuffle((await Santa.find({}).select('_id')))
    let pairs = []
    for (let i = 0; i < santas.length - 1; i++) {
      pairs = [...pairs, { from: santas[i], to: santas[i+1]}]
    }
    pairs = [...pairs, { from: santas[santas.length - 1], to: santas[0]}]
    const promises = pairs.map(async pair => {
      let from = await Santa.findById(pair.from);
      let to = await Santa.findById(pair.to);
      return webPush.sendNotification(JSON.parse(from.registration), JSON.stringify({data: to, type:"launch"}));
    });
    await Promise.all(promises);
    res.send(pairs);
  });
};
