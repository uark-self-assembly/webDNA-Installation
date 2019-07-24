#include "MD_SP_CUDAMPIBackend.h"
#include "CUDA_MD.cuh"
#include "../CUDA_base_interactions.h"
#include "../../Interactions/DNAInteraction.h"
#include "../Thermostats/CUDAThermostatFactory.h"
#include <thrust/sort.h>
#include <typeinfo>
#include <type_traits>

#include "../../Forces/COMForce.h"
#include "../../Forces/ConstantRateForce.h"
#include "../../Forces/ConstantRateTorque.h"
#include "../../Forces/ConstantTrap.h"
#include "../../Forces/LowdimMovingTrap.h"
#include "../../Forces/MovingTrap.h"
#include "../../Forces/MutualTrap.h"
#include "../../Forces/RepulsionPlane.h"
#include "../../Forces/RepulsionPlaneMoving.h"
#include "../../Forces/RepulsiveSphere.h"

__constant__ int verlet_N[1];

template <typename number, typename number4>
__global__ void check_partition(number4 *poss, int *part, int N,
                                number4 part_center, number4 part_radius,
                                number box_side, number boundary_size)
{
    if (IND >= N) return;
    
    number4 r = poss[IND];
    r.x = fmod(fmod(r.x, box_side) + box_side, box_side);
    r.y = fmod(fmod(r.y, box_side) + box_side, box_side);
    r.z = fmod(fmod(r.z, box_side) + box_side, box_side);

    number4 delta;
    delta.x = fabs(r.x - part_center.x);
    delta.y = fabs(r.y - part_center.y);
    delta.z = fabs(r.z - part_center.z);

    number4 inv_delta;
    inv_delta.x = box_side - delta.x;
    inv_delta.y = box_side - delta.y;
    inv_delta.z = box_side - delta.z;

    number4 min_delta;
    min_delta.x = fmin(delta.x, inv_delta.x);
    min_delta.y = fmin(delta.y, inv_delta.y);
    min_delta.z = fmin(delta.z, inv_delta.z);
    
    int contains = 0;

    if (min_delta.x <= part_radius.x and
        min_delta.y <= part_radius.y and
        min_delta.z <= part_radius.z)
    {
        contains = 1;
    }

    else if (min_delta.x <= part_radius.x + boundary_size and
        min_delta.y <= part_radius.y + boundary_size and
        min_delta.z <= part_radius.z + boundary_size)
    {
        contains = 2;
    }

    part[IND] = contains;
}

template <typename number, typename number4>
__global__ void redistribute_particles(number4 *poss, number4 *vels, number4 *Ls,
                                       GPU_quat<number> *orients, number4 *poss_buff,
                                       number4 *vels_buff, number4 *Ls_buff,
                                       GPU_quat<number> *orients_buff, int N)
{
    if (IND >= N) return;

    number4 r = poss_buff[IND];
    int idx = __float_as_int(r.w);

    poss[idx] = r;
    vels[idx] = vels_buff[IND];
    Ls[idx] = Ls_buff[IND];
    orients[idx] = orients_buff[IND];
}

template<typename number, typename number4>
MD_SP_CUDAMPIBackend<number, number4>::MD_SP_CUDAMPIBackend() : MD_CUDABackend<number, number4>() {
	this->_is_CUDA_sim = true;

    _h_partition = _d_partition = NULL;
    _h_buff_vels = _h_buff_Ls = NULL;
    _h_comp_poss = _h_comp_vels = NULL;
    _d_comp_poss = _d_comp_vels = NULL;
    _h_comp_Ls = _d_comp_Ls = NULL;
    _h_comp_orientations = _d_comp_orientations = NULL;
    _h_buff_orientations = _d_buff_orientations = NULL;
}

template<typename number, typename number4>
MD_SP_CUDAMPIBackend<number, number4>::~MD_SP_CUDAMPIBackend() {
    
    delete[] _h_partition;
    
    delete[] _h_buff_poss;
    delete[] _h_buff_vels;
    delete[] _h_buff_Ls;

    delete[] _h_comp_poss;
    delete[] _h_comp_vels;
    delete[] _h_comp_Ls;
    
    delete[] _h_buff_orientations;
    delete[] _h_comp_orientations;

    CUDA_SAFE_CALL( cudaFree(_d_partition) );
    
    CUDA_SAFE_CALL( cudaFree(_d_comp_poss) );
    CUDA_SAFE_CALL( cudaFree(_d_comp_vels) );
    CUDA_SAFE_CALL( cudaFree(_d_comp_Ls) );
    CUDA_SAFE_CALL( cudaFree(_d_buff_poss) );
    CUDA_SAFE_CALL( cudaFree(_d_buff_vels) );
    CUDA_SAFE_CALL( cudaFree(_d_buff_Ls) );

    CUDA_SAFE_CALL( cudaFree(_d_buff_orientations) );
    CUDA_SAFE_CALL( cudaFree(_d_comp_orientations) );
}

template<typename number4>
void _init_mpi_type(MPI_Datatype &number4_type, MPI_Datatype &quat_type)
{
    if (std::is_same<number4, float4>::value)
    {
        int lengths[1] = {4};
        const MPI_Aint disps[1] = {0};
        MPI_Datatype types[1] = {MPI_FLOAT};

        MPI_Type_create_struct(1, lengths, disps, types, &number4_type);
        MPI_Type_commit(&number4_type);

        MPI_Type_create_struct(1, lengths, disps, types, &quat_type);
        MPI_Type_commit(&quat_type);
    }
    else
    {
        int lengths[2] = {3, 1};
        const MPI_Aint disps[2] = {0, sizeof(double) * 3};
        MPI_Datatype types[2] = {MPI_DOUBLE, MPI_FLOAT};

        MPI_Type_create_struct(2, lengths, disps, types, &number4_type);
        MPI_Type_commit(&number4_type);

        int qlengths[1] = {4};
        const MPI_Aint qdisps[1] = {0};
        MPI_Datatype qtypes[1] = {MPI_DOUBLE};

        MPI_Type_create_struct(1, qlengths, qdisps, qtypes, &quat_type);
        MPI_Type_commit(&quat_type);
    }
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_compactify_partition()
{
    thrust::device_ptr<int> _d_partition_ptr(_d_partition);

    thrust::device_ptr<number4> _d_poss_ptr(this->_d_poss);
	thrust::device_ptr<number4> _d_vels_ptr(this->_d_vels);
    thrust::device_ptr<number4> _d_Ls_ptr(this->_d_Ls);
    thrust::device_ptr<GPU_quat<number> > _d_orientations_ptr(this->_d_orientations);
    
    thrust::device_ptr<number4> _d_poss_comp_ptr(this->_d_comp_poss);
	thrust::device_ptr<number4> _d_vels_comp_ptr(this->_d_comp_vels);
    thrust::device_ptr<number4> _d_Ls_comp_ptr(this->_d_comp_Ls);
    thrust::device_ptr<GPU_quat<number> > _d_orientations_comp_ptr(this->_d_comp_orientations);
    
    thrust::device_vector<int> _d_part_vec(this->_N);

    auto poss_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr, _d_poss_ptr));
    auto vels_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr, _d_vels_ptr));
    auto Ls_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr, _d_Ls_ptr));
    auto orientations_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr, _d_orientations_ptr));
    
    auto poss_tup_end = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr + this->_N, _d_poss_ptr + this->_N));
    auto vels_tup_end = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr + this->_N, _d_vels_ptr + this->_N));
    auto Ls_tup_end = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr + this->_N, _d_Ls_ptr + this->_N));
    auto orientations_tup_end = thrust::make_zip_iterator(
        thrust::make_tuple(_d_partition_ptr + this->_N, _d_orientations_ptr + this->_N));

    auto poss_comp_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_part_vec.begin(), _d_poss_comp_ptr));
    auto vels_comp_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_part_vec.begin(), _d_vels_comp_ptr));
    auto Ls_comp_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_part_vec.begin(), _d_Ls_comp_ptr));
    auto orientations_comp_tup_beg = thrust::make_zip_iterator(
        thrust::make_tuple(_d_part_vec.begin(), _d_orientations_comp_ptr));

    thrust::copy_if(poss_tup_beg, poss_tup_end, poss_comp_tup_beg, in_partition<number4>());
    thrust::stable_sort_by_key(_d_part_vec.begin(), _d_part_vec.end(), _d_poss_comp_ptr, part_sort());
    
    thrust::copy_if(vels_tup_beg, vels_tup_end, vels_comp_tup_beg, in_partition<number4>());
    thrust::stable_sort_by_key(_d_part_vec.begin(), _d_part_vec.end(), _d_vels_comp_ptr, part_sort());
    
    thrust::copy_if(Ls_tup_beg, Ls_tup_end, Ls_comp_tup_beg, in_partition<number4>());
    thrust::stable_sort_by_key(_d_part_vec.begin(), _d_part_vec.end(), _d_Ls_comp_ptr, part_sort());
    
    thrust::copy_if(orientations_tup_beg, orientations_tup_end, orientations_comp_tup_beg, in_partition<GPU_quat<number> >());
    thrust::stable_sort_by_key(_d_part_vec.begin(), _d_part_vec.end(), _d_orientations_comp_ptr, part_sort());
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_check_partition()
{
    check_partition<number, number4>
        <<<this->_particles_kernel_cfg.blocks, this->_particles_kernel_cfg.threads_per_block>>>
        (this->_d_poss, _d_partition, this->_N, _part_center, _part_radius, this->_box_side, _boundary_size);
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_count_partition()
{
    thrust::device_ptr<int> _d_partition_ptr(_d_partition);
    this->_P_N = thrust::count_if(_d_partition_ptr, _d_partition_ptr + this->_N, is_one());
    this->_B_N = thrust::count_if(_d_partition_ptr, _d_partition_ptr + this->_N, is_two());
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_redistribute_particles()
{
    redistribute_particles<number, number4>
        <<<this->_particles_kernel_cfg.blocks, this->_particles_kernel_cfg.threads_per_block>>>
        (this->_d_poss, this->_d_vels, this->_d_Ls, this->_d_orientations,
         _d_buff_poss, _d_buff_vels, _d_buff_Ls, _d_buff_orientations, this->_N);
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_exchange_particles()
{
    CUDA_SAFE_CALL( cudaMemcpy(this->_h_comp_poss, this->_d_comp_poss, this->_N * sizeof(number4), cudaMemcpyDeviceToHost) );
    CUDA_SAFE_CALL( cudaMemcpy(this->_h_comp_vels, this->_d_comp_vels, this->_N * sizeof(number4), cudaMemcpyDeviceToHost) );
    CUDA_SAFE_CALL( cudaMemcpy(this->_h_comp_Ls, this->_d_comp_Ls, this->_N * sizeof(number4), cudaMemcpyDeviceToHost) );
    CUDA_SAFE_CALL( cudaMemcpy(this->_h_comp_orientations, this->_d_comp_orientations, this->_N * sizeof(GPU_quat<number>), cudaMemcpyDeviceToHost) );
    
    int part_counts[_proc_size];
    int part_offsets[_proc_size];

    MPI_Allgather(&_P_N, 1, MPI_INT, &part_counts[0], 1, MPI_INT, MPI_COMM_WORLD);

    part_offsets[0] = 0;
    for (int i = 0; i < _proc_size; i++)
        part_offsets[i] = part_offsets[i - 1] + part_counts[i - 1];

    MPI_Allgatherv(_h_comp_poss, _P_N, this->_number4_type, _h_buff_poss,
                   part_counts, part_offsets, this->_number4_type, MPI_COMM_WORLD);
    MPI_Allgatherv(_h_comp_vels, _P_N, this->_number4_type, _h_buff_vels,
                   part_counts, part_offsets, this->_number4_type, MPI_COMM_WORLD);
    MPI_Allgatherv(_h_comp_Ls, _P_N, this->_number4_type, _h_buff_Ls,
                   part_counts, part_offsets, this->_number4_type, MPI_COMM_WORLD);
    MPI_Allgatherv(_h_comp_orientations, _P_N, this->_quat_type, _h_buff_orientations,
                   part_counts, part_offsets, this->_quat_type, MPI_COMM_WORLD);

    MPI_Barrier(MPI_COMM_WORLD);

    CUDA_SAFE_CALL( cudaMemcpy(this->_d_buff_poss, this->_h_buff_poss, this->_N * sizeof(number4), cudaMemcpyHostToDevice) );
    CUDA_SAFE_CALL( cudaMemcpy(this->_d_buff_vels, this->_h_buff_vels, this->_N * sizeof(number4), cudaMemcpyHostToDevice) );
    CUDA_SAFE_CALL( cudaMemcpy(this->_d_buff_Ls, this->_h_buff_Ls, this->_N * sizeof(number4), cudaMemcpyHostToDevice) );
    CUDA_SAFE_CALL( cudaMemcpy(this->_d_buff_orientations, this->_h_buff_orientations, this->_N * sizeof(GPU_quat<number>), cudaMemcpyHostToDevice) );
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_compute_num_blocks(int N)
{
    this->_particles_kernel_cfg.blocks.x = N / this->_particles_kernel_cfg.threads_per_block + ((N % this->_particles_kernel_cfg.threads_per_block == 0) ? 0 : 1);
    this->_cuda_interaction->set_launch_cfg(this->_particles_kernel_cfg);
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::choose_device () {
	OX_LOG(Logger::LOG_INFO, "Choosing device automatically");

	int ndev = -1, trydev = 0;
	cudaError_t ggg;
	cudaDeviceProp tryprop;

	cudaGetDeviceCount (&ndev);
	OX_LOG(Logger::LOG_INFO, "Computer has %i devices", ndev);

    int valid = 0;
    int devices[ndev];
    
	while (trydev < ndev) {
		tryprop = get_device_prop (trydev);
		OX_LOG(Logger::LOG_INFO, " -- device %i has properties %i.%i", trydev, tryprop.major, tryprop.minor);
		if (tryprop.major < 2 && tryprop.minor <= 2)
        {
			trydev++;
			continue;
		}
        else
        {
            devices[valid++] = trydev;
        }
        trydev++;
    }
    if (valid == 0) throw oxDNAException("No suitable devices available");
    OX_LOG(Logger::LOG_INFO, "Process %d has access to %d good GPU devices", this->_myid, valid);

    // if statement here to determine if it's one machine with several GPUs
    // or several machines each with a GPU

    trydev = this->_myid % valid;
    set_device (devices[trydev]);
    int * dummyptr;
    ggg = GpuUtils::LR_cudaMalloc<int> (& dummyptr, (size_t)sizeof(int));
    if (ggg == cudaSuccess) {
        OX_LOG(Logger::LOG_INFO, "Process %d using device %i", this->_myid, trydev);
        cudaFree (dummyptr);
    }
    else {
        throw oxDNAException("Unable to access device");
    }

	this->_device_prop = get_device_prop(trydev);
	this->_device_number = trydev;
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_first_step() {
	first_step<number, number4>
		<<<this->_particles_kernel_cfg.blocks, this->_particles_kernel_cfg.threads_per_block>>>
		(this->_d_comp_poss, this->_d_comp_orientations, this->_d_list_poss, _d_comp_vels, _d_comp_Ls, this->_d_forces, this->_d_torques, this->_d_are_lists_old);
	CUT_CHECK_ERROR("_first_step error");
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_forces_second_step() {
	_set_external_forces();
	this->_cuda_interaction->compute_forces(this->_cuda_lists, this->_d_comp_poss, this->_d_comp_orientations, this->_d_forces, this->_d_torques, this->_d_bonds);

	second_step<number, number4>
		<<<this->_particles_kernel_cfg.blocks, this->_particles_kernel_cfg.threads_per_block>>>
		(this->_d_comp_vels, this->_d_comp_Ls, this->_d_forces, this->_d_torques);
		CUT_CHECK_ERROR("second_step");
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_set_external_forces() {
	set_external_forces<number, number4>
		<<<this->_particles_kernel_cfg.blocks, this->_particles_kernel_cfg.threads_per_block>>>
		(this->_d_comp_poss, this->_d_comp_orientations, this->_d_ext_forces, this->_d_forces, this->_d_torques, this->_curr_step, this->_max_ext_forces);
	CUT_CHECK_ERROR("set_external_forces");
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::_thermalize(llint curr_step) {
	//_cuda_thermostat->apply_cuda(this->_d_poss, this->_d_orientations, _d_vels, _d_Ls, curr_step); 
	//_cuda_thermostat->apply_cuda(this->_d_poss, this->_d_orientations, _d_vels, _d_Ls, this->_d_massinvs, curr_step); // TLF changed
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::sim_step(llint curr_step) {
	this->_curr_step = curr_step;
	get_time(&this->_timer, 0);

	get_time(&this->_timer, 2);
    this->_compute_num_blocks(this->_P_N);
    CUDA_SAFE_CALL( cudaMemcpyToSymbol(MD_N, &this->_P_N, sizeof(int)) );
	_first_step();
	cudaThreadSynchronize();
	get_time(&this->_timer, 3);

	get_time(&this->_timer, 4);
    this->_exchange_particles();
    
    this->_compute_num_blocks(this->_N);
    this->_redistribute_particles();
    cudaThreadSynchronize();

    this->_check_partition();
    cudaThreadSynchronize();

    this->_count_partition();
    this->_compactify_partition();
	get_time(&this->_timer, 5);

	get_time(&this->_timer, 6);
    this->_compute_num_blocks(this->_P_N + _B_N);
    int _PB_N = _P_N + _B_N;
    CUDA_SAFE_CALL( cudaMemcpyToSymbol(verlet_N, &_PB_N, sizeof(int)) );
    
    this->_cuda_lists->update(this->_d_poss, this->_d_list_poss, this->_d_bonds);
    this->_d_are_lists_old[0] = false;
    this->_N_updates++;
    cudaThreadSynchronize();
	get_time(&this->_timer, 7);

	get_time(&this->_timer, 8);
	_forces_second_step();
	cudaThreadSynchronize();
	get_time(&this->_timer, 9);

	get_time(&this->_timer, 10);
    this->_compute_num_blocks(this->_P_N);
	_thermalize(curr_step);
	cudaThreadSynchronize();
	get_time(&this->_timer, 11);

	get_time(&this->_timer, 1);

	process_times(&this->_timer);
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::get_settings(input_file &inp) {
	MD_CUDABackend<number, number4>::get_settings(inp);

    this->_part_dims[0] = 1;
	getInputInt(&inp, "partition_dim_x", &_part_dims[0], 0);
	if (this->_part_dims[0] <= 0) throw oxDNAException("Invalid partition x dimension '%d'\n", _part_dims[0]);

	this->_part_dims[1] = 1;
	getInputInt(&inp, "partition_dim_y", &_part_dims[1], 0);
	if (this->_part_dims[1] <= 0) throw oxDNAException("Invalid partition y dimension '%d'\n", _part_dims[1]);

	this->_part_dims[2] = 1;
	getInputInt(&inp, "partition_dim_z", &_part_dims[2], 0);
	if (this->_part_dims[2] <= 0) throw oxDNAException("Invalid partition z dimension '%d'\n", _part_dims[2]);

    this->_boundary_size = 2.0f;
}

template<typename number, typename number4>
void MD_SP_CUDAMPIBackend<number, number4>::init(char conf_filename[256]){
	MD_CUDABackend<number, number4>::init(conf_filename);
    
    MPI_Comm_rank(MPI_COMM_WORLD, &_myid);
    MPI_Comm_size(MPI_COMM_WORLD, &_proc_size);

    this->choose_device();
    
    // initialize MPI types
    _init_mpi_type<number4>(_number4_type, _quat_type);

    _h_partition = new int[this->_N];
    _h_buff_poss = new number4[this->_N];
    _h_buff_vels = new number4[this->_N];
    _h_buff_Ls = new number4[this->_N];
    
    _h_comp_poss = new number4[this->_N];
    _h_comp_vels = new number4[this->_N];
    _h_comp_Ls = new number4[this->_N];
    
    _h_buff_orientations = new GPU_quat<number>[this->_N];
    _h_comp_orientations = new GPU_quat<number>[this->_N];
    
    
    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<int>(&_d_partition, this->_N * sizeof(int)) );

    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<number4>(&_d_comp_poss, this->_N * sizeof(float4)) );
    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<number4>(&_d_comp_vels, this->_N * sizeof(float4)) );
    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<number4>(&_d_comp_Ls, this->_N * sizeof(float4)) );

    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<number4>(&_d_buff_poss, this->_N * sizeof(float4)) );
    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<number4>(&_d_buff_vels, this->_N * sizeof(float4)) );
    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<number4>(&_d_buff_Ls, this->_N * sizeof(float4)) );

    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<GPU_quat<number> >(&_d_buff_orientations, this->_N * sizeof(GPU_quat<number>)) );
    CUDA_SAFE_CALL( GpuUtils::LR_cudaMalloc<GPU_quat<number> >(&_d_comp_orientations, this->_N * sizeof(GPU_quat<number>)) );

    if(this->_sort_every > 0) throw oxDNAException("CUDA + MPI and CUDA_sort_every > 0 are not compatible");

	this->_host_particles_to_gpu();
	this->_init_CUDA_MD_symbols();

	this->_cuda_thermostat->set_seed(lrand48());
	this->_cuda_thermostat->init(this->_N);

	OX_DEBUG("Allocated CUDA memory: %.2lf MBs", GpuUtils::get_allocated_mem_mb());

    // calculate partition coordinates
	this->_part_coords[0] = _myid									% _part_dims[0];
	this->_part_coords[1] = _myid / (_part_dims[0])					% _part_dims[1];
	this->_part_coords[2] = _myid / (_part_dims[0] * _part_dims[1]) % _part_dims[2];
    
    // Calculate partition bounds
	this->_part_size.x = this->_box_side / _part_dims[0];
	this->_part_size.y = this->_box_side / _part_dims[1];
	this->_part_size.z = this->_box_side / _part_dims[2];

	this->_part_origin.x = _part_size.x * _part_coords[0];
	this->_part_origin.y = _part_size.y * _part_coords[1];
	this->_part_origin.z = _part_size.z * _part_coords[2];

    this->_part_radius.x = _part_size.x / (number)2;
    this->_part_radius.y = _part_size.y / (number)2;
    this->_part_radius.z = _part_size.z / (number)2;
    
    this->_part_center.x = _part_origin.x + _part_radius.x;
    this->_part_center.y = _part_origin.y + _part_radius.y;
    this->_part_center.z = _part_origin.z + _part_radius.z;
    
    this->_compute_num_blocks(this->_N);
    this->_check_partition();
    cudaThreadSynchronize();

    this->_count_partition();
    this->_compactify_partition();
}

// template instantiations
template class MD_SP_CUDAMPIBackend<float, float4>;
template class MD_SP_CUDAMPIBackend<double, LR_double4>;
