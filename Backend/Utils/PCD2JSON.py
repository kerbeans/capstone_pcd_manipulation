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
        return np.concatenate([points, colors], axis=-1)
    else:
        return np.concatenate([points, colors, normals], axis=-1)

#todo
#def JSON2PCD()

if __name__ == '__main__':
    pcd = o3d.io.read_point_cloud("test.pcd")
    print(PCD2JSON(pcd))