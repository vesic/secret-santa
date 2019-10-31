const { subscriptions } = require("../shared");
const { Santa } = require("../models/santa");

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


  app.get('/launch', async (req, res) => {
    const all = (await Santa.find({}).select('-password'));
    let alreadyAssigned = [];
    let receiving;
    const pairs = all.map((santa, index, santas) => {
      let allButThis = santas.filter(s => s._id !== santa._id);
      for (let santa of allButThis) {
        if (alreadyAssigned.includes(santa)) continue;
        else {
          alreadyAssigned.push(santa);
          receiving = santa._id;
          break;
        }
      }
      return {
        from: santa._id,
        to: receiving
      }
    })
    const promises = pairs.map(async pair => {
      let from = await Santa.findById(pair.from);
      let to = await Santa.findById(pair.to);
      return webPush.sendNotification(JSON.parse(from.registration), JSON.stringify(to.email))
    });
    await Promise.all(promises);
    res.send(pairs);
  });
};
