/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo issuetracker scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/issuetracker scripts/init.mongo.js
 */


/* 请确保在运行此脚本之前已正确安装了 MongoDB Node.js 驱动程序。使用以下命令安装：

```bash
npm install mongodb*/

// node init.mongo.js 运行脚本指令

// init.mongo.js
const { MongoClient } = require("mongodb");

// 配置连接字符串
const uri = "mongodb+srv://CWC:Abc123@atlascluster.0jbciec.mongodb.net/test";

// 创建 MongoClient 实例
const client = new MongoClient(uri, { useUnifiedTopology: true });

// 主要的异步函数
async function main() {
  try {
    // 连接到数据库
    await client.connect();

    // 获取或创建一个名为 'pcdFiles' 的集合
    const pcdFilesCollection = client.db("your_database_name").collection("pcdFiles");

    // 插入一些初始数据，如果需要的话
    const initialData = [
      {
        fileName: "zeghtti.pcd",
        filePath: "/abc/zeghtti.pcd",
        uploadDate: new Date("2023-03-01T00:00:00Z"),
      },
      {
        fileName: "globalMap.pcd",
        filePath: "/ddd/globalMap.pcd",
        uploadDate: new Date("2023-03-02T00:00:00Z"),
      },
      {
        fileName: "mushapotei.pcd",
        filePath: "mushapotei.pcd",
        uploadDate: new Date("2023-03-03T00:00:00Z"),
     },
     {
        fileName: "npx.lac",
        filePath: "/bs/npx.lac",
        uploadDate: new Date("2023-03-04T00:00:00Z"),
     },
     ];

     // 将初始数据插入到 pcdFiles 集合中
    const result = await pcdFilesCollection.insertMany(initialData);
    console.log(`Successfully inserted ${result.insertedCount} documents.`);

    // 断开与数据库的连接
    await client.close();
    } 
    catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1);
    }
    }
    
    // 执行异步函数
    main();

