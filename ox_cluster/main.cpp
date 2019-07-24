#include <mpi.h>
#include <sstream>
#include <stdlib.h>

using namespace std;

int main(int argc, char** argv) {

	int my_rank;
	int comm_sz;

	MPI_Init(&argc, &argv);
	MPI_Comm_rank(MPI_COMM_WORLD, &my_rank);
	MPI_Comm_size(MPI_COMM_WORLD, &comm_sz);

	MPI_Barrier(MPI_COMM_WORLD);

	string my_rank_str = static_cast<ostringstream*>( &(ostringstream() << my_rank) )->str();

	string enclosing_dir = argv[1];

	string ox_DNA_BIN = "../oxDNA/build/bin/oxDNA";

    string is_nb_sim = argv[2];

	if (my_rank == 0) {
		string mkdir = "mkdir";
        mkdir += " ";
		mkdir += enclosing_dir;
		system(mkdir.c_str());
	}

	MPI_Barrier(MPI_COMM_WORLD);

	string command = "./run_ox.py";

	command += " ";
	command += my_rank_str;
	command += " ";
	command += enclosing_dir;
	command += " ";
	command += ox_DNA_BIN;
	command += " ";
    command += is_nb_sim;

	system(command.c_str());

	MPI_Barrier(MPI_COMM_WORLD);

	MPI_Finalize();
}
