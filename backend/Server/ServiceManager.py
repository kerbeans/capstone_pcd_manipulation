# 管理与前端通信的模块
from flask import request


@app.route('/files/upload',methods=['POST'])# upload file
def upload_file():
    ''' receive pcd file from the front.
        save it to database.
        returen whether successful    
        data:{# file type:
        json(file)}
    '''
    
    
    pass

@app.route('/files/download',methods=['GET'])
def download_file():
    ''' post PCD file to front end.
        data { pcd file name }
        return json(data)
    '''
    pass



@app.route('/files/preview',metohd={'GET'})
def files_preview():
    '''
        return  the file stored in database
    '''
    pass


