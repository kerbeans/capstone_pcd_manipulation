Class MainPage 
- attributes:
1. state.searchList:[] # maintain the files info fetch from server, a file category, will be passed though SearchPanel and ResultShower
2. state.displayedItem:{fileType:str,fileName:str,filePath?} # record the info of file that will be shown on controlPanel, and will be passed through. currently only support single file, convert to [] when we need to merge pcd.  
- function:
1. openFromLocal # btn, open .pcd, .lac file from local, trigger setState(displayedItem)
2. uploadToSever # btn, upload current DisplayedItem to the server, trigger setState(searchList)
3. saveAs # btn, save the current DsiplayedItem to localfile.
- handler:
1. SelectBtnHandler # pass through SearchPanel to ResultShower. trigger set state displayedItem. 


Class SearchPanel:
sub-components of MainPage. receive props.searchList, SelectBtnHandler from MainPage  
- attributes:
1. state.searchKey # value from search input. Combined with props, pass to ResultShower.
- function:
1. searchBtnClick # btn trigger to change searchKey.

Class ResultShower:  
sub-components of SearchPanel. receive props.props.searchList, props.props.SelectBtnHandler, props.searchKey from SearchPanel.
- attributes:
1. render.showItem # list of td, filterred from searchList by searchKey. finally represent to User.
- function:
1. selectBtnClick # call the SelectBtnHandler



Class ControlPanel:
sub-components of MainPage, receive props.displayedItem.


in package
        // "apollo-server-express": "^3.12.0",
        // "mongodb": "^5.3.0",


