import json
import open3d as o3d
import numpy as np

HEADER = '''\
# .PCD v0.7 - Point Cloud Data file format
VERSION 0.7
FIELDS x y z intensity
SIZE 4 4 4 4 
TYPE F F F F 
COUNT 1 1 1 1 
WIDTH {}
HEIGHT 1
VIEWPOINT 0 0 0 1 0 0 0
POINTS {}
DATA ascii
'''

def PCD2JSON(pcd):
    colors = np.asarray(pcd.colors) * 255
    points = np.asarray(pcd.points)
    normals = np.asarray(pcd.normals)
    if colors.size == 0:
        colors = np.zeros((len(points),3), dtype=np.int32)
    if normals.size == 0:
        normals = np.zeros((len(points), 3), dtype=np.int32)
    data = np.concatenate([points, colors, normals], axis=-1)
    jdict = []
    for point in data:
        dict = {"x":point[0], "y":point[1], "z":point[2], "r":point[3], "g":point[4], "b":point[5], "n":point[6]}
        jdict.append(dict)
    jsondata = json.dumps(jdict)
    return jsondata

def JSON2PCD(points, path):
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)

    with open(path, 'w') as f:
        f.write(HEADER.format(len(points), len(points)) + '\n')
        np.savetxt(f, points, delimiter = ' ', fmt = '%f %f %f %d')
#todo
#def JSON2PCD()

if __name__ == '__main__':
    pcd = o3d.io.read_point_cloud("test.pcd")

    print(PCD2JSON(pcd))