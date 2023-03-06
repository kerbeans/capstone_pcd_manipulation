import React from "react";

class ResultShower extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        var showItem=[]
        if(this.props.showItem===undefined){
            ;
        }
        else{
            if(this.props.searchKey===''){
                showItem=this.props.showItem.map((item,idx)=>
                <tr key={idx}>
                    <td key={"id"+String(idx)}>{item.id}</td> 
                    <td key={"path"+String(idx)}>{item.fileName}</td>
                </tr>)
            }
            else{
                for(var i in this.props.showItem){
                    if(this.props.showItem[i].fileName.search(this.props.searchKey)+1){
                        showItem.push({id:this.props.showItem[i].id,fileName:this.props.showItem[i].fileName});
                    }
                }
                showItem=showItem.map((item,idx)=>
                <tr key={idx}>
                    <td key={"id"+String(idx)}>{item.id}</td> 
                    <td key={"path"+String(idx)}>{item.fileName}</td>
                </tr>)
            }
        }
        
        return (
            <tbody>
                {showItem}
            </tbody>
        );
    }
}



class SearchPanel extends React.Component{
    constructor(props){
        super(props);
        this.spSelectHandler=this.spSelectHandler.bind(this);
        this.state={searchKey:''};
        this.spSearch=this.spSearch.bind(this);
    }
    spSearch(e){
        e.preventDefault();
        const form =document.forms.searchPCD;
        const fileName=form.searchPanel_fileName.value;

        if(fileName==''){
            this.setState({searchKey:''});
        }
        else{

            this.setState({searchKey:fileName});
        }
    }
    spSelectHandler(id){
        for(var i in this.props.searchList){
            const iter =this.props.searchList[i];
            if(id===iter.id){
                this.props.selectButtonHandler(id);
                break;
            }
        }
    }
    
    render(){
       // console.log(this.state.showItem);

        return (<div>
            <div>
                <h3>place for merge</h3>    
            </div> 
            <div>
                {/* search panel */}
                <form name='searchPCD' onSubmit={this.spSearch}>
                    <input type="text" name="searchPanel_fileName"></input>
                    <button>search</button>
                </form>
            </div>
            <div>
                {/* show result */}
                <table name='serverFile'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>FileName</th>
                        </tr>
                    </thead>
                        <ResultShower showItem={this.props.searchList} searchKey={this.state.searchKey} spSelectHandler={this.spSelectHandler}/>
                </table>
            </div>

        </div>);
    }
}
export default SearchPanel;
