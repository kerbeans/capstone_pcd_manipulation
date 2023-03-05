import React from "react";

class ResultShower extends React.Component{
    constructor(){
        super();
    }
    render(){
        return 0;
    }
}



class SearchPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={showItem:this.props.searchLIst};
        this.spSelectHandler=this.spSelectHandler.bind(this);
    }
    spSearch(e){
        e.preventDefault();
        const form =document.forms.searchPCD;
        const fileName=form.searchPanel_fileName.value;
        const item={
            id:1,
            fileName:22,
        }
        this.props.searchButtonHandler();
    }
    spSelectHandler(id){
        for(var i in this.props.searchList){
            const iter =this.props.searchList[i];
            if(id==iter.id){
                this.props.selectButtonHandler(id);
                break;
            }
        }
    }
    render(){
        // console.log(this.state);
        return (<div> 
            <div>
                {/* search panel */}
                <form name='searchPCD' onSubmit={this.spSearch}>
                    <input type="text" name="searchPanel_fileName"></input>
                    <button>search</button>
                </form>
            </div>
            <div>
                {/* show result */}
                <ResultShower showItem={this.state.showItem} spSelectHandler={this.spSelectHandler}/>
            </div>

        </div>);
    }
}
export default SearchPanel;
