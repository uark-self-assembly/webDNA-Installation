#include "NBLOCKParticle.h"
#include <iostream>
using namespace std;

template<typename number>
NBLOCKParticle<number>::NBLOCKParticle(bool grooving) : BaseParticle<number>(), _principal_axis(1,0,0), _stack_axis(0,0,1), _third_axis(0,1,0), initial_orientation(0,0,0,0,0,0,0,0,0) {
	// _stack_axis definition has been changed for the major-minor grooving addition to the code and third_axis definition added;
	// _stack_axis is not used anywhere in the code apart from for major-minor grooving so the change should not affect anything
	// unfortunately the third axis does not in fact point along the z-axis which might be more intuitive.
	// -- Ben 1/8/13
	this->int_centers = new LR_vector<number>[3];
	this->N_int_centers = 3;
    nblock_strand_id = -1;
	_grooving = grooving;
}

template<typename number>
NBLOCKParticle<number>::~NBLOCKParticle() {
    
}

template<typename number>
bool NBLOCKParticle<number>::is_bonded(BaseParticle<number> *q) {
	return (this->n3 == q || this->n5 == q);
}

template<typename number>
void NBLOCKParticle<number>::init() {
	BaseParticle<number>::init();
    initial_orientation = BaseParticle<number>::orientation;
    initial_orientationT = BaseParticle<number>::orientation.get_transpose();
    set_positions();
    orig_back = this->int_centers[BACK];
	orig_base = this->int_centers[BASE];
	orig_stack = this->int_centers[STACK];
}



template<typename number>
void NBLOCKParticle<number>::set_positions() {
    if (BaseParticle<number>::type != P_NP){
        if (_grooving) {
            this->int_centers[BACK] = this->orientation*_principal_axis*POS_MM_BACK1 + this->orientation*_third_axis*POS_MM_BACK2;
            this->int_centers[STACK] = this->orientation*_principal_axis*POS_STACK;
        }
        else{
            this->int_centers[BACK] = this->orientation*_principal_axis*POS_BACK;
            this->int_centers[STACK] = this->int_centers[BACK]*(POS_STACK/POS_BACK);
        }
        this->int_centers[BASE] = this->int_centers[STACK]*(POS_BASE/POS_STACK);
    }
}

template<typename number>
number NBLOCKParticle<number>::get_scale_factor(){ 
        
    // JGH: assume that non np particles have the same scale factor
    if (BaseParticle<number>::type != P_NP){
        return 1;
    }
    else {
        // JGH: return a scale factor relative to the non np factor of 1
        return this->massinv;
    }
}


template class NBLOCKParticle<double>;
template class NBLOCKParticle<float>;
