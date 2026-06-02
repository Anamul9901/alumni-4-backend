// filepath: scripts/mongo-init.js
// Initializes replica set and app user for Dockerized MongoDB

rs.initiate(
  {
    _id: "rs0",
    members: [{ _id: 0, host: "mongodb:27017" }]
  }
);

const admin = db.getSiblingDB('admin');
admin.auth('root', 'rootpassword');

const appDb = db.getSiblingDB('scgroup');
appDb.createUser({
  user: 'app_user',
  pwd: 'strong_pass',
  roles: [{ role: 'readWrite', db: 'scgroup' }]
});
