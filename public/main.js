const app = new App();
const router = new Router();

router.get("/home", req => {
  console.log(req.path);
  app.renderHome();
});

router.get("/about", req => {
  console.log(req.path);
  app.renderAbout();
});

router.get("/login", req => {
  console.log(req.path);
  app.renderLogin();
});

router.init();
