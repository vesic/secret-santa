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
    res.sendStatus(201);
  });

  app.get("/notify-all", async (req, res) => {
    const promises = Array.from(subscriptions.values()).map(sub =>
      webPush.sendNotification(sub, JSON.stringify("Notify All!"))
    );
    await Promise.all(promises);
    res.sendStatus(201);
  });


  app.get('/launch', async (req, res) => {
    const all = (await Santa.find({}).select('-password'));
    let alreadyAssigned = [];
    const pairs = all.map((santa, index, santas) => {
      let allButThis = santas.filter(s => s._id !== santa._id);
      let receiving;
      for (let santa of allButThis) {
        if (alreadyAssigned.includes(santa)) continue;
        else {
          alreadyAssigned.push(santa);
          receiving = santa;
          break;
        }
      }
      return {
        from: santa._id,
        to: receiving
      }
    })
    res.send({ table: pairs });
    const promises = Array.from(subscriptions.values()).map(sub =>
      webPush.sendNotification(sub, JSON.stringify(pairs))
    );
    await Promise.all(promises);
  });
};
