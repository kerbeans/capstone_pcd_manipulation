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
    textAlign: 'center',
    lineHeight: '120px',
    minHeight: 1000,
    minWidth:360,
    color: '#fff',
    backgroundColor: '#1E1E1E',
};

class MainPage extends React.Component{
    constructor(){
        super();
        this.state={serverFiles:[],displayedItem:{fileType:'pcd',fileName:''},workingFiles:[],message:'',maxpage:1,currentfile:[],pagenumber:10};
        this.loadData=this.loadData.bind(this);
        this.filterServerFiles=this.filterServerFiles.bind(this);
        this.uploadFile=this.uploadFile.bind(this);
        this.updateList=this.updateList.bind(this);
    }

    filterServerFiles(searchKey){
        const original=this.state.serverFiles;
        var filteredList=[];
        for(var i in original){
            if(original[i].fileName.search(searchKey)+1)
                filteredList.push(original[i]);
        }
        this.setState({currentfile:filteredList});
    }

    async componentDidMount(){
        /*todo
        dummylistdata 请求获得*/
        const query = `
        query initallist {
          fileList(userid: 0, filterKey: "", page: 1) {
            id
            fileName
            filePath
          }
        }
      `;
        const response = await fetch(GRAPHQL_SERVER_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query}),
        })
        const sourcelist = await response.json();
        this.loadData(sourcelist.data.fileList);
        this.setState({maxpage:Math.ceil(sourcelist.data.fileList.length/this.state.pagenumber)});
    }

    loadData(listData){
        this.setState({serverFiles:[...this.state.serverFiles,listData], currentfile:listData});
    }

    async updateList(){
        const query = `
        query initallist {
          fileList(userid: 0, filterKey: "", page: 1) {
            id
            fileName
            filePath
          }
        }
      `;
        const response = await fetch(GRAPHQL_SERVER_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query}),
        })
        const sourcelist = await response.json();
        this.setState({serverFiles:sourcelist.data.fileList, currentfile:sourcelist.data.fileList, maxpage:Math.ceil(sourcelist.data.fileList.length/this.state.pagenumber)});
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

    render(){
        return <div style={{'backgroundColor':'#1F1F1F'}}>
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
            <div style={{"width":'100%', 'backgroundColor':'#1F1F1F', 'height':'100vh'}}>
            {/* blow is the  searchPanel,main*/}
                <div style={{"width":"100%","display":'inline',"float":"left", 'backgroundColor':'#1F1F1F'}} id="test1">
                {/* write the search list here searchPanel*/}
                    < SearchPanel serverFiles={this.state.serverFiles} 
                    workingFiles={this.state.workingFiles} 
                    filterServerFiles={this.filterServerFiles}
                    uploadFile={this.uploadFile}
                    maxpage={this.state.maxpage}
                    currentfile={this.state.currentfile}
                    pagenumber={this.state.pagenumber}
                    loadData={this.loadData}
                    updateList={this.updateList}
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
