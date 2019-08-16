#!/usr/bin/env python

import os
import sys
import pickle

# TODO: allow for the search of directory paths

def main():
    # get oxDNA_gold abs path
    ox_base = find_oxDNA_base_dir()
    
    search_type = sys.argv[1]
    search_for = sys.argv[2]
    search_results = [search_for]

    if search_type == 'ext':
        os.path.walk(ox_base, get_file_relpaths_by_ext, search_results)
    elif search_type == 'name':
        os.path.walk(ox_base, get_file_relpaths_by_name, search_results)
    else:
        print 'Invalid search type.'
        sys.exit()

    print search_results

def find_oxDNA_base_dir():
    pp = 'paths.pickle'
    op = ''
    base_dir = 'oxDNA_gold'
    path_dict = {}

    # serialize this path as the search for it takes a long time    
    if os.path.isfile(pp): 
        with open(pp, 'rb') as f: path_dict = pickle.load(f)
        op = path_dict[base_dir] if base_dir in path_dict else ''
    else:
        def visit(args, dirname, names):
            if args[0] in names:
                p = os.path.join(dirname, args[0])
                rp = os.path.relpath(p, '.')
                args.append(rp)

        args = [base_dir]
        os.path.walk(os.path.expanduser('~'), visit, args)
        op = args[1]
        path_dict[base_dir] = op
        with open(pp, 'wb') as f: pickle.dump(path_dict, f)

    return op

def get_file_relpaths_by_ext(arg, dirname, names):
    for n in names:
        if n.endswith(arg[0]): 
            p = os.path.join(dirname, n)
            rp = os.path.relpath(p, '.')
            arg.append(rp) 

def get_file_relpaths_by_name(arg, dirname, names):
    for n in names:
        if n == arg[0]:
            p = os.path.join(dirname, n)
            rp = os.path.relpath(p, '.')
            arg.append(rp)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print 'usage <ext or name> <an ext or a name>'
    else:   
        main()
