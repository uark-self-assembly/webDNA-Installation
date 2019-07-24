import chimera.extension

class MakePDBEMO(chimera.extension.EMO):
    def name(self):
        return 'load .pdb/.com'
    def description(self):
        return 'makes .pdb/.com from .dat/.com'
    def categories(self):
        return ['Utilities']
    def activate(self):
        self.module().makevis()

chimera.extension.manager.registerExtension(MakePDBEMO(__file__))
