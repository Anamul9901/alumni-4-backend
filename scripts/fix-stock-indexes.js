// Run this script to fix the stock collection indexes
// Usage: mongosh "mongodb://app_user:app_password@127.0.0.1:27017/scgroup?authSource=scgroup&replicaSet=rs0" < fix-stock-indexes.js

use scgroup;

// Drop the old unique index on product field
db.stocks.dropIndex("product_1");

// Create the new compound unique index
db.stocks.createIndex(
  { product: 1, branch: 1, company: 1 },
  { unique: true }
);

print("Indexes updated successfully!");
print("Current indexes:");
printjson(db.stocks.getIndexes());
