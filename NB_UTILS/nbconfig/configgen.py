import yaml
import stickydesign
import logging
from copy import deepcopy

# a one-off glue class
class Glue:
    label = ""
    strength = 0
    sequence = []

class Tile:
    name = ""
    label = ""
    glues = {}
    
    def __init__(self):
        self.name = ""
        self.label = ""
        self.glues = {}
        return
    def __str__(self):
        ret = "Name: " + self.name
        ret = ret + "\nLabel: " + self.label
        return ret

def intsToSequence(intList):
    lookup = {0:'A', 1: 'C', 2: 'G', 3: 'T'}
    return [lookup[x] for x in intList]

def getComplement(sequence):
    lookup = {'A':'T', 'C': 'G', 'G': 'C', 'T': 'A'}
    return [lookup[x] for x in sequence]
            
def getTileSetFromYamlFile(inputFile, stickyEndLength = 5):
    tiles = []
    northGlueLabels = []
    southGlueLabels = []
    eastGlueLabels = []
    westGlueLabels = []
    topGlueLabels = []
    bottomGlueLabels = []
    with open(inputFile, 'r') as f:
        try:
            for t in yaml.load_all(f):
                tile = Tile()
                tile.name                = t['name']
                tile.label               = t['label']
                
                if 'north' in t['glues']:
                    tile.glues['north'] = Glue()
                    tile.glues['north'].label     = t['glues']['north']['label']
                    tile.glues['north'].strength  = t['glues']['north']['strength']
                    if tile.glues['north'].label not in northGlueLabels:
                        northGlueLabels.append(tile.glues['north'].label)
                if 'south' in t['glues']:
                    tile.glues['south'] = Glue()
                    tile.glues['south'].label     = t['glues']['south']['label']
                    tile.glues['south'].strength  = t['glues']['south']['strength']
                    if tile.glues['south'].label not in southGlueLabels and tile.glues['south'].label not in northGlueLabels:
                        southGlueLabels.append(tile.glues['south'].label)
                if 'east' in t['glues']:
                    tile.glues['east'] = Glue()
                    tile.glues['east'].label      = t['glues']['east']['label']
                    tile.glues['east'].strength   = t['glues']['east']['strength']
                    if tile.glues['east'].label not in eastGlueLabels:
                        eastGlueLabels.append(tile.glues['east'].label)
                if 'west' in t['glues']:
                    tile.glues['west'] = Glue()
                    tile.glues['west'].label      = t['glues']['west']['label']
                    tile.glues['west'].strength   = t['glues']['west']['strength']
                    if tile.glues['west'].label not in westGlueLabels and tile.glues['west'].label not in eastGlueLabels:
                        westGlueLabels.append(tile.glues['west'].label)
                if 'top' in t['glues']:
                    tile.glues['top'] = Glue()
                    tile.glues['top'].label       = t['glues']['top']['label']
                    tile.glues['top'].strength    = t['glues']['top']['strength']
                    if tile.glues['top'].label not in topGlueLabels:
                        topGlueLabels.append(tile.glues['top'].label)
                if 'bottom' in t['glues']:
                    tile.glues['bottom'] = Glue()
                    tile.glues['bottom'].label    = t['glues']['bottom']['label']
                    tile.glues['bottom'].strength = t['glues']['bottom']['strength']
                    if tile.glues['bottom'].label not in bottomGlueLabels and tile.glues['bottom'].label not in topGlueLabels:
                        bottomGlueLabels.append(tile.glues['bottom'].label)
                            
                tiles.append(tile)
        except:
            logging.error("Invalid Yaml Tile Set Format.")
            sys.exit(1)
        
    try:
        numGlues = len(northGlueLabels) + len(southGlueLabels) + len(eastGlueLabels) + len(westGlueLabels) + len(topGlueLabels) + len(bottomGlueLabels)
        ends = stickydesign.easyends('DT', stickyEndLength, number=numGlues)
        print ends.tolist()

        
    except:
        logging.error("Error creating sticky ends.")
        sys.exit(1)

    
    # The following code assigns designed sticky ends to glues base on labels so that matching labels (with same direction) get the same sticky ends, and matching labels with opposite direction
    # get complementary sticky ends.
    i = 0
    for t in tiles:
        glues = ['north', 'south', 'east', 'west', 'top', 'bottom']
        def setGlueSequences(glue, i):
            if glue not in t.glues or i >= numGlues:
                return i
            comp = {'north':'south', 'south':'north', 'east':'west', 'west':'east', 'top':'bottom', 'bottom':'top'}
            if len(t.glues[glue].sequence) == 0:
                t.glues[glue].sequence = intsToSequence(ends[i])[0:]
                i = i + 1
            
            for t2 in tiles:
                if comp[glue] in t2.glues and t2.glues[comp[glue]].label == t.glues[glue].label:
                    t2.glues[comp[glue]].sequence = getComplement(t.glues[glue].sequence)[0:]
                if glue in t2.glues and t2.glues[glue].label == t.glues[glue].label:
                    t2.glues[glue].sequence = t.glues[glue].sequence
            
            return i
            
        for glue in glues:
            i = setGlueSequences(glue, i)

    return tiles

if __name__ == '__main__':
    #todo: make this safe friendly
    
    import sys
    tileSet = getTileSetFromYamlFile(sys.argv[1], int(sys.argv[2]))

    for t in tileSet:
        print t.glues['north'].sequence
        print t.glues['south'].sequence
        print t.glues['east'].sequence
        print t.glues['west'].sequence
        print t.glues['top'].sequence
        print t.glues['bottom'].sequence
        print "\n"
    
