import SearchPanel from "./components/SearchPanel";
import ControlPanel from "./components/ControlPanel";
import Testpanel from "./components/Testpanel";
import { Layout, Space, FloatButton, Alert } from "antd";
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import React from "react";


const dummyListData=[
    {id:1,fileName:'horse.pcd',filePath:'/abc/zeghtti.pcd'},
    {id:2,fileName:'Zaghetto.pcd',filePath:'/ddd/globalMap.pcd'},
    {id:3,fileName:'mushapotei.pcd',filePath:'mushapotei.pcd'},
    {id:4,fileName:'npx.lac',filePath:'/bs/npx.lac'}
]
const dummyworkingFiles=[
    {id:5,fileName:'zeghtti2.pcd',filePath:'/abc/zeghtti.pcd',display:false},
    {id:6,fileName:'globalMap2.pcd',filePath:'/ddd/globalMap.pcd',display:true},
    {id:7,fileName:'mushapotei2.pcd',filePath:'mushapotei.pcd',display:false},
    {id:8,fileName:'npx.lac2',filePath:'/bs/npx.lac',display:false}
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
        this.loadData=this.loadData.bind(this);
        this.filterServerFiles=this.filterServerFiles.bind(this);
        this.uploadFile=this.uploadFile.bind(this);
        this.deleteFile=this.deleteFile.bind(this);
    }

    filterServerFiles(searchKey){
        const original=dummyListData;
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

    loadData(listData){
        // load data
        this.setState({serverFiles:listData});
    }
    deleteFile(item){

    }
    uploadFile(item){
        //  first add to searchList for displaying 
        for(var i in this.state.serverFiles){
            if(item.id===this.state.serverFiles[i].id){
                //上传并覆盖原来的文件
                return true;
            }
        }
        //上传新文件，并更新list状态
        this.setState({serverFiles:[...this.state.serverFiles,item]});
        return true;
    }

    async getDummylist(){
        const response = await fetch('https://api.example.com/data');
        const result = await response.json();
        //设置dummylist
    }
    render(){
        return <div>
                {/* <Space
                direction="vertical"
                style={{
                    width: '100%'
                }}
                size={[0, 48]}
            >
                <Layout>
                    <Sider  width={'10%'} height={'100%'} style={siderStyle}>
                    </Sider>
                    <Layout height={'100%'}>
                        <Content style={contentStyle}>
                            <Testpanel></Testpanel>
                            <FloatButton onClick={this.openFromLocal} icon={<QuestionCircleOutlined />} type="default" style={{ right: 50 }} />
                            <FloatButton onClick={this.uploadFile} icon={<QuestionCircleOutlined />} type="default" style={{ right: 100 }} />
                            <FloatButton onClick={this.saveToLocal} icon={<QuestionCircleOutlined />} type="default" style={{ right: 150 }} />
                        </Content>
                    </Layout>
                    <Sider  width={'10%'} height={'100%'} style={siderStyle}>
                    </Sider>
                </Layout>   
            </Space> */}
            {/* this is the header panel*/}
            <div style={{"width":'100%'}}>
            {/* blow is the  searchPanel,main*/}
                <div style={{"width":"100%","display":'inline',"float":"left","backgroundColor":'red'}} id="test1">
                {/* write the search list here searchPanel*/}
                    < SearchPanel serverFiles={this.state.serverFiles} 
                    workingFiles={this.state.workingFiles} 
                    filterServerFiles={this.filterServerFiles}
                    uploadFile={this.uploadFile}
                    />
                </div>
                {/* <div style={{"width":"70%","display":'inline',"float":"left","backgroundColor":"green"}}>
                    {/* write the control panel here controlPanel 
                    <h1>dummy control panel</h1>
                    <ControlPanel displayedItem={this.state.displayedItem}/>
                </div> */}
            </div>
        </div>
    }

}


export default MainPage;
