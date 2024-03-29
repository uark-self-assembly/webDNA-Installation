/*
 * NathanStarInteraction.cpp
 *
 *  Created on: 21 Aug 2014
 *      Author: lorenzo
 */

#include "NathanStarInteraction.h"

template<typename number>
NathanStarInteraction<number>::NathanStarInteraction() : _sqrt_pi(sqrt(M_PI)), _patch_r(0.5), _sqr_patch_r(SQR(_patch_r)), _star_f(-1), _interp_size(500) {
	this->_int_map[PATCHY_PATCHY] = &NathanStarInteraction<number>::_patchy_interaction;

	_rep_E_cut = 0.;
	_rep_power = 200;

	_patch_alpha = 0.12;
	_patch_power = 30;

	_N_stars = _N_patchy = 0;

	_spl_patchy = NULL;
	_acc_patchy = NULL;
	_spl_patchy_star = NULL;
	_acc_patchy_star = NULL;
}

template<typename number>
NathanStarInteraction<number>::~NathanStarInteraction() {
	if(_spl_patchy_star != NULL) {
		gsl_spline_free(_spl_patchy);
		gsl_interp_accel_free(_acc_patchy);

		gsl_spline_free(_spl_patchy_star);
		gsl_interp_accel_free(_acc_patchy_star);
	}
}

template<typename number>
int NathanStarInteraction<number>::get_N_from_topology() {
	char line[512];
	std::ifstream topology;
	topology.open(this->_topology_filename, ios::in);
	if(!topology.good()) throw oxDNAException("Can't read topology file '%s'. Aborting", this->_topology_filename);
	topology.getline(line, 512);
	topology.close();
	sscanf(line, "%d %d\n", &_N_patchy, &_N_stars);
	return _N_patchy + _N_stars;
}

template<typename number>
void NathanStarInteraction<number>::read_topology(int N, int *N_strands, BaseParticle<number> **particles) {
	// the number of "strands" is given by the number of chains + the number of patchy particles
	// since those are not linked to anything else
	*N_strands = _N_stars + _N_patchy;
	allocate_particles(particles, N);
}

template<typename number>
void NathanStarInteraction<number>::allocate_particles(BaseParticle<number> **particles, int N) {
	for(int i = 0; i < _N_patchy; i++) {
		NathanPatchyParticle<number> *new_p = new NathanPatchyParticle<number>();
		new_p->index = i;
		new_p->type = PATCHY_PARTICLE;
		new_p->strand_id = i;

		particles[i] = new_p;
	}

	for(int i = _N_patchy; i < N; i++) {
		NathanPolymerParticle<number> *new_p = new NathanPolymerParticle<number>();
		new_p->index = i;
		new_p->type = POLYMER;
		new_p->strand_id = i;
		particles[i] = new_p;
	}
}

template<typename number>
void NathanStarInteraction<number>::get_settings(input_file &inp) {
	IBaseInteraction<number>::get_settings(inp);

	getInputNumber(&inp, "T", &_T, 1);

	getInputNumber(&inp, "NATHAN_alpha", &_patch_alpha, 0);
	getInputNumber(&inp, "NATHAN_cosmax", &_patch_cosmax, 1);

	getInputInt(&inp, "NATHAN_interp_size", &_interp_size, 0);

	number size_ratio;
	getInputNumber(&inp, "NATHAN_size_ratio", &size_ratio, 1);
	_star_sigma_g = 1. / size_ratio;

	getInputInt(&inp, "NATHAN_f", &_star_f, 1);
}

template<typename number>
void NathanStarInteraction<number>::_setup_lambda_kappa() {
	if(_star_f < 2 || _star_f > 1e5) throw oxDNAException("NATHAN_f (%d) should be > 1 and < 10e5", _star_f);

	int fs[12] = {2, 5, 10, 15, 18, 30, 40, 50, 65, 80, 100, 100000};
	number lambdas[12] = {0.46, 0.35, 0.30, 0.28, 0.27, 0.24, 0.24, 0.23, 0.23, 0.22, 0.22, 0.139};
	number kappas[12] = {0.58, 0.68, 0.74, 0.76, 0.77, 0.83, 0.85, 0.86, 0.87, 0.88, 0.89, 1.};

	int idx = 0;
	while(fs[idx] < _star_f) idx++;

	if(fs[idx] == _star_f) {
		_pi_lambda = lambdas[idx];
		_kappa_rs = kappas[idx];
	}
	else {
		number delta_x = (fs[idx] - fs[idx - 1]);
		number delta_f = (_star_f - fs[idx - 1]);
		number delta_l = lambdas[idx] - lambdas[idx - 1];
		number delta_k = kappas[idx] - kappas[idx - 1];

		_pi_lambda = lambdas[idx-1] + delta_l/delta_x*delta_f;
		_kappa_rs = kappas[idx-1] + delta_k/delta_x*delta_f;
	}
}

template<typename number>
number NathanStarInteraction<number>::_psi_1(number x, number smax) {
	return _xi * _exp_sqr_kappa_rs * (exp(-SQR(_kappa*x))/x - exp(-SQR(_kappa*smax))/smax) / _star_rs;
}

template<typename number>
number NathanStarInteraction<number>::_psi_2(number x, number smax) {
	return _xi * _exp_sqr_kappa_rs * (_sqrt_pi*(erf(_kappa*smax) - erf(_kappa*x))/_kappa + x*exp(-SQR(_kappa*x)) - smax*exp(-SQR(_kappa*smax))) / _star_rs;
}

template<typename number>
number NathanStarInteraction<number>::_patchy_star_derivative(number r) {
	number sqr_r = r*r;
	number z = r - _patch_r;
	number smax = sqrt(z*(z + 1.));
	number derivative = -_T * _pi_lambda * _star_f3_2 * _patch_r / sqr_r;

	if(z < _star_rs) derivative *= (sqr_r - _sqr_patch_r)*(0.5/SQR(z) - 0.5/_sqr_star_rs + _psi_1(_star_rs, smax)) - log(z/_star_rs) + _psi_2(_star_rs, smax);
	else derivative *= (sqr_r - _sqr_patch_r)*_psi_1(z, smax) + _psi_2(z, smax);

	return derivative;
}

template<typename number>
void NathanStarInteraction<number>::_setup_interp() {
	_spl_patchy = gsl_spline_alloc(gsl_interp_cspline, _interp_size);
	_acc_patchy = gsl_interp_accel_alloc();

	_spl_patchy_star = gsl_spline_alloc(gsl_interp_cspline, _interp_size);
	_acc_patchy_star = gsl_interp_accel_alloc();

	// patchy-star
	number bin = (_patchy_star_rcut - _patch_r) / _interp_size;
	number r = _patch_r + bin;
	double *rs = new double[_interp_size]();
	double *f_ys = new double[_interp_size]();
	for(int i = 0; i < _interp_size; i++, r += bin) {
		rs[i] = r;
		f_ys[i] = _patchy_star_derivative(r);
	}
	gsl_spline_init(_spl_patchy_star, rs, f_ys, _interp_size);

	// print out the "real" derivative, its interpolation and their relative difference
	ofstream out_der("tabulated_patchy_star.dat");
	for(int i = 0; i < _interp_size-1; i++) {
		r = rs[0] + 0.001 + bin*i;
		number real_der = _patchy_star_derivative(r);
		number interp_der = gsl_spline_eval(_spl_patchy_star, r, _acc_patchy_star);
		out_der << r << " " << real_der << " " << interp_der << " " << (real_der - interp_der) / real_der << endl;
	}
	out_der.close();

	double *u_ys = new double[_interp_size]();
	double u_shift = gsl_spline_eval_integ(_spl_patchy_star, rs[0], rs[_interp_size-1], _acc_patchy_star);
	for(int i = 0; i < _interp_size; i++) {
		u_ys[i] = gsl_spline_eval_integ(_spl_patchy_star, rs[0], rs[i], _acc_patchy_star) - u_shift;
	}
	gsl_spline_init(_spl_patchy_star, rs, u_ys, _interp_size);

	delete[] rs;
	delete[] f_ys;
	delete[] u_ys;
}

template<typename number>
void NathanStarInteraction<number>::init() {
	_setup_lambda_kappa();

	_star_f1_2 = sqrt(_star_f);
	_star_f3_2 = _star_f*sqrt(_star_f);

	_star_rg = 0.5*_star_sigma_g;
	_star_rs = 2.*_star_rg/3.;
	_star_sigma_s = 2.*_star_sigma_g/3.;
	_sqr_star_rs = SQR(_star_rs);
	_sqr_star_sigma_s = SQR(_star_sigma_s);
	_sqr_star_sigma_g = SQR(_star_sigma_g);

	_patchy_star_rcut = _patch_r + 2*_star_sigma_g;
	_sqr_patchy_star_rcut = SQR(_patchy_star_rcut);

	_star_rcut = 3.*_star_sigma_s;
	_sqr_star_rcut = SQR(_star_rcut);

	_kappa = _kappa_rs / _star_rs;
	_xi = 1. / (1. + 2.*SQR(_kappa_rs));
	_exp_sqr_kappa_rs = exp(SQR(_kappa_rs));
	_zeta = _sqrt_pi * _xi * erfc(_kappa_rs) * _exp_sqr_kappa_rs / _kappa_rs;
	_erfc_kappa_rs = erfc(_kappa_rs);

	_patch_cutoff = _patch_alpha * 1.5;
	_patchy_rcut = 1. + _patch_cutoff;
	_sqr_patchy_rcut = SQR(_patchy_rcut);
	this->_rcut = 1. + _patch_cutoff;
	if(_star_rcut > this->_rcut) this->_rcut = _star_rcut;
	this->_sqr_rcut = SQR(this->_rcut);

	_rep_E_cut = pow((number) this->_rcut, -_rep_power);

	_patch_pow_sigma = pow(_patch_cosmax, _patch_power);
	_patch_pow_alpha = pow(_patch_alpha, (number) 10.);
	number r8b10 = pow(_patch_cutoff, (number) 8.) / _patch_pow_alpha;
	_patch_E_cut = -1.001 * exp(-(number)0.5 * r8b10 * SQR(_patch_cutoff));
	_patch_E_cut = 0.;

	_setup_interp();

	OX_LOG(Logger::LOG_INFO, "pi*lambda: %lf, kappa*rs: %lf, zeta: %lf, xi: %lf", _pi_lambda, _kappa_rs, _zeta, _xi);
}

template<typename number>
void NathanStarInteraction<number>::check_input_sanity(BaseParticle<number> **particles, int N) {

}

template<typename number>
number NathanStarInteraction<number>::pair_interaction(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces) {
	return pair_interaction_nonbonded(p, q, r, update_forces);
}

template<typename number>
number NathanStarInteraction<number>::pair_interaction_bonded(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces) {
	return (number) 0.;
}

template<typename number>
number NathanStarInteraction<number>::pair_interaction_nonbonded(BaseParticle<number> *p, BaseParticle<number> *q, LR_vector<number> *r, bool update_forces) {
	LR_vector<number> computed_r(0, 0, 0);
	if(r == NULL) {
		computed_r = q->pos.minimum_image(p->pos, this->_box_side);
		r = &computed_r;
	}

//	p->pos = LR_vector<number>(0, 0, 0);
//	for(number mr = 0.501; mr < _patchy_star_rcut; mr += 0.001) {
//		q->pos = LR_vector<number>(mr, 0, 0);
//		computed_r = q->pos.minimum_image(p->pos, this->_box_side);
//		r = &computed_r;
//		printf("%lf %lf\n", mr, _patchy_star_interaction(p, q, r, update_forces));
//		_patchy_star_interaction(p, q, r, update_forces);
//	}
//	throw oxDNAException("fatto");

	int type = p->type + q->type;
	if(type == PATCHY_PATCHY) return _patchy_interaction(p, q, r, update_forces);
	else if(type == PATCHY_POLYMER) return _patchy_star_interaction(p, q, r, update_forces);
	else return _star_star_interaction(p, q, r, update_forces);
}

template class NathanStarInteraction<float>;
template class NathanStarInteraction<double>;
