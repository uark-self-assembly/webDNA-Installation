/*
 * ListFactory.cpp
 *
 *  Created on: 05/nov/2013
 *      Author: lorenzo
 */

#include "ListFactory.h"

#include "NoList.h"
#include "Cells.h"
#include "VerletList.h"

ListFactory::ListFactory() {

}

ListFactory::~ListFactory() {

}

template<typename number>
BaseList<number> *ListFactory::make_list(input_file &inp, int &N, number &box) {
	// the default list is verlet
	char list_type[512] = "verlet";
	getInputString(&inp, "list_type", list_type, 0);

	if(!strncmp(list_type, "verlet", 512)) return new VerletList<number>(N, box);
	else if(!strncmp(list_type, "no", 512)) return new NoList<number>(N, box);
	else if(!strncmp(list_type, "cells", 512)) return new Cells<number>(N, box);
//    else if(!strncmp(list_type, "spacial_hash", 512)) return new SpacialHashingList<number>(N, box);
	else throw oxDNAException("Invalid list '%s'", list_type);
}

template BaseList<float> *ListFactory::make_list(input_file &inp, int &N, float &box);
template BaseList<double> *ListFactory::make_list(input_file &inp, int &N, double &box);
