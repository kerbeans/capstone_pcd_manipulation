import fileManipulation from './fileEntity';


const fs =require('fs');
const express = require('express');
const {ApolloServer}=require('apollo-server-express');
const {GraphQLScalarType} = require('graphql');
const {MongoClient} = require('mongodb');
const {Kind} =require('graphql/language');
const FILEPATH='./data'

const fm=fileManipulation(FILEPATH,0)

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


async function fileList(_,{userid,filterKey,page}){
    return db.connection('pointFiles').findMany({$contain:{fileName:filterKey}}).toArray().slice((page-1)*10,page*10);
}

function fileAdd(_,{userid,pointcloudFile}){

}



function fileDelete(){

}

function fileRename(){


}


const app=express();
app.use(express.static('public'));

const resolvers={
    Query:{
        fileList
    },
    Mutation:{
        fileAdd
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




