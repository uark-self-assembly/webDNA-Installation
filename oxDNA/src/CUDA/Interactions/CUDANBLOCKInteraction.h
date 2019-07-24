/*
 * CUDANBLOCKInteraction.h
 *
 *  Created on: 26/may/2015
 *      Author: tyler
 */

#ifndef CUDANBLOCKINTERACTION_H_
#define CUDANBLOCKINTERACTION_H_

#include "CUDABaseInteraction.h"
#include "../../Interactions/NBLOCKInteraction.h"

/**
 * @brief CUDA implementation of the oxDNA model, as provided by NBLOCKInteraction.
 */
template<typename number, typename number4>
// TLF TODO Inherit from NBLOCKInteraction not DNAInter.
class CUDANBLOCKInteraction: public CUDABaseInteraction<number, number4>, public DNAInteraction<number> {
public:
    enum {
		DEBYE_HUCKEL = 7
	};
	CUDANBLOCKInteraction();
	virtual ~CUDANBLOCKInteraction();

	bool _use_debye_huckel;
	bool _use_oxDNA2_coaxial_stacking;
	bool _use_oxDNA2_FENE;
	// copied from DNA2Interaction.h (CPU) (and change number -> float), the least bad way of doing things
	float _salt_concentration;
	bool _debye_huckel_half_charged_ends;
	float _debye_huckel_prefactor;
	float _debye_huckel_lambdafactor;

	//the following values are calculated
	float _debye_huckel_RC; // this is the maximum interaction distance between backbones to interact with DH
	float _debye_huckel_RHIGH; // distance after which the potential is replaced by a quadratic cut-off
	float _debye_huckel_B; // prefactor of the quadratic cut-off
	float _minus_kappa;
	// End copy from DNA2Interaction.h

	void get_settings(input_file &inp);
	void cuda_init(number box_side, int N);
	number get_cuda_rcut() { return this->get_rcut(); }

	void compute_forces(CUDABaseList<number, number4> *lists, number4 *d_poss, GPU_quat<number> *d_qorientations, number4 *d_forces, number4 *d_torques, LR_bonds *d_bonds);
};

#endif /* CUDANBLOCKINTERACTION_H_ */
