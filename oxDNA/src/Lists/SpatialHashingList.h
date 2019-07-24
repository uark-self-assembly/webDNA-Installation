/*
SPATIAL HASH MAP HEADER FILE

Name = Aditya Dendukuri 
Institution = University of Arkansas

theoretically bounded complexity:
      Building hash map = O(n)
      Retrieving neighbor list = O(1)
*/

#ifndef SPATIALHASH_H_
#define SPATIALHASH_H_

#include "BaseList.h"
#include <cfloat>

template<typename number>
class SpatialHash: public BaseList<number> {
protected:
	std::vector<std::vector<BaseParticle<number> *> > _lists;
	std::vector<LR_vector<number> > _list_poss;
	number _skin;
	number _sqr_skin;
	bool _updated;
	number _sqr_rcut;
      std::vector<BaseParticle<number>*> *hash_table;	
      int num_hash_cells; 

public:
	SpatialHash(int &N, BaseBox<number> *box);
	virtual ~SpatialHash();

	//virtual void get_settings(input_file &inp);
	virtual void init(BaseParticle<number> **particles, number rcut);

	virtual bool is_updated();
	virtual void single_update(BaseParticle<number> *p);
	virtual void global_update(bool force_update = false);
	virtual std::vector<BaseParticle<number> *> get_neigh_list(BaseParticle<number> *p);
	virtual std::vector<BaseParticle<number> *> get_complete_neigh_list(BaseParticle<number> *p);
      int hash_function(BaseParticle<number> *p);
	void update_hash_table();

	//virtual void change_box();
};



#endif
