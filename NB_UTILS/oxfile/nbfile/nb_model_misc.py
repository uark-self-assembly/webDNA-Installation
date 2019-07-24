import sys, os
import numpy as np

GROOVE_ENV_VAR = 'OXDNA_GROOVE'

# return parts of a string 
def partition(s, d):
    if d in s:
        sp = s.split(d, 1)
        return sp[0], d, sp[1]
    else:
        return s, "", ""

# every defined macro in model.h must be imported in this module
def import_model_constants():
    PI = np.pi
    model = os.path.join(os.path.dirname(__file__), "../model.h")
    f = open(model)
    for line in f.readlines():
        # line = line.strip().partition("//")[0].strip()
        line = (partition (line.strip (), "//")[0]).strip ()
        #macro = line.partition("#define ")[2].strip().split(" ", 1)
        macro = (partition (line, "#define ")[2]).strip().split(" ", 1)
        if len(macro) > 1:
            key, val = [x.strip() for x in macro]
            # the f needed by c to interpret numbers as floats must be removed
            # this could be a source of bugs
            val = val.replace("f", "")
            # this awful exec is needed in order to get the right results out of macro definitions
            exec "tmp = %s" % (val)
            globals()[key] = tmp
    f.close()

import_model_constants()

CM_CENTER_DS = POS_BASE + 0.2
BASE_BASE = 0.3897628551303122

RC2_BACK = EXCL_RC1**2
RC2_BASE = EXCL_RC2**2
RC2_BACK_BASE = EXCL_RC3**2

number_to_base = {0 : 'A', 1 : 'G', 2 : 'C', 3 : 'T'}
base_to_number = {'A' : 0, 'a' : 0, 'G' : 1, 'g' : 1,
                  'C' : 2, 'c' : 2, 'T' : 3, 't' : 3}
base_number_to_name = {0 :'O', 1 : 'S', 2 : 'K', 3 : 'P'}

# for chimera output
strtypes = ["ALA","GLY","CYS","ARG","PHE","LYS","SER","PRO","VAL","ASN","ASP"]

def get_rotation_matrix(axis, anglest):
    # the argument anglest can be either an angle in radiants
    # (accepted types are float, int or np.float64 or np.float64)
    # or a tuple [angle, units] where angle a number and 
    # units is a string. It tells the routine whether to use degrees,
    # radiants (the default) or base pairs turns
    if not isinstance (anglest, (np.float64, np.float32, float, int)):
        if len(anglest) > 1:
            if anglest[1] in ["degrees", "deg", "o"]:
                angle = np.deg2rad (anglest[0])
            elif anglest[1] in ["bp"]:
                angle = int(anglest[0]) * np.deg2rad(35.9)
            else:
                angle = float(anglest[0])
        else:
            angle = float(anglest[0]) 
    else:
        angle = float(anglest) # in degrees, I think
    
    axis = np.array(axis)
    axis /= np.sqrt(np.dot(axis, axis))
    
    ct = np.cos(angle)
    st = np.sin(angle)
    olc = 1. - ct
    x, y, z = axis
    
    return np.array([[olc*x*x+ct, olc*x*y-st*z, olc*x*z+st*y],
                    [olc*x*y+st*z, olc*y*y+ct, olc*y*z-st*x],
                    [olc*x*z-st*y, olc*y*z+st*x, olc*z*z+ct]])

def anisotropic_temperature_factors(i, a1s, a2s, a3s):
    # magic to get nice ellipse of the base particle
    I_b = np.matrix(((1.1,0,0),(0,1.5,0),(0,0,2.2)))

    # note: a2s = np.cross(a3s[i], a1s[i])
    R = np.matrix((a1s[i], a2s[i], a3s[i]))

    I_l = R.T * I_b * R
    
    anis = np.multiply(-1,I_l)
    anis[0,0] = (I_l[1,1]+I_l[2,2]-I_l[0,0])/2.0
    anis[1,1] = (I_l[0,0]+I_l[2,2]-I_l[1,1])/2.0
    anis[2,2] = (I_l[0,0]+I_l[1,1]-I_l[2,2])/2.0

    return np.multiply(anis, 1000)
