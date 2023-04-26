import {memo, useState, useCallback,useMemo,useRef} from 'react'
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Testpanel from './Testpanel';
import { Layout, Space, FloatButton, Alert } from "antd";
import { PCDLoader } from '../../node_modules/three/examples/jsm/loaders/PCDLoader.js';


// props.fileToWorkspaceHandler # drag file from server to workspace
// props.fileUploadHandler # drag file from workspace to server
// props.closeFileHandler # close the working file
// props.tickDisplayHandler # set display attribute on wokingFiles
// props.tickIdx # select which to be editted on

const GRAPHQL_SERVER_URL = 'http://155.138.208.234:5000/graphql';

const {Sider, Content } = Layout;

const contentStyle = {
    textAlign: 'center',
    minHeight: 1400,
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#1E1E1E',
};
const siderStyle = {
     backgroundColor: '#1E1E1E',
};

const buttonstyle={
  border: 'none',
  marginRight:10,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  padding: 0,
};
const dummyStyle = {
    border: "0.5px dashed gray",
    padding: "0.5rem",
    margin: "1rem",
    backgroundColor: "#e0e0e0",
    borderRadius: "0.5rem",
};


const WorkspaceItem= memo(function WorkspaceItem({info,children,onCheckboxChange, isSelected}){
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: 'work',
        item:{info},
        collect: (monitor) => ({
          isDragging: monitor.isDragging()
        })
      }),
      [info]
    );

    const style = useMemo(
      () => ({
        ...dummyStyle,
        backgroundColor:'#B3E5FC',
        opacity: isDragging ? 0.4 : 1,
        cursor: "move",
        display: 'flex',
        alingItem: 'center',
      }),
      [isDragging]
    );

    const handleCheckboxChange = (event) => {
      if (onCheckboxChange) {
        onCheckboxChange(info, event.target.checked);
      }
    };

    return (
      <div ref={drag} style={style}>
        <input type="checkbox" onChange={handleCheckboxChange} checked={isSelected}/>
        <small>{info.id}. </small>
        <small>{info.fileName}*</small>
      </div>
    );
});

const SearchItem=memo(function SearchItem({info, onCheckboxChange, isSelected}){
    const [{ isDragging }, drag] = useDrag(
        () => ({
          type: 'search',
          item:{info},
          canDrag: true,
          collect: (monitor) => ({
            isDragging: monitor.isDragging()
          })
        }),
        [info]
    );

    const style={
        ...dummyStyle,
        opacity:isDragging?0.4:1,
        cursor:"move",
        display: 'flex',
        alingItem: 'center',
    }

    const handleCheckboxChange = (event) => {
      if (onCheckboxChange) {
        onCheckboxChange(info, event.target.checked);
      }
    };

    return (
        <div ref={drag} style={style} role={'SourceBox'}>
        <input type="checkbox" onChange={handleCheckboxChange} checked={isSelected}/>
        <small>{info.id}. </small>
        <small>{info.fileName}</small>
    </div>
    );
});

const Container=memo( function Container({onDrop,contents,accept}){
    const [{isOver},drop]= useDrop(()=>({
        accept: accept,
        drop(_item,monitor){
            onDrop(monitor.getItem());
            return undefined;
        },
        collect:(monitor)=>({
            isOver:monitor.isOver()
        })
    }),[onDrop]);

    let backgroundColor=isOver?'#bdbdbd':'#616161';

    const style={
        ...dummyStyle,
        backgroundColor:backgroundColor
    }

    return (
        <div ref={drop}
            style={style}
        >
          {contents}

        </div>

    )
});


//删除物件
function deleteItem(item,list,key){
  let newList=[];
  console.log('init',item,list);
  for(var i in list){
    console.log(item[key],list[i][key],'what');
    if(item[key]!=list[i][key]){
      newList.push(list[i]);
    }
  }
  console.log(newList,'newlist');
  return newList;
}
//发送一个请求

//往下拖就保存，往上拖加载

//不要设置保存了，直接往下拖

//删除功能



export default function SearchPanel(props){
    const ref = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [inputText, setInputText] = useState('');
    const [workingFiles, setWrokingFiles]=useState([]);
    const [checkFiles, setCheckFiles]=useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedServerfilesId, setSelectedserverFilesid] = useState(null);
    const [selectedServerfilesName, setSelectedserverFilesname] = useState(null);
    const [selectedServerfileChecked, setSelectedserverFileChecked] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const userid = props.userid
    const toWorkspace=useCallback((item)=>{
      const newitem={...item.info,display:false}
      for(var i in workingFiles){
        if(newitem.id===workingFiles[i].id)
          return undefined;
      }
      setWrokingFiles([...workingFiles,newitem]);
    },[workingFiles]);

    const toServer=useCallback(async (item)=>{
      const newItem={
        id:item.info.id,
        fileName:item.info.fileName,
        filePath:item.info.filePath
      };
      setWrokingFiles(deleteItem(newItem,workingFiles,'id'));
      //console.log("newltem",newItem.fileName.split('.')[0])
      await ref.current.updatemodel(newItem.fileName.split('.')[0]);
      console.log('finished')
      props.updateList();
    },[workingFiles])

    const handleCheckboxChange = (info, isChecked) => {
      setSelectedId(isChecked ? info.id : null);
      setCheckFiles(info);
    };

    const handleSelectedserverFile = (info, isChecked) => {
      console.log("serverfile",info)
      setSelectedserverFileChecked(isChecked);
      setSelectedserverFilesname(isChecked ? info.fileName : null);
      setSelectedserverFilesid(isChecked ? info.id : null);
    }

    const handleDownload=()=>{
      ref.current.saveModelbyName();
    }

    const handleDownloadAll=()=>{
      ref.current.saveAllmodel();
    }

    const saveAsmesh=()=>{
      if(selectedId === null){
        alert("Please select a file")
      }
      else{
        ref.current.saveAsmesh(checkFiles.fileName.split('.')[0]);
      }
    }

    const saveAsimage=()=>{
      ref.current.saveAsimage();
    }

    const handlerename=()=>{
      if(selectedServerfileChecked){
        setShowModal(true);
      }
      else{
        alert('Please select a file')
      }
    }

    const handleAxis=()=>{
      ref.current.showaxis();
    }

    const handleCloseModal = () => {
      setShowModal(false);
    };

    const handleInputChange = (event) => {
      setInputText(event.target.value);
    };

    async function changeFileName(oriName, newName) {
      const mutation = `
        mutation ChangeFileName($userid: Int! $oriName: String!, $newName: String!) {
          changeFileName(userid: $userid, oriName: $oriName, newName: $newName)
        }
      `;
    
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            oriName: oriName,
            newName: newName,
            userid: props.userid
          },
        }),
      };
    
      const response = await fetch(GRAPHQL_SERVER_URL, requestOptions);
      const data = await response.json();
      console.log(data)
      //return data.data.changeFileName;
    }

    const handleRenamesubmit = async () => {
      console.log("输入的文本：", inputText);
    
      try {
        await changeFileName(selectedServerfilesName, inputText + ".pcd");
        // 重新请求一次服务器文件列表
        // 例如，调用获取文件列表的函数
      } catch (error) {
        console.error("文件名更改失败：", error);
      }
      handleCloseModal();
      props.updateList();
    };

    const handlePageChange = (newPage) => {
      console.log("aasd")
      console.log(props.maxpage)
      if(newPage===0){
        //props.filterServerFiles(1);
        console.log("aasasd")
        setCurrentPage(1);
      }
      else if(newPage===props.maxpage+1){
        //props.filterServerFiles(props.maxpage);
        console.log("aas1111d")
        setCurrentPage(props.maxpage);
      }
      else{
        //props.filterServerFiles(newPage);
        console.log("aas1234d")
        setCurrentPage(newPage);
      }
      
    };

    const submitfile=()=>{
      ref.current.submittoserver();
    };

    const handleDelete = async()=>{
      if(selectedServerfileChecked){
        const query = `
          mutation DeleteFile($userid: Int!, $fileName: String!) {
            deleteFile(userid: $userid, fileName: $fileName)
          }
        `;
      
        const variables = {
          fileName: selectedServerfilesName,
          userid: props.userid
        };

        const response = await fetch(GRAPHQL_SERVER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            variables: variables,
          }),
        });

        const result = await response.json();
        await props.updateList()
      }
    }

    const handledeleteworkingfile = () =>{
      ref.current.deleteworkingfile();
      for(var i in workingFiles){
        if(workingFiles[i].id===selectedId){
          setWrokingFiles(deleteItem(workingFiles[i],workingFiles,'id'));
        }
      }
    }

    const fileInputRef = useRef(null);

    const handleopenfileclick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      console.log(file)
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e.target.result)
        const loader = new PCDLoader();
        loader.parse(e.target.result, (points) => {
          console.log(points)
        });
      }
      reader.readAsArrayBuffer(file);
    };

    return(
      <Space
        direction="vertical"
        style={{
          width: '100%'
          }}
          size={[0, 48]}>
        <Layout>
          <Sider width={'20%'} height={'100%'} style={siderStyle}>
            <DndProvider backend={HTML5Backend}>
                <input style={{display: 'none'}} id="read_file" type="file" onChange={(event)=>{
                  const filePath = event.target.value; 
                  var fileName=filePath.split('\\');
                  fileName=fileName[fileName.length-1];        
                  var fileType=fileName.split('.');
                  fileType=fileType[fileType.length-1];
                  const item={
                    id:Math.floor(Math.random()*1000),
                    fileName:fileName,
                    filePath:filePath,
                    display:false
                  }
                  setWrokingFiles([...workingFiles,item]);
                }}/>
                <div style={{display:'flex', padding:'20px 20px 0px 20px'}}>

                <button onClick={handleDownload} style={buttonstyle} title='download'>
                  <svg t="1682355462532" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="50677" width="20" height="20"><path d="M498.176 726.2208a31.9488 31.9488 0 0 0 45.1072 0.6144l263.0144-255.232a31.9488 31.9488 0 0 0-22.1184-54.8864l-143.36-0.512V104.6016h-235.52v310.7328L270.7456 414.72a31.8976 31.8976 0 0 0-22.9888 54.272z" fill="#707070" p-id="50678"></path><path d="M904.704 609.8944l-168.0384 0.6144-157.696 153.0368a83.3024 83.3024 0 0 1-117.4528-1.6896l-146.0224-149.8624-204.8 0.6656h-23.04v219.0336a109.568 109.568 0 0 0 109.4656 109.4144h644.1984a109.568 109.568 0 0 0 109.4656-109.4144v-221.7984z" fill="#707070" p-id="50679"></path></svg>                
                </button>
                <button onClick={handleDownloadAll} style={buttonstyle} title='downloadall'>
                  <svg t="1682355511933" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="51376" width="20" height="20"><path d="M596.3776 502.1184l-218.112-357.1712a48.5888 48.5888 0 0 0-41.5232-23.808 48.5376 48.5376 0 0 0-41.5232 23.7568l-217.6 354.9184a53.6576 53.6576 0 0 0 1.1776 57.9072l226.8672 336.7936a48.6912 48.6912 0 0 0 40.3456 21.9648h0.8192a48.9472 48.9472 0 0 0 40.4992-23.3984l208.7936-334.592a54.1696 54.1696 0 0 0 0.256-56.3712z" fill="#707070" p-id="51377"></path><path d="M743.2704 461.4656l-221.9008-335.4112a38.4 38.4 0 0 0-64.0512 42.3936l221.9008 335.36a45.2096 45.2096 0 0 1 0 50.4832l-211.2512 312.32a38.4 38.4 0 0 0 63.6416 43.008l211.2512-312.32a121.8048 121.8048 0 0 0 0.4096-135.8336z" fill="#707070" p-id="51378"></path><path d="M915.8656 461.4656l-221.8496-335.4112A38.4 38.4 0 0 0 629.76 168.448l221.9008 335.36a45.4144 45.4144 0 0 1 0 50.4832l-211.3024 312.32a38.4 38.4 0 0 0 63.6416 43.008l211.2512-312.32a121.8048 121.8048 0 0 0 0.6144-135.8336z" fill="#707070" p-id="51379"></path></svg>                
                </button>
                <button onClick={saveAsmesh} style={buttonstyle} title="showmesh">
                  <svg t="1682355483441" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="51054" width="20" height="20"><path d="M511.1296 490.1376l385.536-222.464a73.216 73.216 0 0 0-15.36-11.9808L546.8672 65.536a72.2432 72.2432 0 0 0-72.2432 0.4608l-331.776 194.56a70.912 70.912 0 0 0-10.24 7.5264zM487.2192 526.2336L109.4144 304.5888a72.0896 72.0896 0 0 0-2.304 18.5344l2.4576 384.5632a72.192 72.192 0 0 0 36.5056 62.3104l334.2336 190.1568c2.2528 1.28 4.608 2.3552 6.912 3.3792zM916.48 306.1248l-385.9968 222.7712v439.0912a70.144 70.144 0 0 0 22.016-8.2944l331.8272-194.56a72.192 72.192 0 0 0 35.84-62.7712l-2.4064-384.5632a76.4928 76.4928 0 0 0-1.28-11.6736z" fill="#707070" p-id="51055"></path></svg>                
                </button>
                <button onClick={saveAsimage} style={buttonstyle} title="saveasimage">
                  <svg t="1682406054448" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="77540" width="20" height="20"><path d="M700.2624 384.6144a30.6688 29.2864 90 1 0 58.5728 0 30.6688 29.2864 90 1 0-58.5728 0Z" fill="#707070" p-id="77541"></path><path d="M271.36 414.72a67.84 67.84 0 0 1 52.224-20.1216 68.864 68.864 0 0 1 49.4592 26.7264l204.1856 263.5776a8.8576 8.8576 0 0 0 11.9808 2.048l153.6-101.5296a66.56 66.56 0 0 1 70.1952-2.4576l134.8096 76.8V247.8592c0-58.5728-45.5168-106.24-101.4784-106.24H186.5728c-55.9616 0-101.4784 47.6672-101.4784 106.24v352.4096z m458.24-123.5456c49.3568 0 89.4976 41.984 89.4976 93.6448s-40.1408 93.6448-89.4976 93.6448S640 436.224 640 384.6144s40.192-93.6448 89.5488-93.6448z" fill="#707070" p-id="77542"></path><path d="M930.1504 711.2192l-146.0736-83.1488a8.8576 8.8576 0 0 0-9.2672 0.3072l-153.6 101.5808a66.9696 66.9696 0 0 1-37.0176 11.2128 68.1472 68.1472 0 0 1-53.9136-26.88L326.2976 450.56a9.1136 9.1136 0 0 0-6.5536-3.5328 8.9088 8.9088 0 0 0-6.912 2.6112l-214.4768 214.1696a29.696 29.696 0 0 1-13.2608 7.5776v126.5152c0 58.5216 45.5168 106.1888 101.4784 106.1888h659.5584c55.9616 0 101.4784-47.6672 101.4784-106.1888v-83.0464a29.184 29.184 0 0 1-17.4592-3.6352z" fill="#707070" p-id="77543"></path></svg>                
                </button>
                <button onClick={submitfile} style={buttonstyle} title="savetoserver">
                  <svg t="1682406545949" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="103100" width="20" height="20"><path d="M1023.8 604.7c0 160.9-129 291.3-287.9 291.3H256.1C113.3 888.5 0.2 781.3 0.2 650.7c0-99.4 65.6-185 159.9-223.5 19.7-8 33.8-25.5 38.2-46.3C224.9 254.9 340.8 160 480 160c102.6 0 192.4 51.5 243.4 129 10 15.3 26.1 25.5 44.2 28.2 145.2 22 256.2 142.1 256.2 287.5z" p-id="103101" fill="#707070"></path></svg>                </button>
                <button onClick={handledeleteworkingfile} style={buttonstyle} title='deleteworkingfile'>
                <svg t="1682394511961" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="52374" width="20" height="20"><path d="M900.5568 207.2576H762.88V153.6c0-33.0752-28.2624-60.0064-63.0272-60.0064H342.1184C307.2 93.696 279.0912 120.6272 279.0912 153.6v53.6576h-133.12a35.84 35.84 0 1 0 0 71.68h754.5856a35.84 35.84 0 0 0 0-71.68zM191.5904 336.9472h-15.6672V858.624c0 51.5072 48.6912 93.44 108.4928 93.44h477.4912C821.76 952.32 870.4 910.1312 870.4 858.624V336.9472H191.5904z m194.2016 422.144a20.48 20.48 0 0 1-40.96 0V496.64a20.48 20.48 0 0 1 40.96 0z m163.3792 0a20.48 20.48 0 0 1-40.96 0V496.64a20.48 20.48 0 0 1 40.96 0z m160 0a20.48 20.48 0 0 1-40.96 0V496.64a20.48 20.48 0 1 1 40.96 0z" fill="#707070" p-id="52375"></path></svg>                
                </button>
                </div>
                <Container 
                  onDrop={toWorkspace}
                  contents={workingFiles.length===0?<label style={{color:'#000000'}}>&nbsp;&nbsp;Drop Here</label>:workingFiles.map((item,idx)=>(<WorkspaceItem info={item} key={idx} onCheckboxChange={handleCheckboxChange} isSelected={selectedId === item.id}/>))}
                  accept={'search'}
                />
                <br/>
                <hr/>
                <div>
                  <br/>
                    {/* server list  */}
                    <form name='keywordFilter' onSubmit={(e)=>{
                        e.preventDefault();
                        const txt= document.forms.keywordFilter.keywordFilter_text.value;
                        props.filterServerFiles(txt);
                    }}>
                      <div style={{ textAlign:'center', width:'100%'}}>
                        <input 
                        type="text"
                        name="keywordFilter_text"
                        placeholder='Press Enter to Search'
                        style={{ border:'1px solid #ccc', borderRadius:'5px', padding:'5px 15px', width:'92%', display:'inline-block'}}
                        ></input>
                        <br/>
                        </div>
                    </form>
                    <div style={{display:'flex', padding:'20px 20px 0px 20px'}}>
                      <button onClick={handleDelete} style={buttonstyle} title='delete'>
                        <svg t="1682394511961" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="52374" width="20" height="20"><path d="M900.5568 207.2576H762.88V153.6c0-33.0752-28.2624-60.0064-63.0272-60.0064H342.1184C307.2 93.696 279.0912 120.6272 279.0912 153.6v53.6576h-133.12a35.84 35.84 0 1 0 0 71.68h754.5856a35.84 35.84 0 0 0 0-71.68zM191.5904 336.9472h-15.6672V858.624c0 51.5072 48.6912 93.44 108.4928 93.44h477.4912C821.76 952.32 870.4 910.1312 870.4 858.624V336.9472H191.5904z m194.2016 422.144a20.48 20.48 0 0 1-40.96 0V496.64a20.48 20.48 0 0 1 40.96 0z m163.3792 0a20.48 20.48 0 0 1-40.96 0V496.64a20.48 20.48 0 0 1 40.96 0z m160 0a20.48 20.48 0 0 1-40.96 0V496.64a20.48 20.48 0 1 1 40.96 0z" fill="#707070" p-id="52375"></path></svg>
                      </button>
                      <button onClick={handlerename} style={buttonstyle} title='rename'>
                        <svg t="1682394495919" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="52059" width="20" height="20"><path d="M651.9296 595.8656a152.0128 152.0128 0 0 1-45.2096 31.8464l-133.12 61.44a86.5792 86.5792 0 0 1-36.2496 8.0384A86.2208 86.2208 0 0 1 357.7856 578.56c22.7328-56.32 46.592-114.6368 58.7776-144.4352a152.832 152.832 0 0 1 33.024-49.8176L699.2384 133.12H244.6336a115.9168 115.9168 0 0 0-115.9168 116.1216v566.528A115.9168 115.9168 0 0 0 244.6336 931.84h540.7232A115.9168 115.9168 0 0 0 901.12 815.7696V346.9824z" fill="#707070" p-id="52060"></path><path d="M850.3296 128.7168a50.4832 50.4832 0 0 0-71.168 0l-293.2736 291.84a100.5568 100.5568 0 0 0-21.9136 33.1264c-12.1856 29.7472-35.84 88.064-58.6752 144.1792a34.816 34.816 0 0 0 46.8992 44.6976l133.12-61.44a100.9152 100.9152 0 0 0 30.0032-21.1456l296.96-298.9056a50.4832 50.4832 0 0 0-0.3072-71.68z" fill="#707070" p-id="52061"></path></svg>
                      </button>
                      <button onClick={handleAxis} style={buttonstyle}>
                    <svg t="1682443109907" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="25350" width="20" height="20"><path d="M817.152 102.4H208.128a122.88 122.88 0 0 0-122.88 122.88v438.1184a122.88 122.88 0 0 0 122.88 122.88h609.28a122.88 122.88 0 0 0 122.88-122.88V225.28a122.88 122.88 0 0 0-123.136-122.88zM803.84 335.872l-232.96 226.3552a34.7136 34.7136 0 0 1-49.7664-1.4848L396.4416 424.6528l-146.176 146.176a20.48 20.48 0 1 1-28.9792-28.9792l150.8352-150.784a34.6624 34.6624 0 0 1 50.1248 1.0752l124.7232 136.192 228.1984-221.7984a20.48 20.48 0 1 1 28.672 29.3376zM881.6128 918.2208H143.616a27.9552 27.9552 0 1 1 0-55.8592h737.9968a27.9552 27.9552 0 1 1 0 55.8592z" fill="#707070" p-id="25351"></path></svg>
                    </button> 
                    </div>
                    <Container 
                      onDrop={toServer}
                      contents={props.currentfile.slice((currentPage-1)*props.pagenumber,Math.min((currentPage-1)*props.pagenumber+props.pagenumber, props.currentfile.length)).map((item,idx)=>(<SearchItem info={item} key={idx} onCheckboxChange={handleSelectedserverFile} isSelected={selectedServerfilesId===item.id}></SearchItem>))}
                      accept={'work'}
                    />
                    <div style={{display:'flex', padding:'20px 20px 0px 20px'}}>
                    <button onClick={() => handlePageChange(currentPage - 1)} style={buttonstyle}>
                      <svg t="1682395033622" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1417" width="20" height="20"><path d="M311.4 459.2L719 866.8c14.6 14.6 14.6 38.4 0 53-14.6 14.6-38.4 14.6-53 0L311.4 565.2c-29.2-29.2-29.2-76.7 0-106z" fill="#707070" p-id="1418"></path><path d="M311.4 564.7L719.1 157c14.6-14.6 14.6-38.4 0-53-14.6-14.6-38.4-14.6-53 0L311.4 458.6c-29.2 29.3-29.2 76.8 0 106.1z" fill="#707070" p-id="1419"></path></svg>
                    </button>
                    <span style={{color:'#707070'}}>{currentPage}&nbsp;&nbsp;</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} style={buttonstyle}>
                      <svg t="1682395010391" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2242" width="20" height="20"><path d="M708.1 459.2L300.5 866.8c-14.6 14.6-14.6 38.4 0 53 14.6 14.6 38.4 14.6 53 0l354.6-354.6c29.3-29.2 29.3-76.7 0-106z" fill="#707070" p-id="2243"></path><path d="M708.1 564.7L300.5 157c-14.6-14.6-14.6-38.4 0-53 14.6-14.6 38.4-14.6 53 0l354.6 354.6c29.3 29.3 29.3 76.8 0 106.1z" fill="#707070" p-id="2244"></path></svg>
                    </button>
                    </div>
                </div>
            </DndProvider>
          </Sider>
          <Layout>
            <Content>
              <Testpanel userid={userid} workingFiles={workingFiles} checkFiles={checkFiles} ref={ref} updateList={props.updateList}/>
              {showModal && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#e0e0e0',
                      padding: 20,
                      borderRadius: 5,
                      width: 400,
                      borderRadius: "0.5rem",
                    }}
                  >
                    <h3>Old Name: </h3>
                    <h4>{selectedServerfilesName.split('.')[0]}</h4>
                    <h3>New Name: </h3>
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      style={{ width: '100%' }}
                    />
                    <br />
                    <br />
                    <button onClick={handleRenamesubmit} style={buttonstyle}>Submit</button>
                    <button onClick={handleCloseModal} style={buttonstyle}> 
                      Cancel
                    </button>
                  </div>
                  </div>
                )}
            </Content>
          </Layout>

        </Layout>
      </Space>)
}
