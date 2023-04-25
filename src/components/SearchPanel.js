import {memo, useState, useCallback,useMemo,useRef} from 'react'
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Testpanel from './Testpanel';
import { Layout, Space, FloatButton, Alert, Input } from "antd";



const {Sider, Content } = Layout;

const contentStyle = {
    textAlign: 'center',
    minHeight: 1400,
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#1E1E1E',
};
const siderStyle = {
     backgroundColor: '#CCCCCC',
};

const dummyStyle = {
    border: "1px dashed gray",
    padding: "0.5rem",
    margin: "0.5rem",
    backgroundColor: "orange"
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
        backgroundColor:'lightyellow',
        opacity: isDragging ? 0.4 : 1,
        cursor: "move"
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
        <small>{info.id} </small>
        <small>{info.fileName}*</small>
        <button onClick={()=>{}}>Del</button>
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
        cursor:"move"
    }

    const handleCheckboxChange = (event) => {
      if (onCheckboxChange) {
        onCheckboxChange(info, event.target.checked);
      }
    };

    return (
        <div ref={drag} style={style} role={'SourceBox'}>
        <input type="checkbox" onChange={handleCheckboxChange} checked={isSelected}/>
        <small>{info.id} </small>
        <small>{info.fileName}</small>
        {/* <input type='text'  onChange={()=>{alert("123");}} defaultValue={info.fileName}/> */}
        <button >Del</button>
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

    let backgroundColor=isOver?'lightblue':'#fff';

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
    // console.log(item[key],list[i][key],'what');
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
    const [workingFiles, setWrokingFiles]=useState([]);
    const [checkFiles, setCheckFiles]=useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedServerfilesId, setSelectedserverFilesid] = useState(null);
    const toWorkspace=useCallback((item)=>{
      const newitem={...item.info,display:false}
      for(var i in workingFiles){
        if(newitem.id===workingFiles[i].id)
          return undefined;
      }
      setWrokingFiles([...workingFiles,newitem]);
    },[workingFiles]);
    const toServer=useCallback((item)=>{
      const newItem={
        id:item.info.id,
        fileName:item.info.fileName,
        filePath:item.info.filePath
      };
      if(props.uploadFile(newItem)){
        setWrokingFiles(deleteItem(newItem,workingFiles,'id'));
      }
    },[workingFiles])

    const handleCheckboxChange = (info, isChecked) => {
      setSelectedId(isChecked ? info.id : null);
      setCheckFiles(info);
    };

    const handleSelectedserverFile = (info, isChecked) => {
      console.log("serverfile",info)
      setSelectedserverFilesid(isChecked ? info.id : null);
    }
    const handleDownload=()=>{
      ref.current.saveModelbyName();
    }

    const handleDownloadAll=()=>{
      ref.current.saveAllmodel();
    }

    const saveAsmesh=()=>{
      ref.current.saveAsmesh();
    }

    const handleDelete=()=>{
      //发送删除请求，并调用父组件函数更新list
    }
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
                <label >workspace </label><br/>
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
                <button onClick={()=>{
                      const localFile=document.getElementById('read_file');
                      localFile.click();
                  }}>open</button>
                <button onClick={handleDownload}>download</button>
                <button onClick={handleDownloadAll}>downloadall</button>
                <button onClick={saveAsmesh}>saveasmesh</button>
                <Container 
                  onDrop={toWorkspace}
                  contents={workingFiles.length===0?<label>drop here</label>:workingFiles.map((item,idx)=>(<WorkspaceItem info={item} key={idx} onCheckboxChange={handleCheckboxChange} isSelected={selectedId === item.id}/>))}
                  accept={'search'}
                />
      
                <div  style={{'overflowY':'scroll'}}>
                    {/* server list  */}
                    <form name='keywordFilter' onSubmit={(e)=>{
                        e.preventDefault();
                        const txt= document.forms.keywordFilter.keywordFilter_text.value;
                        props.filterServerFiles(txt);
                    }}>
                      <label>cloud</label>
                        <input type="text" name="keywordFilter_text"></input>
                        <button>search</button>
                    </form>
                    <button onClick={handleDelete}>delete</button>
                    <Container 
                      onDrop={toServer}
                      contents={props.serverFiles.map((item,idx)=>(<SearchItem info={item} key={idx} onCheckboxChange={handleSelectedserverFile} isSelected={selectedServerfilesId===item.id}></SearchItem>))}
                      accept={'work'}
                    />
                </div>
                <div>
                    <button>1</button>
                    <button>preivous</button>
                    <input type="number" min="1"></input>
                    <button>turn to</button>
                    <button>next</button>
                    <button></button>
                </div>
            </DndProvider>
          </Sider>
          <Layout>
            <Content>
              <Testpanel workingFiles={workingFiles} checkFiles={checkFiles} ref={ref}/>
            </Content>
          </Layout>

        </Layout>
      </Space>)
}
