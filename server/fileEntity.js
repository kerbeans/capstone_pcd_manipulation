const fs=require("fs")
const path=require("path")




ww



const createFolder=async (realpath)=>{
    const absPath=path.resolve(__dirname,realpath);
    try{
        await fs.promises.stat(absPath);
    }catch(e){
        await fs.promises.mkdir(absPath,{recursive:true});
    }
}





export default class fileManipulation{
    constructor(dataPath,userID){
        this.Path=dataPath+'/'+userID;
        createFolder(this.Path);
    }
    readFile(filePath){

    }
    deleteFile(pointcloudFile){


    }
    addFile(pointcloudFile){

    }
    editName(PointcloudFile,newName){

    }

}