#ifndef MD_SP_MPIBACKEND_H_
#define MD_SP_MPIBACKEND_H_

#include "MD_CPUBackend.h"
#include "./Thermostats/BaseThermostat.h"

#include <mpi.h>
#include <unordered_set>
#include <vector>
#include <list>
#include <cstddef>
#include <type_traits>

#ifndef NOCUDA //======= if CUDA, we need to define QUAD TYPES respectively ================//
#include <cuda.h>
#include "../CUDA/CUDAUtils.h"
typedef LR_double4 d_quadtype;
typedef float4 f_quadtype;
#else  //=============== otherwise, QUAD TYPES are unused so they can just be default ======//
typedef double d_quadtype;
typedef float f_quadtype;
#endif

template <typename number, typename number4>
struct BaseMDBackend
{	
//#ifdef NOCUDA // if no cuda, then we inherit from the normal MD backend
    typedef MDBackend<number> type;
//#else // otherwise, inherit from the MD CUDA backend
//    typedef MD_CUDABackend<number, number4> type;
//#endif
};

#define PARTITION_MASK 1
#define BOUNDARY_MASK 2

template<typename number>
struct Serialized_particle
{
	int index;

    number en3;
    number en5;
    number esn3;
    number esn5;
    
	number pos[3];
	number vel[3];
	number L[3];

    number int_centers[3 * 3];
	number orientation[9];
    number orientationT[9];

	number force[3];
	number torque[3];

	void read(const BaseParticle<number> *p);
	void write(BaseParticle<number> *p);

    static MPI_Datatype mpi_type;
    static void init_datatype()
    {
        int lengths[13] = {1, 1, 1, 1, 1, 3, 3, 3, 9, 9, 9, 3, 3};
        const MPI_Aint displacements[13] = {
            offsetof(Serialized_particle, index),
            offsetof(Serialized_particle, en3),
            offsetof(Serialized_particle, en5),
            offsetof(Serialized_particle, esn3),
            offsetof(Serialized_particle, esn5),
            offsetof(Serialized_particle, pos),
            offsetof(Serialized_particle, vel),
            offsetof(Serialized_particle, L),
            offsetof(Serialized_particle, int_centers),
            offsetof(Serialized_particle, orientation),
            offsetof(Serialized_particle, orientationT),
            offsetof(Serialized_particle, force),
            offsetof(Serialized_particle, torque)
        };
        MPI_Datatype number_type = MPI_DOUBLE;
        if (std::is_same<number, float>::value)
            number_type = MPI_FLOAT;
        
        MPI_Datatype types[13] = {
            MPI_INT,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
            number_type,
        };

        MPI_Type_create_struct(13, lengths, displacements, types, &mpi_type);
        MPI_Type_commit(&mpi_type);
    }
};

template <typename number, typename number4>
class MD_SP_MPIBackend : public BaseMDBackend<number, number4>::type
{
protected:

	BaseThermostat<number> *_thermostat;

	int _myid, _proc_size;
    int _system_particle_count;

	// how many partitions per direction
	int _part_dims[3];
	int _part_coords[3];

	// size of partition as subset of box
	LR_vector<number> _part_origin;
    LR_vector<number> _part_center;
	LR_vector<number> _part_size;
    LR_vector<number> _part_radius;

    // partition overlap
    number _part_overlap;
    
	// indices of particles in my partition
	std::unordered_set<int> _part_indices;
    std::unordered_set<int> _part_boundary;
	std::vector<int> _neighbors;
	Serialized_particle<number> *_serialized_particles;
    int _serialized_particle_count;

    BaseParticle<number>** _my_particles;
    int _no_boundary_count;
    int _total_count;
    
	void _first_step(llint cur_step);
	void _compute_forces();
    void _second_step();

	// returns id of neighbor partition given dx, dy, dz
	int get_neighbor_id(int dx, int dy, int dz) const;
    void exchange_serialized_particles();
    void gather_serialized_particles();
    
    // returns value to be masked with defines above
    int partition_contains(const BaseParticle<number> *p) const;
	virtual void update_partition();
    virtual void update_particles();

    void print_conf(llint curr_step, bool reduced, bool only_last);
    void print_observables(llint curr_step);
    
public:
	MD_SP_MPIBackend();
	virtual ~MD_SP_MPIBackend();

	void init(char conf_filename[256]);
	void get_settings (input_file &inp);
	void sim_step(llint curr_step);
};

#endif
