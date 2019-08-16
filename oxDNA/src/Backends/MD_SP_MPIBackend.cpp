#include <sstream>

#include "MD_SP_MPIBackend.h"
#include "./Thermostats/ThermostatFactory.h"

template <typename number>
void Serialized_particle<number>::read(const BaseParticle<number> *p)
{
	this->index        = p->index;
    
    for (int i = 0; i < 3; i++)
    {
        this->pos[i]    = p->pos[i];
        this->vel[i]    = p->vel[i];
        this->force[i]  = p->force[i];
        this->torque[i] = p->torque[i];
        this->L[i]      = p->L[i];

        this->orientation[i + 0] = p->orientation.v1[i];
        this->orientation[i + 3] = p->orientation.v2[i];
        this->orientation[i + 6] = p->orientation.v3[i];

        this->orientationT[i + 0] = p->orientationT.v1[i];
        this->orientationT[i + 3] = p->orientationT.v2[i];
        this->orientationT[i + 6] = p->orientationT.v3[i];
    }

    this->en3          = p->en3;
    this->en5          = p->en5;
    this->esn3         = p->esn3;
    this->esn5         = p->esn5;

    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            this->int_centers[j + i * 3] = (p->int_centers[i])[j];
}

template <typename number>
void Serialized_particle<number>::write(BaseParticle<number> *p)
{
	if (p->index != this->index)
		throw oxDNAException("Attempted to overwrite particle %d with wrong serialized particle %d", p->index, this->index);

	p->index        = this->index;

    p->pos          = LR_vector<number>(this->pos);
    p->vel          = LR_vector<number>(this->vel);
    p->force        = LR_vector<number>(this->force);
    p->torque       = LR_vector<number>(this->torque);
    p->L            = LR_vector<number>(this->L);
    
    p->en3          = this->en3;
    p->en5          = this->en5;
    p->esn3         = this->esn3;
    p->esn5         = this->esn5;

	p->orientation.v1 = LR_vector<number>
        (this->orientation[0], this->orientation[1], this->orientation[2]);
    p->orientation.v2 = LR_vector<number>
        (this->orientation[3], this->orientation[4], this->orientation[5]);
    p->orientation.v3 = LR_vector<number>
        (this->orientation[6], this->orientation[7], this->orientation[8]);

    p->orientationT.v1 = LR_vector<number>
        (this->orientationT[0], this->orientationT[1], this->orientationT[2]);
    p->orientationT.v2 = LR_vector<number>
        (this->orientationT[3], this->orientationT[4], this->orientationT[5]);
    p->orientationT.v3 = LR_vector<number>
        (this->orientationT[6], this->orientationT[7], this->orientationT[8]);
    
    for (int i = 0; i < 3; i++)
        p->int_centers[i] = LR_vector<number>(this->int_centers[3 * i + 0], this->int_centers[3 * i + 1], this->int_centers[3 * i + 2]);
}

template <typename number>
MPI_Datatype Serialized_particle<number>::mpi_type;

template <typename number, typename number4>
MD_SP_MPIBackend<number, number4>::MD_SP_MPIBackend() : BaseMDBackend<number, number4>::type()
{
	this->_timer_msgs_number = 6;
    strncpy(this->_timer_msgs[0], "MD step", 256);
	strncpy(this->_timer_msgs[1], "First step", 256);
	strncpy(this->_timer_msgs[2], "Particle exchange", 256);
	strncpy(this->_timer_msgs[3], "Lists update", 256);
	strncpy(this->_timer_msgs[4], "Forces + second step", 256);
	strncpy(this->_timer_msgs[5], "Thermostat", 256);
    
}

template <typename number, typename number4>
MD_SP_MPIBackend<number, number4>::~MD_SP_MPIBackend()
{
	delete _thermostat;
    delete [] _serialized_particles;
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::exchange_serialized_particles()
{
    int count = this->_neighbors.size();
    MPI_Request requests[2 * count];
    MPI_Status statuses[2 * count];

    int sp_size = this->_serialized_particle_count;
    int nb_sizes[count];

    MPI_Barrier(MPI_COMM_WORLD);

    //========== SEND NUMBER OF PARTICLES TO SEND =============//
    
    for (unsigned int i = 0; i < this->_neighbors.size(); i++)
    {
        int nbr = this->_neighbors[i];
        MPI_Isend((void*)&sp_size, 1, MPI_INT, nbr, 0, MPI_COMM_WORLD, &requests[2 * i]);
        MPI_Irecv((void*)&nb_sizes[i], 1, MPI_INT, nbr, 0, MPI_COMM_WORLD, &requests[2 * i + 1]);
    }

    MPI_Waitall(2 * count, requests, statuses);
    MPI_Barrier(MPI_COMM_WORLD);

    //========== SEND ACTUAL PARTICLES =============//

    Serialized_particle<number> **nbr_particles = new Serialized_particle<number>*[count];
    for (int k = 0; k < count; k++)
        nbr_particles[k] = new Serialized_particle<number>[nb_sizes[k]];
    
    for (unsigned int i = 0; i < this->_neighbors.size(); i++)
    {
        int nbr = this->_neighbors[i];
        MPI_Isend(this->_serialized_particles, this->_serialized_particle_count,
                  Serialized_particle<number>::mpi_type, nbr, 0, MPI_COMM_WORLD, &requests[2 * i]);
        MPI_Irecv(nbr_particles[i], nb_sizes[i],
                  Serialized_particle<number>::mpi_type, nbr, 0, MPI_COMM_WORLD, &requests[2 * i + 1]);
    }

    MPI_Waitall(2 * count, requests, statuses);
    MPI_Barrier(MPI_COMM_WORLD);

    //============ ASSIGN NEW PARTICLES TO PARTITION ==========//

    for (int k = 0; k < count; k++)
    {
        for (int j = 0; j < nb_sizes[k]; j++)
        {
            BaseParticle<number> *p = this->_particles[nbr_particles[k][j].index];
            nbr_particles[k][j].write(p);
            this->_lists->single_update(p);

            int contains = partition_contains(p);
            if ((contains & PARTITION_MASK) != 0)
                _part_indices.insert(p->index);
            if ((contains & BOUNDARY_MASK) != 0)
                _part_boundary.insert(p->index);
        }
        delete [] nbr_particles[k];
    }
    delete [] nbr_particles;
}


template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::gather_serialized_particles()
{
    MPI_Barrier(MPI_COMM_WORLD);

    if (_proc_size == 0) return;
    
    if (_myid == 0)
    {
        int total_count = _part_indices.size();
        int nb_part_count[_proc_size];
        MPI_Status statuses[_proc_size];

        for (int i = 1; i < _proc_size; i++)
            MPI_Recv(&nb_part_count[i], 1, MPI_INT, i, 0, MPI_COMM_WORLD, &statuses[i]);

        MPI_Barrier(MPI_COMM_WORLD);

        Serialized_particle<number> *nb_particles = new Serialized_particle<number>[this->_system_particle_count];
        for (int i = 1; i < _proc_size; i++)
        {
            if (nb_part_count[i] > this->_system_particle_count)
                OX_LOG(Logger::LOG_INFO, "partition has more particles than the system: %d\n", nb_part_count[i]);

            MPI_Recv(&nb_particles[0], nb_part_count[i],
                     Serialized_particle<number>::mpi_type, i, 0, MPI_COMM_WORLD, &statuses[i]);

            for (int j = 0; j < nb_part_count[i]; j++)
            {
                BaseParticle<number> *p = this->_particles[nb_particles[j].index];
                nb_particles[j].write(p);
            }

            total_count += nb_part_count[i];
        }

        if (total_count != this->_system_particle_count)
        	OX_LOG(Logger::LOG_INFO, "particle count diverged: %d (should be %d).\n", total_count, this->_system_particle_count);
        delete [] nb_particles;

        this->_lists->global_update();
    }
    else
    {
        int i = 0;
        _serialized_particle_count = _part_indices.size();
        for (auto it = _part_indices.begin(); it != _part_indices.end(); ++it)
        {
            BaseParticle<number> *p = this->_particles[*it];
            _serialized_particles[i++].read(p);
        }
        
        int part_count = this->_serialized_particle_count;
        MPI_Send(&part_count, 1, MPI_INT, 0, 0, MPI_COMM_WORLD);

        MPI_Barrier(MPI_COMM_WORLD);

        MPI_Send(this->_serialized_particles, part_count,
                 Serialized_particle<number>::mpi_type, 0, 0, MPI_COMM_WORLD);
    }

    MPI_Barrier(MPI_COMM_WORLD);
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::init(char conf_filename[256])
{
	BaseMDBackend<number, number4>::type::init(conf_filename);

    _system_particle_count = this->_N;
	_thermostat->init(this->_N);

//    this->_lists->list_bonded(true);
    this->_lists->list_bonded(false);
    
	// get process id and size
	MPI_Comm_rank(MPI_COMM_WORLD, &this->_myid);
	MPI_Comm_size(MPI_COMM_WORLD, &this->_proc_size);

	// check if there are enough processes for the partitions
	int parts = _part_dims[0] * _part_dims[1] * _part_dims[2];
	if (parts > _proc_size)
		throw oxDNAException("Too many partitions '%d' with only '%d' processes.\n",
                             parts, _proc_size);
	else if (parts < _proc_size)
		OX_LOG(Logger::LOG_INFO, "Only using '%d' partitions with '%d' processes.\n",
               parts, _proc_size);
	
	OX_LOG(Logger::LOG_INFO, "Partitioning: x=%d y=%d z=%d\n",
           _part_dims[0], _part_dims[1], _part_dims[2]);

    Serialized_particle<number>::init_datatype();
    this->_serialized_particles = new Serialized_particle<number>[this->_N];
    this->_my_particles = new BaseParticle<number>*[this->_N];
    
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

    this->_part_radius = _part_size / (number)2;
    this->_part_center = _part_origin + _part_radius;
    
	// precompute set of neighbors
    std::unordered_set<int> nbr_set;
	for (int dx = -1; dx <= 1; dx++)
		for (int dy = -1; dy <= 1; dy++)
			for (int dz = -1; dz <= 1; dz++)
            {
                int n_id = this->get_neighbor_id(dx, dy, dz);
                if (n_id != _myid)
                    nbr_set.insert(n_id);
            }
    
    for (auto it = nbr_set.begin(); it != nbr_set.end(); ++it)
    {
        this->_neighbors.push_back(*it);
    }

	// find all particles in partition
	for (int i = 0; i < this->_N; i++)
    {
        int contains = this->partition_contains(this->_particles[i]);
		if (contains & PARTITION_MASK)
			_part_indices.insert(i);
        if (contains & BOUNDARY_MASK)
            _part_boundary.insert(i);
    }

	OX_LOG(Logger::LOG_INFO, "Process %d: %d Particles in partition\n", _myid, _part_indices.size());
//    update_particles();
    _compute_forces();

}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::get_settings (input_file &inp)
{
	BaseMDBackend<number, number4>::type::get_settings(inp);

    // todo: generalize
    _thermostat = ThermostatFactory::make_thermostat<number>(inp, this->_box_side);
	_thermostat->get_settings(inp);

	this->_part_dims[0] = 1;
	getInputInt(&inp, "partition_dim_x", &_part_dims[0], 0);
	if (this->_part_dims[0] <= 0) throw oxDNAException("Invalid partition x dimension '%d'\n", _part_dims[0]);

	this->_part_dims[1] = 1;
	getInputInt(&inp, "partition_dim_y", &_part_dims[1], 0);
	if (this->_part_dims[1] <= 0) throw oxDNAException("Invalid partition y dimension '%d'\n", _part_dims[1]);

	this->_part_dims[2] = 1;
	getInputInt(&inp, "partition_dim_z", &_part_dims[2], 0);
	if (this->_part_dims[2] <= 0) throw oxDNAException("Invalid partition z dimension '%d'\n", _part_dims[2]);
    
    // todo get as input
    this->_part_overlap = 4;
}

template <typename number, typename number4>
int MD_SP_MPIBackend<number, number4>::get_neighbor_id(int dx, int dy, int dz) const
{
	int xp = (_part_coords[0] + dx + _part_dims[0]) % _part_dims[0];
	int yp = (_part_coords[1] + dy + _part_dims[1]) % _part_dims[1];
	int zp = (_part_coords[2] + dz + _part_dims[2]) % _part_dims[2];

	return xp + (yp + (zp * _part_dims[1])) * _part_dims[0];
}

// TODO: handle case where particles can lie exactly on boundary
template <typename number, typename number4>
int MD_SP_MPIBackend<number, number4>::partition_contains(const BaseParticle<number> *p) const
{
    int contains = 0;

    LR_vector<number> r = p->pos;
    r.x = fmod(fmod(r.x, this->_box_side) + this->_box_side, this->_box_side);
    r.y = fmod(fmod(r.y, this->_box_side) + this->_box_side, this->_box_side);
    r.z = fmod(fmod(r.z, this->_box_side) + this->_box_side, this->_box_side);

    LR_vector<number> delta = r - _part_center;
    delta.x = fabs(delta.x);
    delta.y = fabs(delta.y);
    delta.z = fabs(delta.z);
    
    LR_vector<number> inv_delta = -delta;
    inv_delta.x += this->_box_side;
    inv_delta.y += this->_box_side;
    inv_delta.z += this->_box_side;

    if (min(delta.x, inv_delta.x) <= _part_radius.x and
        min(delta.y, inv_delta.y) <= _part_radius.y and
        min(delta.z, inv_delta.z) <= _part_radius.z)
    {
        contains |= PARTITION_MASK;
    }

    if (min(delta.x, inv_delta.x) <= _part_radius.x + _part_overlap and
        min(delta.y, inv_delta.y) <= _part_radius.y + _part_overlap and
        min(delta.z, inv_delta.z) <= _part_radius.z + _part_overlap)
    {
        if (min(delta.x, inv_delta.x) > _part_radius.x - _part_overlap or
            min(delta.y, inv_delta.y) > _part_radius.y - _part_overlap or
            min(delta.z, inv_delta.z) > _part_radius.z - _part_overlap)
        {
            contains |= BOUNDARY_MASK;
        }
    }
    
    return contains;
}


template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::update_partition()
{
    std::unordered_set<int> to_send;
	int index;

    _part_boundary.clear();

  	auto it = this->_part_indices.begin();
	while (it != this->_part_indices.end())
	{
		index = *it;
		BaseParticle<number> *p = this->_particles[index];

        int contains = this->partition_contains(p);

        // particles that belonged to this partition that left the partition
		if ((contains & PARTITION_MASK) == 0)
		{
            it = this->_part_indices.erase(it);
            to_send.insert(index);
            _part_boundary.insert(index);
        }
        else // particles in the boundary
        {
            if ((contains & BOUNDARY_MASK) != 0)
                to_send.insert(index);
            _part_boundary.insert(index);

            ++it;
        }
	}
  
	// serialize all of the 'to send' particles so that they can be sent to neighbors
	int i = 0;
    this->_serialized_particle_count = to_send.size();
	for (auto it2 = to_send.begin(); it2 != to_send.end(); ++it2)
	{
		BaseParticle<number> *p = this->_particles[*it2];
		this->_serialized_particles[i++].read(p);
	}
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::update_particles()
{
    int i = 0;
    for (auto it = _part_indices.begin(); it != _part_indices.end(); ++it)
    {
        BaseParticle<number> *p = this->_particles[*it];
        _my_particles[i++] = p;
    }

    _no_boundary_count = i;

    for (auto it = _part_boundary.begin(); it != _part_boundary.end(); ++it)
    {
        BaseParticle<number> *p = this->_particles[*it];
        int contains = partition_contains(p);
        
        if ((contains & PARTITION_MASK) == 0)
            _my_particles[i++] = p;
    }

    _total_count = i;
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::sim_step(llint curr_step)
{
	get_time(&this->_timer, 0);

    get_time(&this->_timer, 2);
    _first_step(curr_step);
    get_time(&this->_timer, 3);

    get_time(&this->_timer, 4);
    this->update_partition();
    this->exchange_serialized_particles();
    if ((curr_step + 1) % 1000 == 0) gather_serialized_particles();
    this->update_particles();
    get_time(&this->_timer, 5);

    get_time(&this->_timer, 6);
    if (!this->_lists->is_updated())
    {
        this->_lists->global_update();
        this->_N_updates++;
    }
    get_time(&this->_timer, 7);

    get_time(&this->_timer, 8);
    _compute_forces();
    _second_step();
    get_time(&this->_timer, 9);

    get_time(&this->_timer, 10);
    _thermostat->set_N(_no_boundary_count);
    _thermostat->apply(_my_particles, curr_step);
    get_time(&this->_timer, 11);

	get_time(&this->_timer, 1);
	process_times(&this->_timer);
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::_first_step(llint cur_step)
{
	bool is_warning = false;
	std::vector<int> w_ps;
    for (auto p_it = this->_part_indices.begin(); p_it != this->_part_indices.end(); ++p_it)
    {
		BaseParticle<number> *p = this->_particles[*p_it];

		p->vel += p->force * this->_dt * (number) 0.5;
		LR_vector<number> dr = p->vel * this->_dt;
		if(dr.norm() > 0.01) {
			is_warning = true;
			w_ps.push_back(p->index);
		}
		p->pos += dr;

		if(p->is_rigid_body()) {
			p->L += p->torque * this->_dt * (number) 0.5;
			// update of the orientation
			number norm = p->L.module();
			LR_vector<number> LVersor(p->L / norm);

			number sintheta = sin(this->_dt * norm);
			number costheta = cos(this->_dt * norm);
			number olcos = 1. - costheta;

			number xyo = LVersor[0] * LVersor[1] * olcos;
			number xzo = LVersor[0] * LVersor[2] * olcos;
			number yzo = LVersor[1] * LVersor[2] * olcos;
			number xsin = LVersor[0] * sintheta;
			number ysin = LVersor[1] * sintheta;
			number zsin = LVersor[2] * sintheta;

			LR_matrix<number> R(LVersor[0] * LVersor[0] * olcos + costheta, xyo - zsin, xzo + ysin,
                                xyo + zsin, LVersor[1] * LVersor[1] * olcos + costheta, yzo - xsin,
                                xzo - ysin, yzo + xsin, LVersor[2] * LVersor[2] * olcos + costheta);

			p->orientation = p->orientation * R;
			// set back, base and stack positions
			p->set_positions();
			p->orientationT = p->orientation.get_transpose();
			p->torque = LR_vector<number>((number) 0, (number) 0, (number) 0);
		}

		p->set_initial_forces(cur_step, this->_box_side);

		this->_lists->single_update(p);
	}

	if(is_warning) {
		std::stringstream ss;
		for(vector<int>::iterator it = w_ps.begin(); it != w_ps.end(); it++) ss << *it << " ";
		OX_LOG(Logger::LOG_WARNING, "The following particles had a displacement greater than one in this step: %s", ss.str().c_str());
	}
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::_compute_forces()
{
	this->_U = this->_U_hydr = (number) 0;

    for (auto p_it = this->_part_indices.begin(); p_it != this->_part_indices.end(); ++p_it)
    {

		BaseParticle<number> *p = this->_particles[*p_it];
        this->_U += this->_interaction->pair_interaction_bonded(p, P_VIRTUAL, NULL, true);

        std::vector<BaseParticle<number> *> neighs = this->_lists->get_neigh_list(p);
		for(unsigned int n = 0; n < neighs.size(); n++) {
			BaseParticle<number> *q = neighs[n];
            if (this->_part_indices.find(q->index) == this->_part_indices.end() and
                this->_part_boundary.find(q->index) == this->_part_boundary.end())
                continue;

            this->_U += this->_interaction->pair_interaction_nonbonded(p, q, NULL, true);
		}
    }
    
    for (auto p_it = this->_part_boundary.begin(); p_it != this->_part_boundary.end(); ++p_it)
    {
		BaseParticle<number> *p = this->_particles[*p_it];
        if (this->_part_indices.find(p->index) != this->_part_indices.end())
            continue;

        BaseParticle<number> *r = p->n3;
        if (r != P_VIRTUAL and this->_part_indices.find(r->index) != this->_part_indices.end())
            this->_U += this->_interaction->pair_interaction_bonded(p, P_VIRTUAL, NULL, true);

        std::vector<BaseParticle<number> *> neighs = this->_lists->get_neigh_list(p);
		for(unsigned int n = 0; n < neighs.size(); n++) {
			BaseParticle<number> *q = neighs[n];
            if (this->_part_indices.find(q->index) == this->_part_indices.end())
                continue;

            this->_U += this->_interaction->pair_interaction_nonbonded(p, q, NULL, true);
		}
    }
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::_second_step()
{
	this->_K = (number) 0.f;
    for (auto it = this->_part_indices.begin(); it != this->_part_indices.end(); ++it)
    {
		BaseParticle<number> *p = this->_particles[*it];
p
		p->vel += p->force * this->_dt * (number) 0.5f;
		if(p->is_rigid_body()) p->L += p->torque * this->_dt * (number) 0.5f;

		this->_K += (p->vel.norm() + p->L.norm()) * (number) 0.5f;
	}
}

template<typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::print_conf(llint curr_step, bool reduced, bool only_last) {
    if (_myid != 0)
    {
        return;
    }
    
	if(reduced) {
		char conf_name[512];
		sprintf(conf_name, "%s/reduced_conf%lld.dat", this->_reduced_conf_output_dir, curr_step);
		this->_obs_output_reduced_conf->change_output_file(conf_name);
		this->_obs_output_reduced_conf->print_output(curr_step);
	}
	else {
		if(!only_last) this->_obs_output_trajectory->print_output(curr_step);
		this->_obs_output_last_conf->print_output(curr_step);
		if(this->_obs_output_last_conf_bin != NULL)
            this->_obs_output_last_conf_bin->print_output(curr_step);
	}
}

template <typename number, typename number4>
void MD_SP_MPIBackend<number, number4>::print_observables(llint curr_step)
{
    if (_myid == 0)
        BaseMDBackend<number, number4>::type::print_observables(curr_step);
}

#ifndef NOCUDA
template class MD_SP_MPIBackend<float, float4>;
template class MD_SP_MPIBackend<double, LR_double4>;
#endif

template class MD_SP_MPIBackend<float, float>;
template class MD_SP_MPIBackend<double, double>;

