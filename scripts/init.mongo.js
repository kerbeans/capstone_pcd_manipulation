/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo capstone scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/issuetracker scripts/init.mongo.js
 */
const { exist } = require("mongodb/lib/gridfs/grid_store");

const fs = require('fs');
const path = require('path');

let pointFiles = [];
let fileindex =1;

function readDirRecursively(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      readDirRecursively(filePath);
    } else {
      pointFiles.push({id:fileindex, fileName: file, filePath: filePath ,modifiedDate:new Date()});
      fileindex+=1;
    }
  }
}

const directoryPath = './data'; // Replace with the path to the directory you want to read

readDirRecursively(directoryPath);


db.pointFiles.remove({});
db.counters.remove({});

db.pointFiles.insertMany(pointFiles);
const count = db.pointFiles.count();
print('Inserted', count, 'PointFiles');

//The _id below is just a placeholder. The below collection, in fact, has only one row and one column. We can denote this by any name but we call this fixedindex.
db.counters.remove({ _id: 'fixedindex' });
db.counters.insert({ _id: 'fixedindex', current: count });
