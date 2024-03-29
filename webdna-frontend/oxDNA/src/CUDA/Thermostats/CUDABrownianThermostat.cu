/*
 * CUDABrownianThermostat.cpp
 *
 *  Created on: Feb 15, 2013
 *      Author: rovigatti
 */

#include <curand_kernel.h>

#include "CUDABrownianThermostat.h"

//#include <stdio.h> // TLF REMOVE

template<typename number, typename number4>
// TLF CHANGED brownian_thermostat function (several lines)
__global__ void brownian_thermostat(curandState *rand_state, number4 *vels, number4 *Ls, number rescale_factor, number* massinvs, number pt, number pr, int N) {
	if(IND < N) {
        //printf("inside of brown thermo \n");
		curandState state = rand_state[IND];
        number pim = massinvs[IND]; // particle inverse mass

		if(curand_uniform(&state) < pt) {
			number4 v;
			number trash;

			gaussian(state, v.x, v.y);
			gaussian(state, v.z, trash);
			v.x *= rescale_factor * pim;
			v.y *= rescale_factor * pim;
			v.z *= rescale_factor * pim;
			v.w = (v.x*v.x + v.y*v.y + v.z*v.z) * (number) 0.5f;

			vels[IND] = v;
		}

		if(curand_uniform(&state) < pr) {
			number4 L;
			number trash;

			gaussian(state, L.x, L.y);
			gaussian(state, L.z, trash);

			L.x *= rescale_factor * pim;
			L.y *= rescale_factor * pim;
			L.z *= rescale_factor * pim;
			L.w = (L.x*L.x + L.y*L.y + L.z*L.z) * (number) 0.5f;

			Ls[IND] = L;
		}

		rand_state[IND] = state;
	}
}

template<typename number, typename number4>
CUDABrownianThermostat<number, number4>::CUDABrownianThermostat() : CUDABaseThermostat<number, number4>(), BrownianThermostat<number>() {

}

template<typename number, typename number4>
CUDABrownianThermostat<number, number4>::~CUDABrownianThermostat() {

}

template<typename number, typename number4>
void CUDABrownianThermostat<number, number4>::get_settings(input_file &inp) {
	BrownianThermostat<number>::get_settings(inp);
	CUDABaseThermostat<number, number4>::get_cuda_settings(inp);
}

template<typename number, typename number4>
void CUDABrownianThermostat<number, number4>::init(int N) {
	BrownianThermostat<number>::init(N);

	this->_setup_rand(N);
}

template<typename number, typename number4>
bool CUDABrownianThermostat<number, number4>::would_activate(llint curr_step) {
	return (curr_step % this->_newtonian_steps == 0);
}

// TLF changed apply_cuda
template<typename number, typename number4>
void CUDABrownianThermostat<number, number4>::apply_cuda(number4 *d_poss, GPU_quat<number> *d_orientations, number4 *d_vels, number4 *d_Ls, number *d_massinvs, llint curr_step) {
	if(!would_activate(curr_step)) return;

	brownian_thermostat<number, number4>
				<<<this->_launch_cfg.blocks, this->_launch_cfg.threads_per_block>>>
				(this->_d_rand_state, d_vels, d_Ls, this->_rescale_factor, d_massinvs, this->_pt, this->_pr, this->_N_part);
}

template class CUDABrownianThermostat<float, float4>;
template class CUDABrownianThermostat<double, LR_double4>;
