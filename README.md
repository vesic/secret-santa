## Getting Started

clone the repo

```
cd secret-santa

npm i

touch .env
// add these keys
MY_KEY="mykey"
MONGO_URL="mongodb://user:user123@ds039281.mlab.com:39281/secret-santa"
VAPID_PUBLIC_KEY="BBg5Rse2PeR4Twm4wiee-NY_LR2PJGXP3nMdeM-QIIRp_OerDtk2n4BFYKxzde9xjGcEm0lt6shozbGKz-Uvx-Q"
VAPID_PRIVATE_KEY="hbWZ9MnYHEKb185ROjY6I_tlCp-Wz52-JEY7DWEctGI"

// dev friendly
sudo npm i -g nodemon && nodemon index.js

// not so dev friendly
node index.js

open http://localhost:3000
````