
const fs=require("fs")
const path=require("path")
const readline = require('readline');





const createFolder=async (realpath)=>{
    const absPath=path.resolve(__dirname,realpath);
    try{
        await fs.promises.stat(absPath);
    }catch(e){
        await fs.promises.mkdir(absPath,{recursive:true});
    }
}

export default class fileManipulator{
    constructor(dataPath,userID){
        this.Path=dataPath+'/'+userID;
        createFolder(this.Path);
    }
    async readPCDFile(filePath) {
        filePath='data/0/'+filePath;
        console.log(filePath);
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });
      
        let header = {};
        let readingHeader = true;
        let pointCloudData = [];
      
        for await (const line of rl) {
          if (readingHeader) {
            const [key, value] = line.split(' ').filter((x) => x !== '');
      
            if (key === 'DATA') {
              header[key] = value;
              readingHeader = false;
            } else {
              header[key] = parseFloat(value) || value;
            }
          } else {
            const [x, y, z] = line.split(' ').map((value) => parseFloat(value));
            pointCloudData.push({ x, y, z });
          }
        }
        return {header:header,pointCloudData:pointCloudData};
        //return { header, pointCloudData };
      }
    deleteFile(pointcloudPath){
      fs.unlink('data/0/'+pointcloudPath, (err) => {
          if(err) throw err;
          console.log('file deleted');
      })
    }

    saveFile(pointcloudFile){



    }
    editName(pointcloudFile,newName){
      fs.rename(pointcloudFile, newName, function (err) { 
        if (err) throw err; 
        console.log('File Renamed.'); 
      });
    }

}

console.log(__dirname);

function moduleTest(){
  // fs.readdir('../data', function(err, files) {
  //     // Handle error
  //     if (err) {
  //         return console.log('Unable to scan directory: ' + err);
  //     } 

  //     // Print each file name
  //     files.forEach(function(file) {
  //         console.log(file);
  //     });
  // });

  a=new fileManipulator('../data',0)
  data=a.readPCDFile('horse_n.pcd').then((b)=>{
      console.log(b);
  });
  // a.editName('data/0/horse_s.pcd','data/0/horse_n.pcd');
  //data=(()=>{ a.readPCDFile('Zaghetto.pcd')})();
  //console.log(data);;
  // a.deleteFile('Zaghetto.pcd')
}
moduleTest()
