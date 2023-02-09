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


from markupsafe import escape

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return f'User {escape(username)}'

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, the id is an integer
    return f'Post {post_id}'

@app.route('/path/<path:subpath>')
def show_subpath(subpath):
    # show the subpath after /path/
    return f'Subpath {escape(subpath)}'

import open3d as o3d
import numpy as np
import os
filen='Server/GlobalMap.pcd' 
pcd=o3d.io.read_point_cloud(filen) 
print(np.asarray(pcd.points)[:10])
print(type(pcd))