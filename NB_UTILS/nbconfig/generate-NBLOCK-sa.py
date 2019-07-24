#!/usr/bin/env python
"""
Standalone version of generate.py
Created for stable release end-users and machines without numpy support.
This file is only supported for stable release, and does not include more recent functionality.

(05 December 2012) 
"""

import sys, os, random
try:
    import numpy as np
except:
    import mynumpy as np


try:
    box_side = float(sys.argv[1])
    infile = sys.argv[2]
except:
    print >> sys.stderr, "Usage: %s <%s> <%s>" % (sys.argv[0], "box size", "file with sequences")
    sys.exit(1)
box = np.array ([box_side, box_side, box_side]) # subtract 20 prevents wrapping of molecules around the simulation box. oxDNA seems to seg fault when wrapping is present.

try:
    inp = open (infile, 'r')
    inp.close()
except:
    print >> sys.stderr, "Could not open file '%s' for reading. Aborting" % infile
    sys.exit(2)

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
    model = os.path.join(os.path.dirname(__file__), "./model.h")
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

number_to_base = {0 : 'A', 1 : 'G', 2 : 'C', 3 : 'T', 9 : 'N'}
base_to_number = {'A' : 0, 'a' : 0, 'G' : 1, 'g' : 1, 'C' : 2, 'c' : 2, 'T' : 3, 't' : 3, 'N' : 9, 'n' : 9}

positions = []
a1s = []
a3s = []
newpositions = []
newa1s = []
newa3s = []

def get_rotation_matrix(axis, anglest):
    # the argument anglest can be either an angle in radiants
    # (accepted types are float, int or np.float64 or np.float64)
    # or a tuple [angle, units] where angle a number and
    # units is a string. It tells the routine whether to use degrees,
    # radiants (the default) or base pairs turns
    if not isinstance (anglest, (np.float64, np.float32, float, int)):
        if len(anglest) > 1:
            if anglest[1] in ["degrees", "deg", "o"]:
                #angle = np.deg2rad (anglest[0])
                angle = (np.pi / 180.) * (anglest[0])
            elif anglest[1] in ["bp"]:
                angle = int(anglest[0]) * (np.pi / 180.) * (35.9)
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

def generateStrand(bp, sequence=None, start_pos=np.array([0, 0, 0]), dir=np.array([0, 0, 1]), perp=False, double=True, rot=0.):
    mynewpositions, mynewa1s, mynewa3s = [], [], []
    # we need a numpy array for these
    start_pos = np.array(start_pos, dtype=float)
    dir = np.array(dir, dtype=float)
    if sequence == None:
        sequence = np.random.randint(0, 4, bp)
    elif len(sequence) != bp:
        n = bp - len(sequence)
        sequence += np.random.randint(0, 4, n)
        print >> sys.stderr, "sequence is too short, adding %d random bases" % n

    # create the sequence of the second strand as made of complementary bases
    sequence2 = [3-s for s in sequence]
    sequence2.reverse()

    # we need to find a vector orthogonal to dir
    dir_norm = np.sqrt(np.dot(dir,dir))
    if dir_norm < 1e-10:
        print >> sys.stderr, "direction must be a valid vector, defaulting to (0, 0, 1)"
        dir = np.array([0, 0, 1])
    else: dir /= dir_norm

    if perp is None or perp is False:
        v1 = np.random.random_sample(3)
        v1 -= dir * (np.dot(dir, v1))
        v1 /= np.sqrt(sum(v1*v1))
    else:
        v1 = perp;

    # and we need to generate a rotational matrix
    R0 = get_rotation_matrix(dir, rot)
    R = get_rotation_matrix(dir, [1, "bp"])

    a1 = v1
    a1 = np.dot (R0, a1)
    rb = np.array(start_pos + a1)
    a3 = dir
    for i in range(bp):
        rcdm = rb - CM_CENTER_DS * a1
        mynewpositions.append (rcdm)
        mynewa1s.append(a1)
        mynewa3s.append(a3)
        if i != bp-1:
            a1 = np.dot(R, a1)
            rb += a3 * BASE_BASE

    if double == True: 
        a1 = -a1
        a3 = -dir
        R = R.transpose()
        for i in range(bp):
            rcdm = rb - CM_CENTER_DS * a1
            mynewpositions.append (rcdm)
            mynewa1s.append (a1)
            mynewa3s.append (a3)
            a1 = np.dot(R, a1)
            rb += a3 * BASE_BASE

    assert (len (mynewpositions) > 0)

    return [mynewpositions, mynewa1s, mynewa3s]

def addMolecules (mynewpositions, mynewa1s, mynewa3s):

    translationVector = np.random.random_sample(3) * box 
    while not canAddMolecule(mynewpositions, mynewa1s, mynewa3s, translationVector):
        translationVector = np.random.random_sample(3) * box 
        print "Trying again..."
        
    for p in mynewpositions:
        positions.append(p + translationVector)
    for p in mynewa1s:
        a1s.append (p)
    for p in mynewa3s:
        a3s.append (p)
        
    return True

def canAddMolecule (mynewpositions, mynewa1s, mynewa3s, translationVector = np.array([0,0,0])):
    overlap = False

    #if (translationVector[0] < 11 or translationVector[1] < 11 or translationVector[2] < 11):
     #   return False;

    for i in xrange(len(positions)):
        p = positions[i]
        pa1 = a1s[i]

        for j in xrange (len (mynewpositions)):
            q = mynewpositions[j] + translationVector
            qa1 = mynewa1s[j]

            p_pos_back = p + pa1 * POS_BACK
            p_pos_base = p + pa1 * POS_BASE
            q_pos_back = q + qa1 * POS_BACK
            q_pos_base = q + qa1 * POS_BASE

            dr = p_pos_back - q_pos_back
            dr -= box * np.rint (dr / box)
            if np.dot(dr, dr) < RC2_BACK:
                overlap = True

            dr = p_pos_base -  q_pos_base
            dr -= box * np.rint (dr / box)
            if np.dot(dr, dr) < RC2_BASE:
                overlap = True

            dr = p_pos_back - q_pos_base
            dr -= box * np.rint (dr / box)
            if np.dot(dr, dr) < RC2_BACK_BASE:
                overlap = True

            dr = p_pos_base - q_pos_back
            dr -= box * np.rint (dr / box)
            if np.dot(dr, dr) < RC2_BACK_BASE:
                overlap = True

            if overlap:
                return False

    return True

def readStrands(filename):
    """
    The main() function for this script
    Reads a text file with the following format:
    - Each line contains the sequence for a single strand (A,C,T,G)
    - Lines begining in DOUBLE produce double stranded DNA

    Ex: Two ssDNA (single stranded DNA)
    ATATATA
    GCGCGCG

    Ex: Two strands, one double stranded, the other single stranded.
    DOUBLE AGGGCT
    CCTGTA

    """
    
    try:
        infile = open (filename)
    except:
        print >> sys.stderr, "Could not open file ", filename, "Aborting now"
        sys.exit(2)

    if len(sys.argv) > 1:
        side = float(sys.argv[1])
    else: side = 50

    # get the number of strands and nucleotides
    nstrands, nnucl = 0, 0
    nBlockID = 0;
    lines = infile.readlines()
    for line in lines:
        line = line.upper().strip()
        if len(line) == 0:
            continue
        if line[:6] == 'DOUBLE':
            line = line.split()[1]
            length = len(line)
            print >> sys.stderr, "## Found duplex of %i bases" % (length)
            nnucl += 2 * length
            nstrands += 2
        elif line == "N":
            line = line.split()[0]
            nBlockID += 1
            print >> sys.stderr, "## Found nanoparticle %i" % (nBlockID)
            nnucl += len(line)
        else:
            line = line.split()[0]
            print >> sys.stderr, "## Found single strand of %i bases" % (len(line))
            nnucl += len(line)
            nstrands += 1

    infile.seek(0)

    print >> sys.stderr, "## nstrands, nnucl = ", nstrands, nnucl

    # here we generate the topology file
    try:
        out = open ("generated.top", "w")
    except:
        print >> sys.stderr, "Could not open generated.top for writing. Aborting"
        sys.exit(4)

    print >> out, nnucl, nstrands
    myns, mynn = 1, 0
    lines = infile.readlines()
    nBlockID = 0;
    for line in lines:
        line = line.upper().strip()
        if len(line) == 0: continue
        if line[:6] == 'DOUBLE':
            line = line.split()[1].upper()
            print >> out, myns, line[0], -1, mynn + 1
            mynn += 1
            for i in xrange (1, len(line) - 1):
                print >> out, myns, line[i], mynn - 1, mynn + 1
                mynn += 1
            print >> out, myns, line[-1], mynn - 1, -1
            mynn += 1
            myns += 1

            # get the compl sequence in numbers
            seq = [3 - base_to_number[x] for x in line]
            # put it back in letters
            line = [number_to_base[x] for x in seq[::-1]]

            print >> out, myns, line[0], -1, mynn + 1
            mynn += 1
            for i in xrange (1, len(line) - 1):
                print >> out, myns, line[i], mynn - 1, mynn + 1
                mynn += 1
            print >> out, myns, line[-1], mynn - 1, -1
            mynn += 1
            myns += 1
        elif line == "N":
            nBlockID += 1
        else:
            line = line.split()[0].upper()
            
            print >> out, nBlockID, myns, line[0], -1, mynn + 1
            mynn += 1
            for i in xrange (1, len(line) - 1):
                print >> out, nBlockID, myns, line[i], mynn - 1, mynn + 1
                mynn += 1
            print >> out, nBlockID, myns, line[-1], mynn -1, -1
            mynn += 1
            myns += 1
    out.close ()
    infile.seek (0)

    # generate the strands
    lines = infile.readlines()
    nlines = len(lines)
    i = 1
    
    cdm = np.array([0.0,0.0,0.0]) #np.random.random_sample(3) * (box/5)
    cdmOriginal = np.copy(cdm)
    
    strandCount = 0
    
    nb_positions = []
    nb_a1s = []
    nb_a3s = []

    for line in lines:
        line = line.upper().strip()
        # skip empty lines
        if len(line) == 0: continue
        elif line == "N":
            signX = 1.0 #if np.random.randint(2) == 1 else -1
            signY = 1.0 #if np.random.randint(2) == 1 else -1
            signZ = 1.0 #if np.random.randint(2) == 1 else -1
            if len(nb_positions) == 0:
                nb_positions.append(np.array([0.0, 0.0, 0.0]))
                nb_a1s.append(np.array([1.0, 0.0, 0.0]))
                nb_a3s.append(np.array([0.0, 0.0, 1.0]))
                strandCount = 0 #2*random.randint(0,2) JGH : uncomment for general case
            else:
                print len(nb_positions)
                addMolecules(nb_positions, nb_a1s, nb_a3s)
                nb_positions[:] = []
                nb_a1s[:] = []
                nb_a3s[:] = []
                nb_positions.append(np.array([0.0, 0.0, 0.0]))
                nb_a1s.append(np.array([1.0, 0.0, 0.0]))
                nb_a3s.append(np.array([0.0, 0.0, 1.0]))
                strandCount =  0 #2*random.randint(0,2) JGH : uncomment for general case
            
        else:
            seq = [base_to_number[x] for x in line]
            shift = 0.0 # JGH: may use FENE_R0
            cdm = np.copy(cdmOriginal)
            if (strandCount == 0):
                cdm[0] = cdm[0] + signX*(3 + shift)
                axis = [signX*1,0,0]
            elif (strandCount == 1):
                axis = [signX*-1,0,0]
                cdm[0] = cdm[0] - signX*(3 + shift)
            elif (strandCount == 2):
                axis = [0,signY*1,0]
                cdm[1] = cdm[1] + signY*(3 + shift)
            elif (strandCount == 3):              
                axis = [0,signY*-1,0]
                cdm[1] = cdm[1] - signY*(3 + shift)
            elif (strandCount == 4):
                axis = [0,0,signZ*1]
                cdm[2] = cdm[2] + signZ*(3 + shift)
            elif (strandCount == 5):              
                axis = [0,0,signZ*-1]
                cdm[2] = cdm[2] - signZ*3
            newpositions, newa1s, newa3s = generateStrand(len(line), sequence=seq, dir=axis, start_pos=cdm, double=False)
            
            for p in newpositions:
                nb_positions.append(p)
            for p in newa1s:
                nb_a1s.append(p)
            for p in newa3s:
                nb_a3s.append(p)

                        
            strandCount = (strandCount + 1)% 6
                
            

        i += 1

    # find positions for the last nblock
    if not len(nb_positions) == 0:
        addMolecules(nb_positions, nb_a1s, nb_a3s)
    


    if not len(positions) == nnucl:
        print len(positions), nnucl
        raise AssertionError

    # here we generate the configuration file (coordinates)
    try:
        outfile = open ('generated.dat', 'w')
    except:
        print >> sys.stderr, "Could not open generated.dat for writing.  Aborting"
        sys.exit(5)

    print >> outfile, "t = 0"
    print >> outfile, "b = ", box_side, box_side, box_side
    print >> outfile, "E = 0. 0. 0."
    for i in xrange(nnucl):
        print >> outfile, positions[i][0], positions[i][1], positions[i][2],
        print >> outfile, a1s[i][0], a1s[i][1], a1s[i][2],
        print >> outfile, a3s[i][0], a3s[i][1], a3s[i][2],
        print >> outfile, 0., 0., 0., 0., 0., 0. # v and L

    outfile.close()
    print >> sys.stderr, "## ALL DONE. just generated 'generated.dat' and 'generated.top'"

readStrands (infile)
