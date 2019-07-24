
#ifndef NBLOCK_INTERACTION_H
#define NBLOCK_INTERACTION_H

#include "BaseInteraction.h"
#include "DNAInteraction.h"
#include "DNA2Interaction.h"
#include "../Particles/NBLOCKParticle.h"

/**
 * @brief Handles interactions between nanoparticle and nucleotides, as well as between DNA nucleotides.
 *
 * It uses the oxDNA2 model for nucleotide interaction
 *
 * Input options:
 *
 * @verbatim
[use_average_seq = <boolean> (defaults to yes)]
[hb_multiplier = <float> (HB interaction multiplier applied to all the nucleotides having a custom numbered base whose magnitude is > 300, defaults to 1.0)]
@endverbatim
 */
template <typename number>
class NBLOCKInteraction : public BaseInteraction<number, NBLOCKInteraction<number> > {
protected:
	
    // JGH TODO allow for the use of any oxDNA model
    DNA2Interaction<number> DNA;
    number _T;
    
	/// true by default; set this to false if you want the code to not die when bonded backbones are found to be outside the acceptable FENE range
	bool _allow_broken_fene;
    bool _grooving;
    bool _allow_pivot;
    
    // JGH TODO do not copy this method unless changes are required (there is currently a slight difference)
	inline number _repulsive_lj(const LR_vector<number> &r, LR_vector<number> &force, number sigma, number rstar, number b, number rc, bool update_forces);

    // NP interations
    number _particle_nucleotide_bond(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces);
    number _particle_bonded_excluded_volume(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces);
    number _particle_nonbonded_excluded_volume(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces);
    
	/**
	 * @brief Check the relation between p and q. Used by the bonded interaction terms.
	 *
	 * Check whether q is the 3' neighbour of p. If this is not the case, it changes identities
	 * between q and p if p is the 3' neighbour of q and updates r accordingly. It return false
	 * if the two particles are not bonded neighbours, true otherwise.
	 * @param p
	 * @param q
	 * @param r
	 * @return false if the two particles are not bonded neighbours, true otherwise
	 */
	bool _check_bonded_neighbour(BaseParticle<number> **p, BaseParticle<number> **q, LR_vector<number> *r);

	/**
	 * @brief Checks whether the two particles share a backbone link.
	 *
	 * @param p
	 * @param q
	 * @return true if they are bonded, false otherwise
	 */
	bool _are_bonded(BaseParticle<number> *p, BaseParticle<number> *q) { return (p->n3 == q || p->n5 == q); }

public:
	
	NBLOCKInteraction();
	virtual ~NBLOCKInteraction();

	virtual void get_settings(input_file &inp);
	virtual void init();

	virtual void allocate_particles(BaseParticle<number> **particles, int N);

	virtual number pair_interaction(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r=NULL, bool update_forces=false);
	virtual number pair_interaction_bonded(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r=NULL, bool update_forces=false);
	virtual number pair_interaction_nonbonded(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r=NULL, bool update_forces=false);
	virtual number pair_interaction_term(int name, BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r=NULL, bool update_forces=false) {
		return this->_pair_interaction_term_wrapper(this, name, p, q, r, update_forces);
	}

	virtual void check_input_sanity(BaseParticle<number> **particles, int N);

	virtual void read_topology(int N_from_conf, int *N_strands, BaseParticle<number> **particles);
    virtual int get_N_from_topology();
    
};

// JGH TODO do not copy this method unless changes are required (there is currently a slight difference)
template<typename number>
number NBLOCKInteraction<number>::_repulsive_lj(const LR_vector<number> &r, LR_vector<number> &force, number sigma, number rstar, number b, number rc, bool update_forces) {
	// this is a bit faster than calling r.norm()
	number rnorm = SQR(r.x) + SQR(r.y) + SQR(r.z);
	number energy = (number) 0;

	if(rnorm < SQR(rc)) {
		if(rnorm > SQR(rstar)) {
			number rmod = sqrt(rnorm);
			number rrc = rmod - rc;
			energy = EXCL_EPS * b * SQR(rrc);
			if(update_forces) force = -r * (2 * EXCL_EPS * b * rrc / rmod);
		}
		else {
            number tmp = SQR(sigma) / rnorm;
            if (tmp < 1){
                number lj_part = tmp * tmp * tmp;
                number sqrlj = SQR(lj_part) - lj_part;
                if (sqrlj < 0){
                    energy = -4 * EXCL_EPS * (SQR(lj_part) - lj_part);
                    if(update_forces) force = r * (24 * EXCL_EPS * (lj_part - 2*SQR(lj_part)) / rnorm);
                }
                else{
                    energy = 4 * EXCL_EPS * (SQR(lj_part) - lj_part);
                    if(update_forces) force = -r * (24 * EXCL_EPS * (lj_part - 2*SQR(lj_part)) / rnorm);
                }
            }
			
		}
	}

	if(update_forces && energy == (number) 0) {force.x = force.y = force.z = (number) 0;}


	return energy;
}


#endif /* NBLOCK_INTERACTION_H */
