#ifndef MD_SP_CUDAMPIBACKEND_H_
#define MD_SP_CUDAMPIBACKEND_H_

#include <mpi.h>
#include <cuda.h>
#include <cuda_runtime_api.h>
#include <thrust/device_vector.h>
#include <thrust/device_ptr.h>
#include <thrust/tuple.h>
#include <thrust/copy.h>
#include <thrust/count.h>
#include <thrust/iterator/zip_iterator.h>

#include "MD_CUDABackend.h"

template <typename T>
struct in_partition
{
    __device__ __host__ bool operator()(thrust::tuple<int, T> t)
    {
        return (thrust::get<0>(t) != 0);
    }
};

struct part_sort
{
    __device__ __host__ bool operator()(const int &a, const int &b)
    {
        if (a != 0 and b != 0)
            return a < b;
        else if (a != 0)
            return true;
        else
            return false;
    }
};

struct is_one
{
    __device__ __host__ bool operator()(int i)
    {
        return i == 1;
    }
};

struct is_two
{
    __device__ __host__ bool operator()(int i)
    {
        return i == 2;
    }
};

template <typename number4>
void _init_mpi_type(MPI_Datatype&, MPI_Datatype&);

/**
 * @brief Manages an MD simulation on multiple GPUs with CUDA and MPI.
 */
template<typename number, typename number4>
class MD_SP_CUDAMPIBackend: public MD_CUDABackend<number, number4> {
protected:
    int _P_N; // number of particles in partition
    int _B_N; // number of particles in boundary

    int _myid, _proc_size;
    MPI_Datatype _number4_type, _quat_type;

    int _part_dims[3];
    int _part_coords[3];
    number4 _part_size, _part_origin;
    number4 _part_center, _part_radius; // the center and radius of the current spacial partition
    number _boundary_size; // the size of the boundary overlap

    // stores a 1 if a particle is in the current partition
    // 2 if the particle is in the boundary
    // 0 otherwise
    int *_d_partition, *_h_partition;

    number4 *_d_buff_poss, *_h_buff_poss;
    number4 *_d_buff_vels, *_h_buff_vels;
    number4 *_d_buff_Ls, *_h_buff_Ls;
    number4 *_d_comp_poss, *_h_comp_poss;
    number4 *_d_comp_vels, *_h_comp_vels;
    number4 *_d_comp_Ls, *_h_comp_Ls;
    GPU_quat<number> *_d_buff_orientations, *_h_buff_orientations;
    GPU_quat<number> *_d_comp_orientations, *_h_comp_orientations;
    
    void _compactify_partition();
    void _check_partition();
    void _count_partition();
    void _redistribute_particles();
    void _exchange_particles();
    void _compute_num_blocks(int N);

    virtual void choose_device();
    
	virtual void _first_step();
	virtual void _forces_second_step();
	virtual void _set_external_forces();

	virtual void _thermalize(llint curr_step);
public:
	MD_SP_CUDAMPIBackend();
	virtual ~MD_SP_CUDAMPIBackend();

	virtual void get_settings(input_file &inp);
	virtual void init(char conf_filename[256]);
	virtual void sim_step(llint curr_step);
};

#endif
