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

db.pointFiles.remove({});
db.counters.remove({});

pointFiles=[{id:1,fileName:'horse_n.pcd',filePath:'./data/0/horse_n.pcd',modifiedDate:new Date()},
            {id:2,fileName:'created.pcd',filePath:'./data/0/created.pcd',modifiedDate: new Date()},
            {id:3,fileName:'created_new.pcd',filePath:'./data/0/created_new.pcd',modifiedDate: new Date()}]

db.pointFiles.insertMany(pointFiles);
const count = db.pointFiles.count();
print('Inserted', count, 'PointFiles');

//The _id below is just a placeholder. The below collection, in fact, has only one row and one column. We can denote this by any name but we call this fixedindex.
db.counters.remove({ _id: 'fixedindex' });
db.counters.insert({ _id: 'fixedindex', current: count });

db.pointFiles.createIndex({ id: 1 }, { unique: true });
db.pointFiles.createIndex({ fileName: 1 });
db.pointFiles.createIndex({ filePath: 1 });
db.pointFiles.createIndex({ modifiedDate: 1 });