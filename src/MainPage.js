import SearchPanel from "./components/SearchPanel";
import ControlPanel from "./components/ControlPanel";
import Testpanel from "./components/Testpanel";
import { Layout, Space, FloatButton } from "antd";
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import React from "react";


const dummyListData=[
    {id:1,fileName:'zeghtti.pcd'},
    {id:2,fileName:'globalMap.pcd'},
    {id:3,fileName:'mushapotei.pcd'},
    {id:4,fileName:'npx.lac'}
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
    color: '#fff',
    backgroundColor: '#252526',
};

class MainPage extends React.Component{
    constructor(){
        super();
        this.state={searchList:[],displayedItem:{fileType:'pcd',fileName:''},message:''};
        this.selectButtonHandler=this.selectButtonHandler.bind(this);
        this.searchButtonHandler=this.searchButtonHandler.bind(this);
        this.handleFileChangeLocal=this.handleFileChangeLocal.bind(this);
        this.uploadFile=this.uploadFile.bind(this);
    }
    componentDidMount(){
        this.loadData(dummyListData);
    }
    loadData(listData){
        // load data
        this.setState({searchList:listData});
    }
    searchButtonHandler(){

    }
    selectButtonHandler(item){
        this.setState({displayedItem:item});
    }
    uploadFile(){
        //  first add to searchList for displaying 
        if(this.state.displayedItem.fileName===''){
                ;
        }
        else{
            const id =this.state.searchList.length+1;
            const item={
                id:id,
                fileName:this.state.displayedItem.fileName
            }
            this.setState({
                searchList:[... this.state.searchList, item]
            })
        }
    }
    openFromLocal(){
        const localFile=document.getElementById('read_file');
        localFile.click();
    }
    saveToLocal(){

    }
    handleFileChangeLocal(event){
        const filePath = event.target.value; 
        var fileName=filePath.split('\\');
        fileName=fileName[fileName.length-1];

        var fileType=fileName.split('.');
        fileType=fileType[fileType.length-1];
        this.setState({message:String(fileName)});
        this.setState({displayedItem:{fileType:fileType,fileName:filePath}});
    }


    render(){
        //console.log('?',this.props.searchList);
        return <div>
                <Space
                direction="vertical"
                style={{
                    width: '100%'
                }}
                size={[0, 48]}
            >
                <Layout>
                    <Sider  width={'10%'} height={'100%'} style={siderStyle}>
                        <h1>open4vision</h1>
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
            </Space>
            {/* this is the header panel*/}
            <div id="header">
                <h1>open4vision</h1>
            </div>
            <div style={{"width":'100%'}}>
            {/* blow is the  searchPanel,main*/}
                <div style={{"width":"30%","display":'inline',"float":"left","backgroundColor":'red'}} id="test1">
                {/* write the search list here searchPanel*/}
                    <h1>dummy search list</h1>
                    < SearchPanel searchList={this.state.searchList} searchButtonHandler={this.searchButtonHandler} selectButtonHandler={this.selectButtonHandler}/>
                </div>
                <div style={{"width":"70%","display":'inline',"float":"left","backgroundColor":"green"}}>
                    {/* write the control panel here controlPanel */}
                    <h1>dummy control panel</h1>
                    <ControlPanel displayedItem={this.state.displayedItem}/>
                </div>
            </div>
            <div style={{"clear":"both","backgroundColor":"yellow"}}>
                {/* write the foot print here, and the fromfile, upload, savetolocal button*/}
                <h1 >dummy footprint</h1>
                <label >{this.state.message}</label>
                <br/>
                <input style={{display: 'none'}} id="read_file" type="file" onChange={this.handleFileChangeLocal}/>
                <button onClick={this.openFromLocal}>open from local</button>
                <button onClick={this.uploadFile}>upload to server</button>
                <input style={{display: 'none'}} id="save_file" type="file" onChange={this.handleFileChangeLocal}/>
                <button onClick={this.saveToLocal}>download</button>
            </div>
        </div>
    }

}


export default MainPage;
