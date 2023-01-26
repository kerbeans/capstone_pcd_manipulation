from enum import Enum

class FileType(Enum):
    type_xyz = 1
    type_xyzc = 2
    type_xyzi = 3

    @classmethod
    def get_type(cls, type):
        print("hello")