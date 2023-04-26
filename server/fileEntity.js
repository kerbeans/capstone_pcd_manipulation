
const fs=require("fs")
const path=require("path")
const readline = require('readline');





const createFolder=async (realpath)=>{
    const absPath=realpath;
    try{
        await fs.promises.stat(absPath);
    }catch(e){
        await fs.promises.mkdir(absPath,{recursive:true});
    }
}



class fileManipulator{
    constructor(dataPath,userID){
        this.Path=dataPath+'/'+userID;
        createFolder(this.Path);
    }
    async readPCDFile(filePath) {
      const filename=filePath;
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
          const kav=line.split(' ');
          const key =kav[0];
          const value =kav.splice(1,kav.length).join(' ');
          // const [key, value] = line.split(' ').filter((x) => x !== '');
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
        return {header:header,pointCloudData:pointCloudData,fileName:filename};
        //return { header, pointCloudData };
      }

    deleteFile(pointcloudPath){
      fs.unlink(pointcloudPath, (err) => {
          if(err) throw err;
          console.log('file deleted');
      })
    }

    async saveFile(pointData,filename){
      let pcdHeader = '';
      for(var i in pointData.header){
        if (i==="#"){
          pcdHeader=pcdHeader+"NOTE"+' '+pointData.header[i]+'\n';
          continue;
        }
        pcdHeader=pcdHeader+i+' '+pointData.header[i]+'\n'
      }
        // Write point data
      let pcdData = pointData.pointCloudData.map(point => `${point.x} ${point.y} ${point.z}`).join('\n');
        
        // Combine header and point data, then write to file
      let pcdContent = pcdHeader + pcdData + '\n';
      let signal=false;
      fs.writeFile(filename, pcdContent,(error)=>{
        if(error){
          console.log('saving error',error);
          signal=false;
        }
        else{
          console.log('sucessfully writen');
          signal=true;
        }
        });
      return signal;
    }


    changeFileName(oriName,newName){
      return fs.rename(oriName, newName, function (err) { 
        if (err) {
          return false;
        }
        else{
        console.log('File Renamed.'); 
        return true;
        }
      })

    }

}

module.exports= fileManipulator; 

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

  a=new fileManipulator('./data',0)
  data=a.readPCDFile('created.pcd').then((b)=>{
      a.saveFile(b,'created_new.pcd');
  });
  // a.editName('data/0/horse_s.pcd','data/0/horse_n.pcd');
  //data=(()=>{ a.readPCDFile('Zaghetto.pcd')})();
  //console.log(data);;
  // a.deleteFile('Zaghetto.pcd')
}
