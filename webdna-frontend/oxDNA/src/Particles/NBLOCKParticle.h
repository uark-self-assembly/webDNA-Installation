#ifndef NBLOCKPARTICLE_H_
#define NBLOCKPARTICLE_H_

#include "BaseParticle.h"

/**
 * @brief Represents a DNA nucleotide. Used by DNAInteraction.
 */
 
 const int MAX_NUCLEOTIDES_PER_PARTICLE = 6;
 
template<typename number>
class NBLOCKParticle: public BaseParticle<number> {
protected:
	bool _grooving;

public:
	LR_vector<number> _principal_axis;
	LR_vector<number> _stack_axis;
	LR_vector<number> _third_axis;

	enum {
		BACK = 0,
		STACK = 1,
		BASE = 2
	};

    int nblock_strand_id;

    void init();
    
    LR_matrix<number> initial_orientation;
    LR_matrix<number> initial_orientationT;
    LR_vector<number> orig_back;
	LR_vector<number> orig_base;
	LR_vector<number> orig_stack;
    
	NBLOCKParticle(bool grooving);
	virtual ~NBLOCKParticle();

	virtual bool is_bonded(BaseParticle<number> *q);
    virtual number get_scale_factor();
	virtual void set_positions();

	virtual bool is_rigid_body() {
		return true;
	}
};

#endif /* NBLOCKPARTICLE_H_ */
