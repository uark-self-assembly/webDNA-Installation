#!/usr/bin/env python3

import argparse
import sys

# parsing command line arguments
parser = argparse.ArgumentParser(description="This function patches together trajectory files with indices into one trajectory file. Energy in the input files is ignored. Please enter energy in the command line arguments.")
parser.add_argument("output_file", type=str, nargs=1)
parser.add_argument("ETot", type=float, nargs=1)
parser.add_argument("U", type=float, nargs=1)
parser.add_argument("K", type=float, nargs=1)
parser.add_argument("input_file", type=str, nargs="+")


CommandLineArgs = parser.parse_args(sys.argv[1:])

# globals
Entries = {}
time = False
BoxSize1 = False
BoxSize2 = False
BoxSize3 = False
TotalEnergy = CommandLineArgs.ETot[0]
PotentialEnergy = CommandLineArgs.U[0]
KineticEnergy = CommandLineArgs.K[0]

# a generic particle in a configuration file
class Entry:
    XPosition = 0.0
    YPosition = 0.0
    ZPosition = 0.0
    XBaseVersor = 0.0
    YBaseVersor = 0.0
    ZBaseVersor = 0.0
    XNormalVersor = 0.0
    YNormalVersor = 0.0
    ZNormalVersor = 0.0
    XVelocity = 0.0
    YVelocity = 0.0
    ZVelocity = 0.0
    XAngularVelocity = 0.0
    YAngularVelocity = 0.0
    ZAngularVelocity = 0.0
    Index = 0


# takes a file and adds its particles to Entries list
def ParseFile(FileName):
    try:
        file = open(FileName, 'r')
    except:
        print(f"An error occurred while opening {FileName}!")
        return

    ParsedLineList = []

    # parsing file into data separated by spaces
    for line in file:

        line = " ".join(line.split("\n")).split(" ") # removes any \n (on windows) and parses line with " " as a delimiting charactor

        while (line.count('') > 0):
            line.remove('')

        ParsedLineList.append(line)

    # checking for well formed headers
    if (len(ParsedLineList) < 3):
        print(f"Header in {FileName} is not well formed!")
    elif (len(ParsedLineList[0]) != 3):
        print (f"Header in {FileName} is not well formed!")
    elif (len(ParsedLineList[1]) != 5):
        print (f"Header in {FileName} is not well formed!")
    elif (len(ParsedLineList[2]) != 5):
        print (f"Header in {FileName} is not well formed!")

    # checking that headers of all input files match
    global time, BoxSize1, BoxSize2, BoxSize3

    if (time == False):
        time =  ParsedLineList[0][2]
    if (BoxSize1 == False):
        BoxSize1 = ParsedLineList[1][2]
    if (BoxSize2 == False):
        BoxSize2 = ParsedLineList[1][3]
    if (BoxSize3 == False):
        BoxSize3 = ParsedLineList[1][4]

    if (time != False and time != ParsedLineList[0][2]):
        print(f"Header of file {FileName} does not match header of previous files")
    if (BoxSize1 != False and  BoxSize1 != ParsedLineList[1][2]):
        print(f"Header of file {FileName} does not match header of previous files")
    if (BoxSize2 != False and BoxSize2 != ParsedLineList[1][3]):
        print(f"Header of file {FileName} does not match header of previous files")
    if (BoxSize3 != False and BoxSize3 != ParsedLineList[1][4]):
        print(f"Header of file {FileName} does not match header of previous files")


    if (len(ParsedLineList) > 3):
        for idx in range(3, len(ParsedLineList)):
            if (len(ParsedLineList[idx]) != 16):
                print(f"Particle entry in {FileName} is not well formed!")
            else:
                TmpEntry = Entry()

                TmpEntry.XPosition, TmpEntry.YPosition, TmpEntry.ZPosition, \
                TmpEntry.XBaseVersor, TmpEntry.YBaseVersor, TmpEntry.ZBaseVersor, \
                TmpEntry.XNormalVersor, TmpEntry.YNormalVersor, TmpEntry.ZNormalVersor, \
                TmpEntry.XVelocity, TmpEntry.YVelocity, TmpEntry.ZVelocity, \
                TmpEntry.XAngularVelocity, TmpEntry.YAngularVelocity, TmpEntry.ZAngularVelocity, \
                TmpEntry.Index = ParsedLineList[idx]

                if TmpEntry.Index in Entries:
                    print(f"Particle entry with index {TmpEntry.Index} is multiply defined!")
                else:
                    Entries[TmpEntry.Index] = TmpEntry

    file.close()


def MakeOutput(FileName):
    try:
        file = open(FileName, 'w+')
    except:
        print("An error occured while making the output file!")
        return

    file.write(f"t = {time}\n")
    file.write(f"b = {BoxSize1} {BoxSize1} {BoxSize3}\n")
    file.write(f"E = {TotalEnergy} {PotentialEnergy} {KineticEnergy}\n")

    for entry in sorted(Entries.keys(), key=int):
        file.write(f"{Entries[entry].XPosition} {Entries[entry].YPosition} {Entries[entry].ZPosition} ")
        file.write(f"{Entries[entry].XBaseVersor} {Entries[entry].YBaseVersor} {Entries[entry].ZBaseVersor}")
        file.write(f"{Entries[entry].XNormalVersor} {Entries[entry].YNormalVersor} {Entries[entry].ZNormalVersor} ")
        file.write(f"{Entries[entry].XVelocity} {Entries[entry].YVelocity} {Entries[entry].ZVelocity} ")
        file.write(f"{Entries[entry].XAngularVelocity} {Entries[entry].YAngularVelocity} {Entries[entry].ZAngularVelocity} ")
        file.write(f"{Entries[entry].Index}\n")

    file.close()

for file in CommandLineArgs.input_file:
    ParseFile(file)

MakeOutput(CommandLineArgs.output_file[0])


