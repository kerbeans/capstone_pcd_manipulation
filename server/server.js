//import fileManipulator from './fileEntity.js';


const fs =require('fs');
const express = require('express');
const {ApolloServer}=require('apollo-server-express');
const {GraphQLScalarType} = require('graphql');
const {MongoClient} = require('mongodb');
const {Kind} =require('graphql/language');
const fileManipulator=require('./fileEntity.js');
const FILEPATH='./data'
let db

const fm=new fileManipulator('./data',0);

const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQLDate',
    description: 'A Date() type in GraphQL as a scalar',
    serialize(value) {
      return value.toISOString();
    },
    parseValue(value) {
      console.log(value)
      const dateValue = new Date(value);
      return isNaN(dateValue) ? undefined : dateValue;
    },
    parseLiteral(ast) {
      if (ast.kind == Kind.STRING) {
        const value = new Date(ast.value);
        return isNaN(value) ? undefined : value;
      }
    },
  });


async function fileList(_,{userid,filterKey,page}){//finished 
    if(filterKey===""){
        var res=await db.collection('pointFiles').find().toArray();//.slice((page-1)*10,page*10).toArray();
        if(res.length>10*(page-1)){
             res=res.splice((page-1)*10,page*10);
             return res;
        }
        else{
            return [];
        }
    }
    else
        return db.collection('pointFiles').findMany({$contain:{fileName:filterKey}}).toArray().slice((page-1)*10,page*10).toArray();
}

async function changeFileName(_,{userid,oriName,newName}){//unfinished *
    var res = await db.collection('pointFiles').find({fileName:oriName}).toArray();
    if(res.length<1)
        return false;
    var path=res[0].filePath.split("/");//.join()
    path[path.length-1]=newName;
    path=path.join("/")
    //update filepath 
    if(fs.existsSync(res[0].filePath) && !fs.existsSync(path)){
        fm.changeFileName(oriName,newName);
        await db.collection('pointFiles').findOneAndUpdate({fileName:oriName},{$set:{fileName:newName,filePath:path,modifiedDate:new Date()}},{returnOriginal:false});
        return true;
    }
    else{
        return false;
    }
}

async function deleteFile(_,{userid,fileName}){
    const res=await db.collection('pointFiles').find({fileName:fileName}).toArray();
    if(res.length<1){
        return false;
    }
    else if(fs.existsSync(res[0].filePath)){
        fm.deleteFile(res[0].filePath);
        await db.collection('pointFiles').deleteOne({fileName:fileName})
        return true;
    }
    else 
        return false;
}

async function downloadFile(_,{userid,fileName}){//download from server to local
    const res= await db.collection('pointFiles').find({fileName:fileName}).toArray();
    if(res.length>=1){
        return fm.readPCDFile(res.filePath);
    }
    else 
    return {header:false,pointCloudData:[],fileName:fileName};
}

async function uploadFile(_,{userid,pointd}){//upload to server
    if(fm.saveFile(pointd,pointd.fileName)){
        async function getNextSequence(name) {
            const result = await db.collection('counters').findOneAndUpdate(
                { _id: name },//find the entry that matches this _id
                { $inc: { current: 1 } }, //perform the update
                { returnOriginal: false },//do not return the old value, only updated counter value.
            );
            return result.value.current;
        }
        let fileDesc={
            fileName:pointd.fileName,
            filePath:fm.Path+'/'+pointd.fileName,
            modifiedDate:new Date()}
        var res =await db.collection('pointFiles').find({fileName:pointd.fileName}).toArray();
        if(res.length<1){
            fileDesc.id = await getNextSequence('fixedindex');
            res=await db.collection('pointFiles').insertOne(fileDesc);
            return fileDesc.id;
        }
        else{
            res = await db.collection('pointFiles').findOneAndUpdate({fileName:pointd.fileName},{$set:{modifiedDate:new Date()}},{returnOriginal:true});
            return res.value.id;
        }
    }
    else{
        return -1;
    }
    
}


const app=express();
app.use(express.static('public'));

const resolvers={
    Query:{
        fileList
    },
    Mutation:{
        changeFileName,
        deleteFile,
        downloadFile,
        uploadFile,
    },
    GraphQLDate,
}


const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql','utf-8'),
    resolvers,
    formateError:error=>{
        console.log(error);
        return error;
    }
});

(async () => {
    // Make sure to call and await server.start()
    await server.start();

    // Then you can call applyMiddleware()
    server.applyMiddleware({ app, path: '/graphql' });

})();
// server.applyMiddleware({app,path:'/graphql'});

async function connectToDb(){
    const url='mongodb://localhost/pointFiles';
    // const client=new MongoClient(url,{userNewUrlParser:true,useUnifiedTopology:true});
    const client=new MongoClient(url,{userNewUrlParser:true,useUnifiedTopology:true});
    await client.connect();
    console.log('connected to capstone MongoDB at',url);
    db=client.db();
}


(async function(){
    try{
        await connectToDb();
        app.listen(3000,function(){
            console.log('App started on port 3000');
        });
    }catch(err){
        console.log("ERROR",err);
    }
})();




