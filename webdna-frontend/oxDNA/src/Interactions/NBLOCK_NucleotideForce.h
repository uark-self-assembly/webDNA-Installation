#include <string>
#include "../defs.h"

#ifndef NBLOCK_NUCLEOTIDEFORCE_H
#define NBLOCK_NUCLEOTIDEFORCE_H

template <typename number>
class GoldToNucleotideForce {
public:
	static const BaseParticle<number> * _p_ptr = NULL;
	static const number _r0 = 3;
	static const bool PBC = true;
	static const number * box_side_ptr = NULL;
    static const number _stiff = 10;
    
	static LR_vector<number> value(llint step, LR_vector<number> &pos);
	static number potential(llint step, LR_vector<number> &pos);
protected:
	static LR_vector<number> _distance(LR_vector<number> u, LR_vector<number> v);
};


template <typename number>
LR_vector<number> GoldToNucleotideForce<number>::_distance(LR_vector<number> u, LR_vector<number> v) {
	if (PBC) return v.minimum_image(u, *(box_side_ptr));
	else return v - u;
}

template <typename number>
LR_vector<number> GoldToNucleotideForce<number>::value (llint step, LR_vector<number> &pos) {
	LR_vector<number> dr = _distance(pos, _p_ptr->get_abs_pos(*(box_side_ptr)));
	return (dr / dr.module()) * (dr.module() - _r0) * _stiff;
}

template <typename number>
number GoldToNucleotideForce<number>::potential (llint step, LR_vector<number> &pos) {
	LR_vector<number> dr = _distance(pos, _p_ptr->get_abs_pos(*(box_side_ptr)));
	return pow (dr.module() - _r0, 2) * ((number) 0.5) * _stiff;
}

#endif /* NBLOCK_NUCLEOTIDEFORCE_H */

