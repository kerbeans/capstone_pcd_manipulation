import SearchPanel from "./components/SearchPanel";
import ControlPanel from "./components/ControlPanel";
import Testpanel from "./components/Testpanel";
import { Layout, Space, FloatButton, Alert } from "antd";
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import React from "react";


const dummyListData=[
    {id:1,fileName:'zeghtti.pcd',filePath:'/abc/zeghtti.pcd',display:false},
    {id:2,fileName:'globalMap.pcd',filePath:'/ddd/globalMap.pcd',display:false},
    {id:3,fileName:'mushapotei.pcd',filePath:'mushapotei.pcd',display:false},
    {id:4,fileName:'npx.lac',filePath:'/bs/npx.lac',display:false}
]

const {Sider, Content } = Layout;

const contentStyle = {
    textAlign: 'center',
    minHeight: 1400,
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#1E1E1E',
};
const siderStyle = {
    textAlign: 'center',
    lineHeight: '120px',
    minHeight: 360,
    minWidth:360,
    color: '#fff',
    backgroundColor: '#252526',
};

class MainPage extends React.Component{
    constructor(){
        super();
        this.state={serverFiles:[],displayedItem:{fileType:'pcd',fileName:''},workingFiles:[],message:''};
        this.init()
    }
    init(){
   
        this.loadData=this.loadData.bind(this);
        this.filterServerFiles=this.filterServerFiles.bind(this);
        this.uploadFile=this.uploadFile.bind(this);
        this.deleteFile=this.deleteFile.bind(this);
    }
    filterServerFiles(searchKey){// searchkey ,page
        const original=dummyListData;// request_from_sever



        
        var filteredList=[];
        for(var i in original){
            if(original[i].fileName.search(searchKey)+1)
                filteredList.push(original[i]);
        }
        this.setState({serverFiles:filteredList});
    }
    componentDidMount(){
        this.loadData();
    }
    loadData(){
        // load data request from server.
        this.setState({serverFiles:dummyListData});
        // filterSeverFiles("",1)
    }
    deleteFile(item){

    }
    uploadFile(item){
        //  first add to searchList for displaying 
        for(var i in this.state.serverFiles){
            if(item.id===this.state.serverFiles[i].id){
                alert('file unsaved');
                return false;
            }
        }
        //console.log('upload',document.querySelector('#uploadfile').value);
        console.log(item,'ote,');
        //document.querySelector('#uploadfile').value=item.fileName;

        //this.loadData();
        this.setState({serverFiles:[...this.state.serverFiles,item]});
        return true;
    }

    render(){
        return (
            <div>
                <div id="header">
                    <h1>open4vision</h1>
                    {/* a invisible input button to upload local file to sever*/}
                    <input type='file' id='uploadfile' style={{display:'none'}}  onChange={(e)=>{
                        e.preventDefault();
                        const files = e.target.files
                        const formData = new FormData()
                        formData.append('myFile', files[0])
                    
                        fetch('/data', {
                        method: 'POST',
                        body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                        console.log(data.path)
                        })
                        .catch(error => {
                        console.error(error)
                        })
                    }}/>
                </div>
                <div style={{"width":'100%'}}>
                {/* blow is the  searchPanel,main*/}
                    <div style={{"width":"100%","display":'inline',"float":"left","backgroundColor":'red'}} id="test1">
                    {/* write the search list here searchPanel*/}
                        < SearchPanel serverFiles={this.state.serverFiles} 
                        workingFiles={this.state.workingFiles} 
                        filterServerFiles={this.filterServerFiles}
                        uploadFile={this.uploadFile}
                        deleteFile={this.deleteFile}
                        />
                    </div>
                </div>
                <div style={{"clear":"both","backgroundColor":"yellow"}}>
                    {/* write the foot print here, and the fromfile, upload, savetolocal button*/}
                    <h1 >dummy footprint</h1>
                </div>
        </div>
        );
    }

}


export default MainPage;
