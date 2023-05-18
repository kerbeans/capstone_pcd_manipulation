import SearchPanel from "./components/SearchPanel";
import ControlPanel from "./components/ControlPanel";
import Testpanel from "./components/Testpanel";
import { Layout, Space, FloatButton, Alert } from "antd";
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import React from "react";

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

class LoginPage extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        input1: '',
        input2: '',
        input3: '',
        mode_login:true
      };
      this.handleClick=this.handleClick.bind(this);
      this.handleInputChange=this.handleInputChange.bind(this);
      this.handleRegistration=this.handleRegistration.bind(this);
      this.queryLogin=this.queryLogin.bind(this);
    }
    componentDidMount(){
      this.setState({model_login:true});
    }
    async queryRegister(userid,password){
      const query =`
      query queryregistration($userid:Int!,$password:String!){
        registration(userid:$userid,password:$password)
      }`;
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization':"Basic "+userid,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            userid,
            password,
          },
        }),
      };
      const response = await fetch(GRAPHQL_SERVER_URL, requestOptions);
      const data = await response.json();
      console.log('ldzeng',data);
      console.log(data.data.registration);
      return data.data.registration;

    }

    async queryLogin(userid, password) {
      const query = `
        query login($userid: Int!, $password: String!) {
          login(userid: $userid, password: $password)
        }
      `;
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization':"Basic "+userid,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          operationName:"login",
          query,
          variables: {
            userid,
            password,
          },
        }),
      };
      const response = await fetch(GRAPHQL_SERVER_URL, requestOptions);
      const data = await response.json();
      console.log(data.data.login)
      return data.data.login;
    }
    

    handleInputChange = (e) => {
      const { name, value } = e.target;
      this.setState({ [name]: value });
      // console.log('ldzeng',name,value);
    };
  
    handleRegistration= async()=>{
      if(this.state.mode_login){
        this.setState({mode_login:false});
        return;
      }
      const userid=this.state.input1;
      const response= await this.queryRegister(this.state.input1,this.state.input2);
      if(response=='success'){
        await this.props.setselector();
        await this.props.setuserid(userid);
        this.props.login();
      }
      else{
        alert(response);
      }

    }

    handleClick = async () => {
      if(!this.state.mode_login){
        this.setState({mode_login:true});
        return ;
      }
      const userid = this.state.input1
      const response = await this.queryLogin(this.state.input1, this.state.input2)
      console.log(response)
      if(response == "success"){
        await this.props.setselector();
        console.log("tasd", userid)
        await this.props.setuserid(userid);
        this.props.login();
      }
      else{
        alert(response)
      }
    };
  
    render() {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px' }}>
          <label htmlFor="username" style={{marginRight:'10px', color:"#ffffff"}}>Username:</label>
          <input
            type="text"
            name="input1"
            value={this.state.input1}
            onChange={this.handleInputChange}
            placeholder="username"
            style={{borderRadius:'0.5rem'}}
          />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px' }}>
          <label htmlFor="username" style={{marginRight:'10px', color:"#ffffff", borderRadius:'1rem'}}>&nbsp;Password:</label>
          <input
            type="password"
            name="input2"
            value={this.state.input2}
            onChange={this.handleInputChange}
            placeholder="password"
            style={{borderRadius:'0.5rem'}}
          />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '10px',display:this.state.mode_login?'none':'block'}}>
          <label htmlFor="username" style={{marginRight:'10px', color:this.state.input2!==this.state.input3?"#ff0000":"#ffffff", borderRadius:'1rem'}}>&nbsp;Password confirm:</label>
          <input
            type="password"
            name="input3"
            value={this.state.input3}
            onChange={this.handleInputChange}
            placeholder="password_confirm"
            style={{borderRadius:'0.5rem'}}
          />
          </div>
          <div style={{'float':'left'}}>
            <button onClick={this.handleClick}>Login</button>
             &nbsp;&nbsp;
            <button onClick={this.handleRegistration} disabled={(this.state.mode_login)||(this.state.input2===this.state.input3)?'':'disabled'}>register</button>
          </div>
        </div>
      );
    }
  }


class MainPage extends React.Component{
    userid = -1
    constructor(){
        super();
        this.state={
          serverFiles:[],
          displayedItem:{fileType:'pcd',fileName:''},
          workingFiles:[],
          message:'',
          maxpage:1,
          currentfile:[],
          pagenumber:5,
          loged:false
        };
        this.loadData=this.loadData.bind(this);
        this.filterServerFiles=this.filterServerFiles.bind(this);
        this.uploadFile=this.uploadFile.bind(this);
        this.updateList=this.updateList.bind(this);
        this.setselector=this.setselector.bind(this);
        this.setuserid=this.setuserid.bind(this);
        this.login=this.login.bind(this)
    }

    async setselector(){
      this.setState({loged:true})
    }

    async setuserid(id){
      this.userid = id
    }

    filterServerFiles(searchKey){
        const original=this.state.serverFiles;
        var filteredList=[];
        console.log("ori",original)
        for(var i in original){
          console.log(original[i])
            if(original[i].fileName.search(searchKey)+1)
                filteredList.push(original[i]);
        }
        this.setState({currentfile:filteredList});
    }

    async login(){
      const userid = this.userid
      console.log("login",userid)
      /*todo
      dummylistdata 请求获得*/
      const query = `
      query initallist($userid: Int!) {
        fileList(userid: $userid, filterKey: "", page: 1) {
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
      body: JSON.stringify({
        query,
        variables: {
          userid, // 在查询中传递userid变量
        },
      }),
    });
      const sourcelist = await response.json();
      this.loadData(sourcelist.data.fileList);
      this.setState({maxpage:Math.ceil(sourcelist.data.fileList.length/this.state.pagenumber)});
    }

    async componentDidMount(){
    }

    loadData(listData){
        this.setState({serverFiles:listData, currentfile:listData});
    }

    async updateList(){
        const userid  = this.userid
        const query = `
        query initallist($userid: Int!) {
          fileList(userid: $userid, filterKey: "", page: 1) {
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
        body: JSON.stringify({
          query,
          variables: {
            userid, // 在查询中传递userid变量
          },
        }),
      });
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
            <div style={{"width":'100%', 'backgroundColor':'#1F1F1F', 'height':'100vh'}}>
            {/* blow is the  searchPanel,main*/}
            {this.state.loged===false? 
                <LoginPage setselector={this.setselector} setuserid={this.setuserid} login={this.login}/>:
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
                    userid={this.userid}
                    />
                </div>}

            </div>
        </div>
    }

}


export default MainPage;
