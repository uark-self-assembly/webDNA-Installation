/// <reference path="./three/index.d.ts" />

var BACKBONE = 0
var NUCLEOSIDE = 1 
var BB_NS_CON = 2
var COM = 3
var SP_CON= 4

render();
// nucleotides store the information about position, orientation, ID
// Eventually there should be a way to pair them
// Everything is an Object3D, but only nucleotides have anything to render
class Nucleotide {
    local_id: number; //location on strand
    global_id: number; //location in world - all systems
    pos: THREE.Vector3; //not automatically updated
    neighbor3: Nucleotide | null;
    neighbor5: Nucleotide | null;
    pair: number;
    type: number | string; // 0:A 1:G 2:C 3:T/U
    my_strand: number;
    my_system: number;
    visual_object: THREE.Group; //contains 4 THREE.Mesh

    constructor(global_id: number, parent_system: number) {
        this.global_id = global_id;
        this.my_system = parent_system;

    };
};

// strands are made up of nucleotides
// strands have an ID within the system
class Strand {

    strand_id: number; //system location
    nucleotides: Nucleotide[] = [];
    my_system: System;
    strand_3objects: THREE.Group; //contains Nucleotide.visual_objects

    constructor(id: number, parent_system: System) {
        this.strand_id = id;
        this.my_system = parent_system;
        this.strand_3objects = new THREE.Group;
    };

    add_nucleotide(nuc: Nucleotide) {
        this.nucleotides.push(nuc);
        nuc.local_id = this.nucleotides.indexOf(nuc);
    };

    remove_nucleotide(to_remove: number) {
        this.nucleotides.forEach(function (nucleotide, i) {
            if (nucleotide.local_id === to_remove) {
                scene.remove(nucleotide.visual_object);
            }
        })
    };

};

// systems are made of strands
// systems can CRUD
class System {

    system_id: number;
    strands: Strand[] = [];
    CoM: THREE.Vector3; //System center of mass
    global_start_id: number; //1st nucleotide's global_id
    system_3objects: THREE.Group; //contains strand_3objects
    strand_to_material = {};
    base_to_material = {};
    constructor(id, start_id) {
        this.system_id = id;
        this.global_start_id = start_id;
        this.system_3objects = new THREE.Group;
    };

    system_length(): number {
        let count: number = 0;
        for (let i = 0; i < this.strands.length; i++) {
            count += this.strands[i].nucleotides.length;
        }
        return count;
    }

    add_strand(strand: Strand) {
        this.strands.push(strand);
    };

    remove_strand(to_remove: number) {
        this.strands.forEach(function (strand, i) {
            if (strand.strand_id === to_remove) {
                for (let j = 0; j < strand.nucleotides.length; j++) {
                    strand.remove_nucleotide(j);
                }
            };
        })
    };

    setStrandMaterial(strand_to_material) {
        this.strand_to_material = strand_to_material;
    }
    setBaseMaterial(base_to_material) {
        this.base_to_material = base_to_material;
    }

    //remove_system(){};
};

function dat_loader (file) {

}

// store rendering mode RNA  
let RNA_MODE = false; // By default we do DNA base spacing
// add base index visualistion
var nucleotide_3objects: THREE.Group[] = []; //contains references to all THREE.Group obj
var nucleotides: Nucleotide[] = []; //contains references to all nucleotides
//var selected_bases = {};
//initialize the space
var systems: System[] = [];
let sys_count: number = 0;
let strand_count: number = 0;
let nuc_count: number = 0;
var selected_bases: number[] = [];
var backbones: THREE.Object3D[] = [];
let lut, devs: number[]; //need for Lut coloring
let lutCols: THREE.Color[] = [];
let lutColsVis: boolean = false;

/*function updatePos(sys_count) { //sets positions of system, strands, and visual objects to be located at their cms - messes up rotation sp recalculation and trajectory
    for (let h = sys_count; h < sys_count + 1; h++) { //for current system
        let cmssys = new THREE.Vector3(); //system cms
        let n = systems[h].system_length(); //# of nucleotides in system
        for (let i = 0; i < systems[h].system_3objects.children.length; i++) { //for each strand
            let n1 = systems[h].system_3objects.children[i].children.length; //for strand_3objects in system_3objects
            let cms = new THREE.Vector3(); //strand cms
            for (let j = 0; j < n1; j++) { //for each visual_object
                let rotobj = systems[h].system_3objects.children[i].children[j]; //current nuc's visual_object
                let n2 = rotobj.children.length; //# of Meshes in visual_object/rot obj
                let cms1 = new THREE.Vector3(); //group cms
                let currentpos = new THREE.Vector3();
                //sum cms of all visual_object in each system, strand, and itself
                cms.add(rotobj.children[3].position); //strand cms
                cms1 = rotobj.children[3].position; //rotobj cms
                let cmsx = cms1.x, cmsy = cms1.y, cmsz = cms1.z;
                cmssys.add(rotobj.children[3].position); //system cms

                for (let k = 0; k < n2; k++) { //for all Meshes in rotobj/visual_object translate by -cms1
                    rotobj.children[k].applyMatrix(new THREE.Matrix4().makeTranslation(-cmsx, -cmsy, -cmsz));
                }
                rotobj.position.set(0, 0, 0);
                rotobj.applyMatrix(new THREE.Matrix4().makeTranslation(cmsx, cmsy, cmsz)); //translate rotobj by cms1
            }
            //calculate strand cms
            let mul = 1.0 / n1;
            cms.multiplyScalar(mul);
            for (let k = 0; k < n1; k++) { //for each nucleotide in strand, translate by -cms
                systems[h].strands[i].strand_3objects.children[k].applyMatrix(new THREE.Matrix4().makeTranslation(-cms.x, -cms.y, -cms.z));
            }
            systems[h].strands[i].strand_3objects.position.set(0, 0, 0);
            systems[h].strands[i].strand_3objects.applyMatrix(new THREE.Matrix4().makeTranslation(cms.x, cms.y, cms.z)); //translate strand by cms
        }
        //calculate system cms
        let mul = 1.0 / n;
        cmssys.multiplyScalar(mul);
        for (let k = 0; k < systems[h].system_3objects.children.length; k++) { //for each strand, translate by -cmssys
            systems[h].system_3objects.children[k].applyMatrix(new THREE.Matrix4().makeTranslation(-cmssys.x, -cmssys.y, -cmssys.z));
        }
        systems[h].system_3objects.position.set(0, 0, 0);
        systems[h].system_3objects.applyMatrix(new THREE.Matrix4().makeTranslation(cmssys.x, cmssys.y, cmssys.z)); //translate system by cmssys
    }
}*/

function toggleLut(chkBox) { //toggles display of coloring by flexibility / structure modeled off of base selector
    if (lutCols.length > 0) { //lutCols stores each nucleotide's color (determined by flexibility)
        if (lutColsVis) { //if "Display Flexibility" checkbox selected (currently displaying coloring) - does not actually get checkbox value; at onload of webpage is false and every time checkbox is changed, it switches boolean
            for (let i = 0; i < nucleotides.length; i++) { //for all nucleotides in all systems - does not work for more than one system
                let sysID = nucleotides[i].my_system;
                let back_Mesh: THREE.Object3D = nucleotides[i].visual_object.children[BACKBONE]; //backbone
                let nuc_Mesh: THREE.Object3D = nucleotides[i].visual_object.children[NUCLEOSIDE]; //nucleoside
                let con_Mesh: THREE.Object3D = nucleotides[i].visual_object.children[BB_NS_CON]; //backbone nucleoside connector; cms posObj Mesh does not have a shape or color, etc.
                let sp_Mesh: THREE.Object3D = nucleotides[i].visual_object.children[SP_CON]; //sugar phosphate connector
                if (back_Mesh instanceof THREE.Mesh) { //needed because Object3D "may not be" THREE.Mesh
                    if (back_Mesh.material instanceof THREE.MeshLambertMaterial) { //needed because Mesh.material "may not be" MeshLambertMaterial
                        back_Mesh.material = (systems[sysID].strand_to_material[nucleotides[i].global_id]); //set material to material stored earlier based on strandID
                    }
                }
                if (nuc_Mesh instanceof THREE.Mesh) {
                    if (nuc_Mesh.material instanceof THREE.MeshLambertMaterial || nuc_Mesh.material instanceof THREE.MeshLambertMaterial) {
                        nuc_Mesh.material = (systems[sysID].base_to_material[nucleotides[i].global_id]); //set material to material stored earlier based on base id
                    }
                }
                if (con_Mesh instanceof THREE.Mesh) {
                    if (con_Mesh.material instanceof THREE.MeshLambertMaterial) {
                        con_Mesh.material = (systems[sysID].strand_to_material[nucleotides[i].global_id]);
                    }
                }
                if (sp_Mesh !== undefined && sp_Mesh instanceof THREE.Mesh) {
                    if (sp_Mesh.material instanceof THREE.MeshLambertMaterial) {
                        sp_Mesh.material = (systems[sysID].strand_to_material[nucleotides[i].global_id]);
                    }
                }
            }
            lutColsVis = false; //now flexibility coloring is not being displayed and checkbox is not selected
        }
        else {
            for (let i = 0; i < nucleotides.length; i++) { //for each nucleotide in all systems - does not work for multiple systems yet
                let tmeshlamb = new THREE.MeshLambertMaterial({ //create new MeshLambertMaterial with appropriate coloring stored in lutCols
                    color: lutCols[i],
                    side: THREE.DoubleSide
                });
                for (let j = 0; j < nucleotides[i].visual_object.children.length; j++) { //for each Mesh in each nucleotide's visual_object
                    if (j != 3) { //for all except cms posObj Mesh
                        let tmesh: THREE.Object3D = nucleotides[i].visual_object.children[j];
                        if (tmesh instanceof THREE.Mesh) { //needed because nucleotides[i].visual_object.children[j] "may not be" a Mesh
                            tmesh.material = tmeshlamb;
                        }
                    }
                }
            }
            lutColsVis = true; //now flexibility coloring is being displayed and checkbox is selected
        }
        render();
    }
    else {
        alert("Please drag and drop the corresponding .json file.");
        chkBox.checked = false;
    }
}


function cross(a1, a2, a3, b1, b2, b3) { //calculate cross product of 2 THREE.Vectors but takes coordinates as (x,y,z,x1,y1,z1)
    return [a2 * b3 - a3 * b2,
    a3 * b1 - a1 * b3,
    a1 * b2 - a2 * b1];
}

function centerSystems() { //centers systems based on cms calculated for world (all systems)
    //get center of mass for all systems
    let cms = new THREE.Vector3(0,0,0);
    for (let i = 0; i < nucleotides.length; i++) { 
        let tmp_pos = new THREE.Vector3;
        tmp_pos.setFromMatrixPosition(nucleotides[i].visual_object.children[COM].matrixWorld);  
        cms.add(tmp_pos);
    }
    let mul = 1.0/nucleotides.length;
    cms.multiplyScalar(mul*-1);

    //change position by the center of mass
    for (let x = 0; x < nucleotide_3objects.length; x++) { //for each system, translate system by -world cms
        nucleotide_3objects[x].position.add(cms);
    }
    render();
}

//strand delete testcode
document.addEventListener("keypress", event => {
    if (event.keyCode === 100) { //if d is pressed, delete first system's first strand
        systems[0].remove_strand(1);
        render();
    }
});