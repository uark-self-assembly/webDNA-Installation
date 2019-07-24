#include <iostream>
#include <iomanip>
#include <fstream>
#include <cmath>
#include "NBLOCKInteraction.h"

template<typename number>
NBLOCKInteraction<number>::NBLOCKInteraction() : BaseInteraction<number, NBLOCKInteraction<number> >() {
    
    // JGH: For MD simulations only, this is not needed. We will need this when implementing VMMC etc.
    
    //this->_int_map[BACKBONE] = &DNAInteraction<number>::_backbone;
	//this->_int_map[BONDED_EXCLUDED_VOLUME] = &DNAInteraction<number>::_bonded_excluded_volume;
	//this->_int_map[STACKING] = &DNAInteraction<number>::_stacking;

	//this->_int_map[NONBONDED_EXCLUDED_VOLUME] = &NBLOCKInteraction<number>::_nonbonded_excluded_volume;
	//this->_int_map[HYDROGEN_BONDING] = &NBLOCKInteraction<number>::_hydrogen_bonding;
	//this->_int_map[CROSS_STACKING] = &NBLOCKInteraction<number>::_cross_stacking;
	//this->_int_map[COAXIAL_STACKING] = &NBLOCKInteraction<number>::_coaxial_stacking;

    _grooving = false;
	_allow_broken_fene = false;
    _allow_pivot = false;
    
}

template<typename number>
NBLOCKInteraction<number>::~NBLOCKInteraction() {

}

template<typename number>
void NBLOCKInteraction<number>::get_settings(input_file &inp) {
	IBaseInteraction<number>::get_settings(inp);
    DNA.get_settings(inp);
	
	char T[256];
	getInputString(&inp, "T", T, 1);
	_T = Utils::get_temperature<number>(T);

	int tmp;
	if(getInputBoolAsInt(&inp, "allow_broken_fene", &tmp, 0) == KEY_FOUND){
		_allow_broken_fene = (tmp != 0);
	}
    if(getInputBoolAsInt(&inp, "allow_pivot", &tmp, 0) == KEY_FOUND){
		_allow_pivot = (tmp != 0);
	}
}

template<typename number>
void NBLOCKInteraction<number>::init() {
    
    DNA.init();
    
	// we choose rcut as the max of the range interaction of excluded
	// volume between backbones and hydrogen bonding
	number rcutback;
	if (_grooving){
		rcutback = 2 * sqrt((POS_MM_BACK1)*(POS_MM_BACK1) + (POS_MM_BACK2)*(POS_MM_BACK2)) + EXCL_RC1;
	}
	else
		rcutback = 2 * fabs(POS_BACK) + EXCL_RC1;
	number rcutbase = 2 * fabs(POS_BASE) + HYDR_RCHIGH;
	this->_rcut = fmax(rcutback, rcutbase);
	this->_sqr_rcut = SQR(this->_rcut);
    
    // JGH: change the cut of radius so that the np is included
	//this->_rcut = 3; //fmax(rcutback, rcutbase);
	//this->_sqr_rcut = SQR(this->_rcut);
}

template<typename number>
bool NBLOCKInteraction<number>::_check_bonded_neighbour(BaseParticle<number> **p, BaseParticle<number> **q, LR_vector<number> *r) {
    if(*q == P_VIRTUAL) *q = (*p)->n3;
	else {
		if(*q != (*p)->n3) {
			if(*p == (*q)->n3) {
				BaseParticle<number> *tmp = *q;
				*q = *p;
				*p = tmp;
				if (r != NULL) *r = ((*r) * (-1.0f));
			}
			else return false;
		}
	}
	if((*p)->n3 == P_VIRTUAL) return false;

	return true;
}

template<typename number>
number NBLOCKInteraction<number>::_particle_nucleotide_bond(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces) {

    const number nb_radius = q->diameter/2 + 0.779526;
    const number _stiffness = 8; 
    
    LR_vector<number> &v1 = q->orientationT.v1;
    LR_vector<number> &v2 = q->orientationT.v2;
    LR_vector<number> &v3 = q->orientationT.v3;
  
    LR_vector<number> u = p->pos + p->int_centers[NBLOCKParticle<number>::BACK];
    LR_vector<number> v,w;
    
    NBLOCKParticle<number>* n_p = static_cast<NBLOCKParticle<number>*>(p);
    if (n_p == NULL) return (number) 0;

    // get binding location of strand to np
    switch (n_p->nblock_strand_id) {
        case 0:
            w = nb_radius*v1;
            break;
        case 1:
            w = -nb_radius*v1;
            break;
        case 2:
            w = nb_radius*v2;
            break;
        case 3:
            w = -nb_radius*v2;
            break;
        case 4:
            w = nb_radius*v3;
            break;
        case 5:
            w = -nb_radius*v3;
            break;
    }
        
    v = q->pos + w;
    
    // get distance
    LR_vector<number> dr;
    dr = u - v;

    // compute forces and energy
    number module = dr.module();
	number energy = SQR(module) * ((number) 0.5) * _stiffness;
    
    // update forces
	if(update_forces && energy != 0) {
        
        LR_vector<number> force = dr * _stiffness;
		p->force -= force;
		q->force += force * q->massinv;
        
		// we need torques in the reference system of the particle
		p->torque -= p->orientationT * p->int_centers[NBLOCKParticle<number>::BACK].cross(force);    
	    q->torque += q->orientationT * ((w).cross(force * q->massinv)); // adjust for the differences in mass of nanoparticle and nucleotide where nucleotide has mass of 1
	}
  
    // ********************************************
    // Apply force to keep nucleotide from pivoting
    // TODO: generalize this and validate
    if (!_allow_pivot) {
        LR_vector<number> origt1 = q->orientation*n_p->initial_orientation*n_p->_principal_axis;
        LR_vector<number> theta1 = p->orientation*n_p->_principal_axis;
        
        number angleStiffness = 1;
        
        number dot = origt1*theta1;
        if (dot < -1.0) dot = -1.0 ;
        else if (dot > 1.0) dot = 1.0 ;
        
        v = theta1 - origt1;
        number vmod = v.module();
                
        number angle = acos(dot);
        number angleEnergy = number(0.5)*angleStiffness*SQR(angle);
        
        if (vmod <= 0) return energy;
        LR_vector<number> angleForce = v * ((angleStiffness / vmod)* angle );
        
        energy += angleEnergy;
        p->torque -= p->orientationT * p->int_centers[NBLOCKParticle<number>::BASE].cross(angleForce);
        p->torque += p->orientationT * p->int_centers[NBLOCKParticle<number>::BACK].cross(angleForce);    

    }
	
    
    return energy;
}

template<typename number>
number NBLOCKInteraction<number>::_particle_bonded_excluded_volume(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces){
    return (number) 0; 
}

template<typename number>
number NBLOCKInteraction<number>::_particle_nonbonded_excluded_volume(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces){

    // check of particle and nucleotide are bound
    if (p->type != P_NP)
        return (number) 0.f;
    else if ((q->n3 != NULL) && (q->n3->type == P_NP))
    {
        return (number) 0.f;
    }

    number np_radius = p->diameter / 2;

    // EXCL_S2, EXCL_R2, EXCL_B2, EXCL_RC2,
    // JGH: given an NP diameter, what should these values be?
    //      current values are estimated based on oxDNA's constants for nucleotides
    number sigma = np_radius;
    number rstar = np_radius - 0.02;
    number b = EXCL_B1; //~892 JGH: I'm not sure where this constant comes from / should be
    number rc = np_radius + 0.02;
    
    LR_vector<number> force(0, 0, 0);
	LR_vector<number> torquep(0, 0, 0);
	LR_vector<number> torqueq(0, 0, 0);

	// BASE vs. NP
	LR_vector<number> rcenter(0,0,0);
    rcenter = *r + q->int_centers[NBLOCKParticle<number>::BASE];    
    number energy = _repulsive_lj(rcenter, force, sigma, rstar, b, rc, update_forces);
    
	if(update_forces) {
		torquep = ((p->diameter/2) * p->orientationT.v1).cross(force*p->massinv);
		torqueq = q->int_centers[NBLOCKParticle<number>::BASE].cross(force);

		p->force -= force*p->massinv;
		q->force += force;
	}

	// BACK vs. NP
	rcenter = *r + q->int_centers[NBLOCKParticle<number>::BACK];
	energy += _repulsive_lj(rcenter, force, sigma, rstar, b, rc, update_forces);
     
    
    if(update_forces) {
		torquep = ((p->diameter/2) * p->orientationT.v1).cross(force*p->massinv);
		torqueq = q->int_centers[NBLOCKParticle<number>::BACK].cross(force);

		p->force -= force*p->massinv;
		q->force += force;

		// we need torques in the reference system of the particle
		p->torque -= p->orientationT * torquep;
		q->torque += q->orientationT * torqueq;
	}
    
    
    
    return energy;
}

template<typename number>
number NBLOCKInteraction<number>::pair_interaction(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces) {
    if(p->n3 == q || p->n5 == q) return pair_interaction_bonded(p, q, r, update_forces);
	else return pair_interaction_nonbonded(p, q, r, update_forces);
}

template<typename number>
number NBLOCKInteraction<number>::pair_interaction_bonded(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces) {
    
    LR_vector<number> computed_r(0, 0, 0);
	if(r == NULL) {
		if (q != P_VIRTUAL && p != P_VIRTUAL) {
			computed_r = q->pos - p->pos;
			r = &computed_r;
		}

		if(!_check_bonded_neighbour(&p, &q, r)) return (number) 0;
	}
 
    number energy = (number)0;
    
    if (p->type != P_NP && q->type != P_NP){
        energy += DNA.pair_interaction_bonded(p, q, r, update_forces);        
    }
    else if (q->type == P_NP){  
        energy += _particle_nucleotide_bond(p, q, r, update_forces);
    }

    return energy;
}

template<typename number>
number NBLOCKInteraction<number>::pair_interaction_nonbonded(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces) {

    LR_vector<number> computed_r(0, 0, 0);
	if(r == NULL) {
		computed_r = q->pos.minimum_image(p->pos, this->_box_side);
		r = &computed_r;
	}

	if(r->norm() >= this->_sqr_rcut) return (number) 0;

    number energy = (number)0;

    if (p->type != P_NP && q->type != P_NP){
        energy += DNA.pair_interaction_nonbonded(p, q, r, update_forces);
    }
    else {
        energy += _particle_nonbonded_excluded_volume(p, q, r, update_forces);
    }
   
	return energy;
}

template<typename number>
void NBLOCKInteraction<number>::check_input_sanity(BaseParticle<number> **particles, int N) {
	for(int i = 0; i < N; i++) {
		BaseParticle<number> *p = particles[i];
        
		if(p->n3 != P_VIRTUAL && p->n3->index >= N) throw oxDNAException("Wrong topology for particle %d (n3 neighbor is %d, should be < N = %d)", i, p->n3->index, N);
		if(p->n5 != P_VIRTUAL && p->n5->index >= N) throw oxDNAException("Wrong topology for particle %d (n5 neighbor is %d, should be < N = %d)", i, p->n5->index, N);

		// check that the distance between bonded neighbor doesn't exceed a reasonable threshold
        // JGH TODO handle oxdna2
		number mind = FENE_R0_OXDNA2 - FENE_DELTA;
		number maxd = FENE_R0_OXDNA2 + FENE_DELTA;
		if(p->n3 != P_VIRTUAL) {
			BaseParticle<number> *q = p->n3;
			q->set_positions();
			LR_vector<number> rv = p->pos + p->int_centers[NBLOCKParticle<number>::BACK] - (q->pos + q->int_centers[NBLOCKParticle<number>::BACK]);
			number r = sqrt(rv*rv);
                        
			if(r > maxd || r < mind){
                if ((p->type != 9)&&(q->type!=9))
                    throw oxDNAException("Distance between bonded neighbors %d and %d exceeds acceptable values (d = %lf)", i, p->n3->index, r);
            }
		}

		if(p->n5 != P_VIRTUAL) {
			BaseParticle<number> *q = p->n5;
			q->set_positions();
			LR_vector<number> rv = p->pos + p->int_centers[NBLOCKParticle<number>::BACK] - (q->pos + q->int_centers[NBLOCKParticle<number>::BACK]);
			number r = sqrt(rv*rv);
			if(r > maxd || r < mind){
                if ((p->type != 9)&&(q->type!=9))
                    throw oxDNAException("Distance between bonded neighbors %d and %d exceeds acceptable values (d = %lf)", i, p->n5->index, r);
            }
		}
	}
}

template<typename number>
void NBLOCKInteraction<number>::allocate_particles(BaseParticle<number> **particles, int N) {
	for(int i = 0; i < N; i++) particles[i] = new NBLOCKParticle<number>(_grooving);
}

template<typename number>
void NBLOCKInteraction<number>::read_topology(int N_from_conf, int *N_strands, BaseParticle<number> **particles) {
    
    // JGH TODO use xml input file instead of this method
    
	IBaseInteraction<number>::read_topology(N_from_conf, N_strands, particles);
	int my_N, my_N_strands;

	char line[512];
	std::ifstream topology;
	topology.open(this->_topology_filename, ios::in);

	if(!topology.good()) throw oxDNAException("Can't read topology file '%s'. Aborting", this->_topology_filename);

	topology.getline(line, 512);

	sscanf(line, "%d %d\n", &my_N, &my_N_strands);

	char base[256];
	int nblock, prev_nblock = 0, nblock_i=0, strand, i = 0;
    short nblock_strand_id = 0;
    
	while(topology.good()) {
		topology.getline(line, 512);
		if(strlen(line) == 0 || line[0] == '#') continue;
		if(i == N_from_conf) throw oxDNAException("Too many particles found in the topology file (should be %d), aborting", N_from_conf);

		int tmpn3, tmpn5;
		int res = sscanf(line, "%d %d %s %d %d", &nblock, &strand, base, &tmpn3, &tmpn5);
        
		if(res < 5) throw oxDNAException("Line %d of the topology file has an invalid syntax", i+2);
      
        BaseParticle<number> *p;
        
        // A new NBLOCK has arrived in the topology file
        if (nblock > prev_nblock) {
            p = particles[i];
            prev_nblock = nblock;
            p->n3 = P_VIRTUAL;
            p->n5 = P_VIRTUAL;
            p->type = P_NP;
            p->strand_id = nblock - 1; 
            // JGH TODO don't hardcode these
            p->diameter = 3.32238 ;
            p->mass = 421.925;
            p->massinv = 1/p->mass;
            nblock_i = i; 
            nblock_strand_id = 0;
            i++;
        }
   
   		p = particles[i];

		if(tmpn3 < 0) {
            p->n3 = particles[nblock_i]; 
            
            // set the child class member nblock_strand_id to an appropriate id.
            NBLOCKParticle<number>* n_p = static_cast<NBLOCKParticle<number>*>(p);
            n_p->nblock_strand_id = nblock_strand_id++; 
            p->rigid_body_id = nblock -1;
            nblock_strand_id = nblock_strand_id % 6;
        }
		else { p->n3 = particles[i-1]; }
		if(tmpn5 < 0) {p->n5 = P_VIRTUAL; }
		else p->n5 = particles[i+1];

		// store the strand id
		// for a design inconsistency, in the topology file
		// strand ids start from 1, not from 0
        // JGH: The following is a hack to fix the periodic boundary problem that occurs when bound to NP.
        //      A single nblock is consider a strand in MD backend, thereby preventing a strand from being on one side the box and the np on another.
		p->strand_id = nblock - 1; //strand - 1; 
        
		// the base can be either a char or an integer
		if(strlen(base) == 1) {
		    p->type = Utils::decode_base(base[0]);
		    p->btype = Utils::decode_base(base[0]);
		}
		else {
			if(atoi (base) > 0) p->type = atoi (base) % 4;
			else p->type = 3 - ((3 - atoi(base)) % 4);
			p->btype = atoi(base);
		}

		if(p->type == P_INVALID) throw oxDNAException ("Particle #%d in strand #%d contains a non valid base '%c'. Aborting", i, strand, base);
		p->index = i;
		i++;
	}

	if(i < N_from_conf) throw oxDNAException ("Not enough particles found in the topology file (should be %d). Aborting", N_from_conf);

	topology.close();

	if(my_N != N_from_conf) throw oxDNAException ("Number of lines in the configuration file and\nnumber of particles in the topology files don't match. Aborting");

	*N_strands = my_N_strands;
}

template<typename number>
int NBLOCKInteraction<number>::get_N_from_topology() {
    
	char line[512];
	std::ifstream topology;
	topology.open(this->_topology_filename, ios::in);
	if(!topology.good()) throw oxDNAException("Can't read topology file '%s'. Aborting", this->_topology_filename);
	topology.getline(line, 512);
	topology.close();
	int caca, ret;
	sscanf(line, "%d %d\n", &ret, &caca);
	return ret;
}

template class NBLOCKInteraction<float>;
template class NBLOCKInteraction<double>;

