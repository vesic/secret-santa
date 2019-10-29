const subscriptions = require("../shared/subscriptions.js");

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
      webPush.sendNotification(sub, "Hola.")
    );
    await Promise.all(promises);
    res.sendStatus(201);
  });
};
