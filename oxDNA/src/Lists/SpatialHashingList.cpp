#include "SpatialHashingList.h"
#include "BaseList.h"

typedef unsigned int uint;

bool iprime(int n);
int gprime(int x);

const int cell_size = 10;
const float smoothing_length = 0.1;

template<typename number>
SpatialHash<number>::SpatialHash(int &N, BaseBox<number> *box) : BaseList<number>(N, box), _updated(false) {
}

template<typename number>
bool SpatialHash<number>::is_updated() {
	return this->_updated;
}

template<typename number>
SpatialHash<number>::~SpatialHash() {
}

template<typename number>
void SpatialHash<number>::init(BaseParticle<number> **particles, number rcut) {
	rcut += 2*_skin;
	BaseList<number>::init(particles, rcut);
	this->num_hash_cells = gprime(2*this->_N)-1;
      std::cout << this->num_hash_cells << std::endl;
	this->hash_table = (std::vector<BaseParticle<number>*>*)malloc(sizeof(std::vector<BaseParticle<number>*>)*this->num_hash_cells);
	global_update();
}

template<typename number>
void SpatialHash<number>::single_update(BaseParticle<number> *p)
{
}

template<typename number>
void SpatialHash<number>::global_update(bool force_update)
{
      this->update_hash_table();
}

template<typename number>
std::vector<BaseParticle<number> *> SpatialHash<number>::get_neigh_list(BaseParticle<number> *p)
{
      uint hash = hash_function(p);
	std::vector<BaseParticle<number>* > new_table; 
      if((hash > num_hash_cells-1)||(hash < 0))
      {
            new_table.push_back(p);
            return new_table; 
      }
      float x,y,z;
	for(int i = 0; i < hash_table[hash].size(); i++)
	{
            x = p->pos.x - hash_table[hash][i]->pos.x;
            y = p->pos.y - hash_table[hash][i]->pos.y;
            z = p->pos.z - hash_table[hash][i]->pos.z;
		// only take in neighbours np->index < p->index 
		if((hash_table[hash][i]->index < p->index)&&((sqrt(x*x + y*y + z*z) < smoothing_length)))
		{
			new_table.push_back(hash_table[hash][i]);
		}
	}
	return new_table; 
}

template<typename number>
std::vector<BaseParticle<number>*> SpatialHash<number>::get_complete_neigh_list(BaseParticle<number> *p)
{
      uint hash = hash_function(p);
	std::vector<BaseParticle<number>* > new_table;
      if((hash > num_hash_cells-1)||(hash < 0))
      {
            new_table.push_back(p);
            return new_table; 
      }
      float x,y,z;
	for(int i = 0; i < hash_table[hash].size(); i++)
	{
            //calculate distance between the points (if lesser, done add in neighbor list)
            x = p->pos.x - hash_table[hash][i]->pos.x;
            y = p->pos.y - hash_table[hash][i]->pos.y;
            z = p->pos.z - hash_table[hash][i]->pos.z;
		// only take in neighbours less than the cutoff distance
		if(sqrt(x*x + y*y + z*z) < smoothing_length)
		{
			new_table.push_back(hash_table[hash][i]);
		}
	}
	return new_table; 
}

template<typename number>
int SpatialHash<number>::hash_function(BaseParticle<number> *p)
{
      //step 1 discretsize the 3d point to its cell
      int x = int(floor(p->pos.x) / cell_size);
      int y = int(floor(p->pos.y) / cell_size);
      int z = int(floor(p->pos.z) / cell_size);
      //step 2 calculate hash for x, y, z coordinates
      int hash_x = x * 73856093;  
	int hash_y = y * 19349663;  
	int hash_z = z * 83492791;  
      //combine the 3d hash to generate a hash key ('^' represents 'bitwise xor' operation)
	return (hash_x ^ hash_y ^ hash_z)%this->num_hash_cells;
}

template<typename number>
void SpatialHash<number>::update_hash_table()
{
      BaseParticle<number> *p;
	unsigned int hash;
      //reset hash map to empty
	for(uint i=0; i<num_hash_cells; i++)
	{
		hash_table[i].clear();
	}
      //repopulate the hash map 
	for(int i = 0; i < this->_N; i++) 
	{
		p = this->_particles[i];
		hash=hash_function(p);
		if((hash < 0)||(hash > num_hash_cells-1))
		{
			continue;
		}
		hash_table[hash].push_back(p);
	}
}


template class SpatialHash<float>;
template class SpatialHash<double>;



bool iprime(int n) // assuming n > 1
{
    int i, root;

    if (n%2 == 0 || n%3 == 0)
        return false;

    root = (int)sqrt((double)n);

    for (i=5; i<=root; i+=6)
    { 
        if (n%i == 0)
           return false;
    }

    for (i=7; i<=root; i+=6)
    {
        if (n%i == 0)
           return false;
    }

    return true;
}

int gprime(int x)
{
    bool prime = false;
    if(iprime(x))
        return x;
    
    while(!prime)
    {
        prime = iprime(x);
        x++;
    }
    return x;
}
