import os
import Tkinter, tkFileDialog, Tkconstants

import chimera
from chimera.baseDialog import ModelessDialog

import nbchimera 
from oxfile.nbfile.nb_simdata import *
from oxfile.nbfile.nb_visfunctions import *

import numpy as np

dialog = None

class MakePDBDialog(ModelessDialog):

    name = "make pdb ui"

    buttons = ("Apply", "Close")

    title = "Make .pdb / .com files"

    def __init__(self, *args, **kw):
        self.ox_simdata_by_model_num = {} 
        apply(ModelessDialog.__init__, (self,) + args, kw)

    def fillInUI(self, parent):
        self._toplevel.wm_attributes('-topmost', 1)
        self.p_frame = parent

        self.dat_file = Tkinter.StringVar(self.p_frame)
        self.dat_file.set('')
        self.top_file = Tkinter.StringVar(self.p_frame)
        self.top_file.set('')

        self.button_opt = {'fill': Tkconstants.BOTH, 'padx': 5, 'pady': 5 }

        Tkinter.Button(self.p_frame, text='.dat file', command=self.ask_dat_filename).pack(**self.button_opt)
        Tkinter.Button(self.p_frame, text='.top file', command=self.ask_top_filename).pack(**self.button_opt)
        Tkinter.Button(self.p_frame, text='transform all', command=self.transform_popup).pack(**self.button_opt)

        self.dat_file_opt = options = {}
        options['initialdir'] = '~/Documents/'
        options['defaultextension'] = '.dat'
        options['filetypes'] = [('.dat files', '.dat'), ('.conf files', '.conf')]

        self.top_file_opt = options = {}
        options['initialdir'] = '~/Documents/'
        options['defaultextension'] = '.top'
        options['filetypes'] = [('.top files', '.top')]

    # .dat or .conf files
    def ask_dat_filename(self):
        self.dat_file = tkFileDialog.askopenfilename(**self.dat_file_opt)

    # .top files (topology)
    def ask_top_filename(self):
        self.top_file = tkFileDialog.askopenfilename(**self.top_file_opt)

    def transform_popup(self):
        self._toplevel.wm_attributes('-topmost', 1)
        top = self.top = Tkinter.Toplevel(self.p_frame)

        Tkinter.Button(top, text='directory', command=self.ask_directory).pack(**self.button_opt)

        Tkinter.Label(top, text='.dat filename').pack()
        self.dat_file = Tkinter.Entry(top)
        self.dat_file.pack(**self.button_opt)

        Tkinter.Label(top, text='.top filename').pack()
        self.top_file = Tkinter.Entry(top)
        self.top_file.pack(**self.button_opt)

        Tkinter.Button(top, text='save', command=self.save_transform).pack(**self.button_opt)

    def ask_directory(self):
        dir_opt = {'mustexist' : False}
        self.base_dir = tkFileDialog.askdirectory(**dir_opt)


    # potential issue will be the difference in the translation vector
    # maybe each import should have np centered at (0, 0, 0)
    # but the scale could still be an issue

    def get_dat_header(self, models):
        t = 't = 0'
        # TLF: TODO calculate box size using simulation data + models data,
        #      for now just using constant value
        b = 'b = 25.0 25.0 25.0'
        E = 'E = 0.0 0.0 0.0'
        return [t, b, E]


    def format_all_model_xforms(self, models):
        # gather {id : (rotation matrix, translation vector)} for each molecule in openModels
        # note: model == molecule (in our case)
        # in chimera xform is an object belonging to a molecule with two fields we need
        #   1) rotation matrix  2) translation vector

        xform_by_model_num = {}

        for m in models:
            coord_frame = m.openState.xform.getCoordFrame()
            c1 = coord_frame[0] # 1st column of rotation matrix  
            c2 = coord_frame[1] # 2nd column of rotation matrix
            c3 = coord_frame[2] # 3rd column of rotation matrix
            tv = coord_frame[3] # translation vector 
            xform_by_model_num[m.id] = (np.matrix([c1, c2, c3]).transpose(), np.array(tv))

        return xform_by_model_num

    def make_monolithic_dat(self, models):
        xform_by_model_num = self.format_all_model_xforms(models)

        assert set(xform_by_model_num.keys()) == set(self.ox_simdata_by_model_num.keys())

        # format for printing: takes np.array([x, y, z]) to 'x y z'
        p = lambda vec: ' '.join(map(str, vec.getA1()))

        dat_header = self.get_dat_header(models)
        mono_dat = []
        mono_dat += dat_header

        zero_vec = ' 0.0 0.0 0.0' 

        #for i in self.ox_simdata_by_model_num:
        for m in models:
            sd = self.ox_simdata_by_model_num[m.id]
            rotation_matrix, translation_vector = xform_by_model_num[m.id]

            # apply rotation/translation 
            f = lambda vec, cdm: rotation_matrix * (vec.reshape(3, 1) - cdm.reshape(3, 1)) + cdm.reshape(3, 1) + translation_vector.reshape(3, 1)
            f2 = lambda vec: rotation_matrix * (vec.reshape(3, 1))

            rcs_itr = iter(sd.rcs)
            a1s_itr = iter(sd.a1s)
            a3s_itr = iter(sd.a3s)
            nb_rcs_itr = iter(sd.nb_rcs)
            nb_a1s_itr = iter(sd.nb_a1s)
            nb_a3s_itr = iter(sd.nb_a3s)
            nb_cdm_itr = iter(sd.nb_cdm)

            cdm = np.array([0.0,0.0,0.0])

            for i in xrange(sd.nparticles):
                if i not in sd.nblockindex:
                    position = f(next(rcs_itr), cdm)
                    backbone = f2(next(a1s_itr))
                    normal = f2(next(a3s_itr)) 
                    line_str = p(position) + ' ' + p(backbone) + ' ' + p(normal) + zero_vec * 2
                else:
                    cdm = next(nb_cdm_itr).copy()
                    position = f(cdm, cdm)
                    backbone = f2(next(nb_a1s_itr))
                    normal = f2(next(nb_a3s_itr)) 
                    line_str = p(position) + ' ' + p(backbone) + ' ' + p(normal) + zero_vec * 2
                mono_dat.append(line_str)

        return mono_dat

    def get_top_header(self, models):
        particle_count = 0
        strand_count = 0
        for m in models:
            sd = self.ox_simdata_by_model_num[m.id]
            particle_count += sd.nparticles
            strand_count += sd.nstrands

        return '{0} {1}'.format(particle_count, strand_count)

    def make_monolithic_top(self, models):
        topology_header = self.get_top_header(models)
        mono_top = []
        mono_top.append(topology_header)

        # as we make a new topology file which is a combination of all the imported topology
        # files we need to adjust the old ids.
        n3 = -1 
        n5 = 1
        running_total_nb = 0
        running_total_st = 0

        for m in models:
            sd = self.ox_simdata_by_model_num[m.id]
            assert len(sd.nblockid) == len(sd.strandid) == len(sd.basetype) == len(sd.nn3) == len(sd.nn5) == sd.nnucleot
            nb = 1 
            st = 0
            for i in xrange(sd.nnucleot):
                nb = nb + 1 if sd.nblockid[i] != nb else nb
                line_nb = nb + running_total_nb

                st = st + 1 if sd.strandid[i] != st else st
                line_st = (st + 1) + running_total_st

                line_n3 = -1 if sd.nn3[i] == -1 else n3

                line_n5 = -1 if sd.nn5[i] == -1 else n5

                line = '{0} {1} {2} {3} {4}'.format(line_nb, line_st, sd.basetype[i], line_n3, line_n5)
                mono_top.append(line)

                n3 += 1
                n5 += 1

            running_total_nb += sd.nnblocks
            running_total_st += sd.nstrands

        return mono_top

    def make_monolithic_sim_data(self):
        from chimera import openModels
        models = openModels.list()

        self.mono_dot_dat = self.make_monolithic_dat(models)
        self.mono_dot_top = self.make_monolithic_top(models) 

    def save_transform(self): 
        if not os.path.isdir(self.base_dir):
            os.mkdir(self.base_dir)

        ts = self.make_timestamp()

        file_name = self.dat_file.get() if self.dat_file.get() != '' else 'nBLOCK_xform_' + ts 
        self.final_dat_file = os.path.join(self.base_dir, file_name + '.dat')

        file_name = self.top_file.get() if self.top_file.get() != '' else 'nBLOCK_xform_' + ts 
        self.final_top_file = os.path.join(self.base_dir, file_name + '.top')

        self.mono_dot_dat = []
        self.mono_dot_top = []
        self.make_monolithic_sim_data()

        fd = open(self.final_dat_file, 'w')
        for line in self.mono_dot_dat:
            print >> fd, line
        fd.close()

        fd = open(self.final_top_file, 'w')
        for line in self.mono_dot_top:
            print >> fd, line
        fd.close()

    def get_model_num(self):
        # -query chimera to get the current number of open models 
        # -each import is considered a model, regardless how many nBLOCKS are included
        # -we number our models starting at 0 
        # -this is necessary b/c the target of chimera commands are designated by a model number
        from chimera import openModels
        return len(chimera.openModels.list())

    def make_timestamp(self): 
        # for now using timestamp to create unique base file name for output files
        import time, datetime
        ts = time.time()
        return datetime.datetime.fromtimestamp(ts).strftime('%d-%m-%Y_%H:%M:%S')

    def make_base_filename(self, model_num, ts):
        # explanation of base filename:  
        # -say we have a .dat file 'sim.dat', we split off the '.dat', then concat the 
        #   model number and timestamp.
        # -this is b/c later we must link the model that is active in chimera back
        #   to the orignal .dat file, so that we can apply the matrix transformations 
        f = os.path.split(self.dat_file)[1]
        f = os.path.splitext(f)[0]
        return f + '.' + str(model_num) + '.' + ts

    def get_dir_name(self):
        home_dir = os.path.expanduser('~')
        nb_chim_dir = '.chimera/nbchimera_tmp_storage'
        base_of_op = os.path.join(home_dir, nb_chim_dir)
        if not os.path.exists(base_of_op):
            os.mkdir(base_of_op)
        return base_of_op

    def Apply(self):
        sim_data = NBSimulationData()
        # initialize simulation data object
        sim_data.load_all_sim_data_plus(self.top_file, self.dat_file)

        # convert ox simulation data to pdb format
        pdb_str = get_pdb_str(sim_data)

        model_num = self.get_model_num()

        self.ox_simdata_by_model_num[model_num] = sim_data

        com_list = get_chimera_commands(sim_data, model_num)

        ts = self.make_timestamp()

        base_filename = self.make_base_filename(model_num, ts)

        base_of_op = self.get_dir_name()

        # (where to store tmp files on windows?)
        if sys.platform.startswith('linux'):
            base_filename = os.path.join(base_of_op, base_filename)

        pdb_filename = base_filename + '.pdb'
        pdb = open(pdb_filename, 'w')
        pdb.write(pdb_str)
        pdb.close()

        com_filename = base_filename + '.com'
        com_file = open(com_filename, 'w')
        for c in com_list: 
            print >> com_file, c
        com_file.close()

        from chimera import runCommand as rc
        rc("open " + pdb_filename)
        rc("open " + com_filename)

def ShowPDBUI():

    global dialog
    if dialog is not None:
        dialog.enter()
        return

    dialog = MakePDBDialog()

chimera.dialogs.register(MakePDBDialog.name, MakePDBDialog)

