/*
This file is part of HTMoL:
Copyright (C) 2014 Dr. Mauricio Carrillo-Tripp  
http://tripplab.com

Developers:
v1.0 Leonardo Alvarez-Rivera, Francisco Javier Becerra-Toledo, Adan Vega-Ramirez 
v2.0 Javier Garcia-Vieyra
v3.0 Omar Israel Lara-Ramirez, Eduardo González-Zavala, Emmanuel Quijas-Valades, Julio Cesar González-Vázquez
v3.5 Leonardo Alvarez-Rivera
*/

var contBonds = 0;
var contBS = 0;

var LstAtSelec = [];

var CzPers;

function Aminoacid(number, name, state) {
	this.Number = number;
	this.Name = name;
	this.State = state;
	this.LstAtoms = [];
	this.Type = null;

	this.GetAtoms = function () {
		return this.LstAtoms;
	}
}

function Chain(name, state) {
	this.Name = name;
	this.State = state;
	this.LstAminoAcid = [];
	this.LstSkeleton = [];

	this.GetSkeleton = function () {
		return this.LstSkeleton;
	}

	this.GetAminoacid = function () {
		return this.LstAminoAcid;
	}
}

function Bond() {
	this.LstAtoms = [];
	this.id = 0;
	this.State = null; ////////////////////////////////////////////////////////////////////////

	this.BPosition = null; //es para saber en qué posición del arreglo se encuentra esta línea
}

function BondSkeleton() {
	this.id = 0;
	this.LstAtoms = [];
}

function Molecule() {
	this.Name = '';
	this.LstChain = [];
	this.LstAtoms = [];
	this.LstBonds = [];
	this.LstBondsSkeleton = [];
	this.LstHelixAndSheet = [];
	this.CenterX = 0;
	this.CenterY = 0;
	this.CenterZ = 0;
	this.Frames = 0;
	this.TrjPath = "";
	this.BoxX = 0;
	this.BoxY = 0;
	this.BoxZ = 0;
	this.GetChain = function () {
		return this.LstChain;
	}

	this.GetBonds = function () {
		return this.LstBonds;
	}

	this.GetAtoms = function () {
		return this.LstAtoms;
	}

	this.GetBSkeleton = function () {
		return this.LstBondsSkeleton;
	}
	this.GetBoxX = function () {
		return this.BoxX;
	}
	this.GetBoxY = function () {
		return this.BoxY;
	}
	this.GetBoxZ = function () {
		return this.BoxZ;
	}

}

function Atom(number, x, y, z, state, element, nameatom) {
	this.X = x;
	this.Y = y;
	this.Z = z;
	this.State = state;
	this.NumberAtom = number;
	this.Element = element;
	this.NameAtom = nameatom;
	this.Aminoacid = null;
	this.AminoNum = null;

	this.ColorName = null;
	this.ColorRGB = null;
	this.ColorRGBDiffuse = null;
	this.Seleccionado = false; //
	this.Representation = null;

	this.LstLinea = [];
	this.LstLineaSke = [];

	this.GetLstidLinea = function () {
		return this.LstidLinea;
	}
	//Esta parte es para los bloques
	this.BloqueWire = 0;
	this.PositionBWire = 0;
	this.BloqueSolid = 0;
	this.PositionBSolid = 0;
	////////////////////////
	//para mantener o no un color diferente
	this.ColorDiferente = false;
	this.ColorDos = null;


	this.id = null; //es para poner el órden en el que aparecen

	this.idChain = null;
}

function createBonds(main) {
	//console.log ("HTMoL3: will try to create bonds");
	var bond = new Bond();
	for (var t in molecule.GetChain()) {
		var chn = molecule.GetChain()[t];
		//console.log ("for chain "+chn.Name);
		for (var r in chn.GetAminoacid()) {
			var amn = chn.GetAminoacid()[r];
			//if(amn.Name=="GLU") console.log ("for aminoacid "+amn.Name+" "+amn.Number);
			for (var s in amn.GetAtoms()) {
				var atom = amn.GetAtoms()[s];
				//if(amn.Name=="GLU") console.log ("for atom '"+atom.NameAtom+"' "+atom.Element);
				for (var b in AtomsBonds[atom.NameAtom]) {
					var val = AtomsBonds[atom.NameAtom][b];
					//if(amn.Name=="GLU") console.log ("for bond "+val);
					for (var i in amn.GetAtoms()) {
						var atomb = amn.GetAtoms()[i];
						if (val == atomb.NameAtom) {
							bond = main.ObjP.AddBond(bond, atom, atomb);
							//if(amn.Name=="GLU") console.log("HTMoL3: added bond between "+atom.NameAtom+" and "+atomb.NameAtom);
						}
					}
				}
			}
		}
	}
}

function Process() {
	this.Model = new Molecule();
	this.ReadFile = function (URL) {
		var text = $.ajax({
			url: URL,
			dataType: 'text',
			// "false" value gives browser warning "[Deprecation] Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience."
			// "true" value breaks the app, no time to debug			   
			async: false
		}).responseText;
		if (text != null && text.substr(0, 6) != "<html>") {
			return this.Parse(text);
		} else
			return null;
	}

	this.Parse = function (text) {
		var cont = 0;
		this.Model = new Molecule();
		var cmpAmino = '',
			cmpChain = '';
		var chain = new Chain();
		var aminoacid = new Aminoacid();
		var bond = new Bond();
		var bondS = new BondSkeleton();
		var lines = text.split("\n");
		var val, val2;
		var AtomCount = 0;
		var contSkele = 0;
		var id = 0;
		var ChainCont = 1;
		contBonds = 0;
		contBS = 0;
		CzPers = 10;

		var RGB_Diffuse = [, , ]; //para asignarle un único valor de color difuso a cada átomo para distinguirlo de los demás en la selección
		//la que no se toma sería [0][0][0]  entonces comenzaría con [1][0][0]  y terminaría en [255][255][254]
		var R = 0;
		var G = 0;
		var B = 0;

		var Scala = 0.003921568627451;

		for (var i = 0; i < lines.length; ++i) {
			if (lines[i].substr(0, 7) == "NFRAMES") {
				this.Model.Frames = lines[i].substr(10);
				console.log("HTMoL3: Expecting " + this.Model.Frames + " frames");
			}
			if (lines[i].substr(0, 7) == "TRJPATH") {
				this.Model.TrjPath = lines[i].substr(10);
				console.log("from trajectory file " + this.Model.TrjPath + "");
			}
			if (lines[i].substr(0, 6) == "HEADER") {
				this.Model.Name = lines[i].substr(62, 4);
			}
			if (lines[i].substr(0, 6) == "CRYST1") {
				this.Model.BoxX = parseFloat(lines[i].substr(7, 8));
				this.Model.BoxY = parseFloat(lines[i].substr(16, 8));
				this.Model.BoxZ = parseFloat(lines[i].substr(25, 8));
				//console.log("Box X: "+this.Model.BoxX+" Box Y: "+this.Model.BoxY+" Box Z: "+this.Model.BoxZ);
			}

			// According to http://www.wwpdb.org/documentation/file-format-content/format33/sect9.html#ATOM
			// COLUMNS        DATA  TYPE    FIELD        DEFINITION
			// -------------------------------------------------------------------------------------
			//  1 -  6        Record name   "ATOM  "
			//  7 - 11        Integer       serial       Atom  serial number.
			// 13 - 16        Atom          name         Atom name.
			// 17             Character     altLoc       Alternate location indicator.
			// 18 - 20        Residue name  resName      Residue name.
			// 22             Character     chainID      Chain identifier.
			// 23 - 26        Integer       resSeq       Residue sequence number.
			// 27             AChar         iCode        Code for insertion of residues.
			// 31 - 38        Real(8.3)     x            Orthogonal coordinates for X in Angstroms.
			// 39 - 46        Real(8.3)     y            Orthogonal coordinates for Y in Angstroms.
			// 47 - 54        Real(8.3)     z            Orthogonal coordinates for Z in Angstroms.
			// 55 - 60        Real(6.2)     occupancy    Occupancy.
			// 61 - 66        Real(6.2)     tempFactor   Temperature  factor.
			// 77 - 78        LString(2)    element      Element symbol, right-justified.
			// 79 - 80        LString(2)    charge       Charge  on the atom.

			// Alignment of one-letter atom name such as C starts at column 14, while two-letter atom name such as FE starts at column 13.
			// Atom nomenclature begins with atom type
			// Non-blank alphanumerical character is used for chain identifier

			// Beware lines[] index start at 0, not 1

			if (lines[i].substr(0, 4) == "ATOM") {
				var PDBRecordName = lines[i].substr(0, 6);
				var PDBserial = parseInt(lines[i].substr(6, 5), 10); // so you get a decimal number even with a leading 0 and an old browser ([IE8, Firefox 20, Chrome 22 and older][1])   
				var PDBname = lines[i].substr(12, 4);
				PDBname = PDBname.trim(); // removes whitespace from both sides
				if (/^\d/.test(PDBname)) // if found, removes a number found at the begining of atom name
				{
					//console.log("HTMoL: Parsing PDB file (Process). Found a number in atom name: "+PDBname);
					PDBname = PDBname.substring(1);
					//console.log("changed it to: "+PDBname);
				}
				var PDBaltLoc = lines[i].substr(16, 1);
				var PDBresName = lines[i].substr(17, 3);
				var PDBchainID = lines[i].substr(21, 1);
				var PDBresSeq = parseInt(lines[i].substr(22, 4), 10); // same as above
				var PDBiCode = lines[i].substr(26, 1);
				var PDBx = parseFloat(lines[i].substr(30, 8));
				var PDBy = parseFloat(lines[i].substr(38, 8));
				var PDBz = parseFloat(lines[i].substr(46, 8));
				var PDBoccupancy = lines[i].substr(54, 6);
				var PDBtempFactor = lines[i].substr(60, 6);
				// var PDBelement = lines[i].substr(76,2);
				var PDBelement = PDBname.trim().substr(0, 1); // removes whitespace from both sides of name and use first character
				var PDBcharge = lines[i].substr(78, 2);
				//console.log("serial:"+PDBserial+" name:"+PDBname+" resName:"+PDBresName+" chainID:"+PDBchainID+" resSeq:"+PDBresSeq+" element:"+PDBelement);

				var atom = new Atom(
					PDBserial,
					PDBx,
					PDBy,
					PDBz,
					'Active', //state
					PDBelement,
					PDBname
					//lines[i].substr(11,6).trim().replace(/\s/g,"&")	 	//nombre
				);

				if (cont == 0) {
					cmpAmino = PDBresSeq; //lines[i].substr(22,4); //Número del aminoácido en el que aparece
					cmpChain = PDBchainID; //lines[i].substr(20,2);
					aminoacid = new Aminoacid(cmpAmino, PDBresName, 'Active'); //alguno de los 20
					chain = new Chain(cmpChain, 'Active');
				}
				if (cmpAmino != PDBresSeq) // Cambio el residuo. Número del aminoácido en el que aparece
				{
					cmpAmino = PDBresSeq; //lines[i].substr(22,4);
					chain.LstAminoAcid.push(aminoacid);
					aminoacid = new Aminoacid(cmpAmino, PDBresName, 'Active');
				}
				if (cmpChain != PDBchainID) // Cambio la cadena
				{
					cmpChain = PDBchainID; //lines[i].substr(20,2);
					this.Model.LstChain.push(chain);
					chain = new Chain(cmpChain, 'Active');
					ChainCont = ChainCont + 1;
				}

				// Checking correct assignments			    
				// Atom(number,x,y,z,state,element,nameatom)
				//    this.X=x;
				//    this.Y=y;
				//    this.Z=z;
				//    this.State=state;
				//    this.NumberAtom=number;
				//    this.Element=element;
				//    this.NameAtom=nameatom;			    			
				// Aminoacid(number,name,state)
				//     this.Number=number;
				//     this.Name=name;
				//     this.State=state;
				// Chain(name,state)
				//     this.Name=name;

				//console.log("NumberAtom:"+atom.NumberAtom+" NameAtom:"+atom.NameAtom+" resName:"+aminoacid.Name+" chainID:"+chain.Name+" resSeq:"+aminoacid.Number+" element:"+atom.Element);			    

				aminoacid.LstAtoms.push(atom);
				this.Model.LstAtoms.push(atom);
				atom.Aminoacid = aminoacid.Name;
				atom.AminoNum = aminoacid.Number;

				if (atom.NameAtom == 'C' || atom.NameAtom == 'O3\'') {
					var atomtmp = atom;
				}

				if ((atom.NameAtom == 'N' || atom.NameAtom == 'P') && cont > 1) {
					bond = this.AddBond(bond, atomtmp, atom);
				}

				/////////////////////////// This part is for Skeletom´s Atoms ////////////////////////////////////////////
				if (atom.NameAtom == 'CA' || atom.NameAtom == 'P') {
					if (contSkele == 0) {
						var atomtmp2 = atom;
					}
					aminoacid.Type = 'T';
					//atom.Aminoacid=aminoacid;
					chain.LstSkeleton.push(atom);
					if (contSkele > 0) {
						bondS = this.AddBondSkeleton(bondS, atomtmp2, atom);
						atomtmp2.LstLineaSke.push(bondS);
						atom.LstLineaSke.push(bondS);
						atomtmp2 = atom;
					}
					contSkele++;
				}
				///////////////////////////////////////////////////////////////////////////////////////////////////////////

				this.Model.CenterX += atom.X;
				this.Model.CenterY += atom.Y;
				this.Model.CenterZ += atom.Z;
				cont++;
				/////////////////////////
				// código para centrar bien la cámara
				var atmX = Math.abs(atom.X);
				var atmY = Math.abs(atom.Y);

				if (atmX < atmY) {
					if (CzPers < atmY) {
						CzPers = atmY;
					}

				} else {
					if (CzPers < atmX) {
						CzPers = atmX;
					}
				}

				////////////////////////
				id++;
				atom.id = id;
				atom.idChain = ChainCont;

				//Asignación del color difuso a cáda átomo
				R = R + 1;
				if (R == 255) {
					R = 0;
					G = G + 1;
					if (G == 255) {
						G = 0;
						B = B + 1;
					}
				}
				atom.ColorRGBDiffuse = [R * Scala, G * Scala, B * Scala];

				//en esta parte se asigna el color al átom
				AsignaColor(atom);
			}

		}
		this.Model.CenterX = this.Model.CenterX / this.Model.LstAtoms.length;
		this.Model.CenterY = this.Model.CenterY / this.Model.LstAtoms.length;
		this.Model.CenterZ = this.Model.CenterZ / this.Model.LstAtoms.length
		chain.LstAminoAcid.push(aminoacid);
		this.Model.LstChain.push(chain);

		return this.Model;
	}

	this.AddBond = function (bond, atom, union) {
		try {
			var distancia = Math.sqrt(Math.pow(atom.X - union.X, 2) + Math.pow(atom.Y - union.Y, 2) + Math.pow(atom.Z - union.Z, 2));
			if (distancia < 3) //2
			{
				bond.LstAtoms.push(atom);
				bond.LstAtoms.push(union);
				bond.id = contBonds;
				bond.State = 'Active';
				atom.LstLinea.push(bond);
				union.LstLinea.push(bond);

				this.Model.LstBonds.push(bond);

				contBonds++;
			}
		} catch (e) {
			console.log("HTMoL3: Error adding bond (" + e + ") between atom " + atom.NameAtom + " and " + union.NameAtom);
		}
		return bond = new Bond();
	}

	this.AddBondSkeleton = function (bond, atom, union) {
		try {
			var distancia = Math.sqrt(Math.pow(atom.X - union.X, 2) + Math.pow(atom.Y - union.Y, 2) + Math.pow(atom.Z - union.Z, 2));
			if (distancia < 8) {
				bond.LstAtoms.push(atom);
				bond.LstAtoms.push(union);
				bond.id = contBS;
				this.Model.LstBondsSkeleton.push(bond);
				contBS++;
			}
		} catch (e) {}
		return bond = new BondSkeleton();
	}


}