import {memo, useState, useCallback,useMemo} from 'react'
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
    // textAlign: 'center',
    // lineHeight: '120px',
    // minHeight: 360,
    // minWidth:360,
    // color: '#fff',
     backgroundColor: '#CCCCCC',
};

const dummyStyle = {
    border: "1px dashed gray",
    padding: "0.5rem",
    margin: "0.5rem",
    backgroundColor: "orange"
  };



const WorkspaceItem= memo(function WorkspaceItem({info,changeDisplay}){
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
    return (
      <div ref={drag} style={style}>
        <input type="checkbox" onChange={()=>{
          console.log('click');
          changeDisplay();
          
          }}/>
        <small>{info.id} </small>
        <small>{info.fileName}*</small>
        <button onClick={()=>{}}>Del</button>
      </div>
    );
});

const SearchItem=memo(function SearchItem({info}){
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
    return (
        <div ref={drag} style={style} role={'SourceBox'}>
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

export default memo(function SearchPanel(props){

    const [workingFiles, setWrokingFiles]=useState([]);

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
      if(props.uploadFile(newItem))
        setWrokingFiles(deleteItem(newItem,workingFiles,'id'));

    },[workingFiles])
    return(
      <Space
        direction="vertical"
        style={{
          width: '100%'
          }}
          size={[0, 48]}>
        <Layout>
          <Sider  width={'20%'} height={'100%'} style={siderStyle}>
            <DndProvider backend={HTML5Backend}>
                <label >workspace </label>

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

                <Container 
                  onDrop={toWorkspace}
                  contents={workingFiles.length===0?<label>drop here</label>:workingFiles.map((item,idx)=>(<WorkspaceItem info={item} key={idx} 
                    changeDisplay={()=>{
                      item.display=! item.display;
                      // console.log(workingFiles)
                  }}
                    changeFilename={(nname)=>{
                      if (!/^[^\s\\]+\.pcd$/.test(nname)){
                        alert('invalid filename');
                        return;
                      }
                      else{
                        for(var i in workingFiles){
                          if(i.fileName===nname){
                            if(nname===item.fileName)
                              return
                            else{
                              alert('duplicated name');
                              return;
                            }
                          }
                        }
                        item.name=nname;
                      }

                      }
                    }
                    />))}

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
                    <Container 
                      onDrop={toServer}
                      contents={props.serverFiles.map((item,idx)=>(<SearchItem info={item} key={idx} ></SearchItem>))}
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
              <Testpanel/>
            </Content>
          </Layout>
            <Sider width={'20%'} style={siderStyle}>
              <h1>control panel</h1>
            </Sider>

        </Layout>
      </Space>)
})
