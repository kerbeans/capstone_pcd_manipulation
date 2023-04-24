import fileManipulator from './fileEntity';


const fs =require('fs');
const express = require('express');
const {ApolloServer}=require('apollo-server-express');
const {GraphQLScalarType} = require('graphql');
const {MongoClient} = require('mongodb');
const {Kind} =require('graphql/language');
const FILEPATH='./data'
let db
const fm=fileManipulator(FILEPATH,0)

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
    return db.connection('pointFiles').findMany({$contain:{fileName:filterKey}}).toArray().slice((page-1)*10,page*10).toArray();
}

async function chageFileName(_,{userid,oriName,newName}){//unfinished *
    const res = await db.connection('pointFiles').findOneAndUpdate({fileName:{$eq:oriName}},{$set:{fileName:newName}},{returnOriginal:false});
    //update filepath 
    if(res){
        const fp=db.connection('pointFiles').findOne({fileName:{$eq:newName}});
        fm.chageFileName(oriName,newName)


        return true;
    }
    else
        return false;
}

async function deleteFile(_,{userid,fileName}){
    const res=await db.connection('pointFiles').findOne({fileName:{$eq:fileName}});
    if(!res)
        return false;
    else if(fs.existsSync(res.filePath)){
        fm.deleteFile(res.filePath);
        await db.connection('pointFiles').deleteOne({fileName:fileName})
        return true;
    }
    else 
        return false;
}

function downloadFile(){

}

function uploadFile(){
    
}


const app=express();
app.use(express.static('public'));

const resolvers={
    Query:{
        fileList
    },
    Mutation:{
        chageFileName,
        deleteFile,
        downloadFile,
        uploadFile,
    },
    GraphQLDate,
}


const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql','utf-8'),
    resovlers,
    formateError:error=>{
        console.log(error);
        return error;
    }
})
server.applyMiddleware({app,path:'/graphql'});

async function connectToDb(){
    const url='mongodb://localhost/capstone';
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




