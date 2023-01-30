# server的入口
from flask import Flask
import open3d as o3d 
import numpy as np 
import json

app=Flask(__name__)



@app.route('/test')
def hello():
    filen='GlobalMap.pcd' 
    pcd=o3d.io.read_point_cloud(filen)
    return str(list(np.asarray(pcd.points)))

# import open3d as o3d
# import numpy as np
# import os
# filen='Server/GlobalMap.pcd' 
# pcd=o3d.io.read_point_cloud(filen)
# print(np.asarray(pcd.points).shape)
# print(type(pcd))