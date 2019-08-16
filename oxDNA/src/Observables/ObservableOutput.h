/*
 * ObservableOutput.h
 *
 *  Created on: Feb 11, 2013
 *      Author: rovigatti
 */

#ifndef OBSERVABLEOUTPUT_H_
#define OBSERVABLEOUTPUT_H_

#include <vector>
#include <fstream>

#include "BaseObservable.h"

/**
 * @brief Manages a single output stream.
 *
 * Instances of this class manage all the output streams associated to the simulation or to the analysis.
 * It stores a list of observables (derived from BaseObservable), whose results are then computed and printed
 * periodically. The constructor requires a string containing all the key=values associated to the instance.
 * The supported syntax is (optional values are between [])
 * @verbatim
name = <string> (name of the output stream. stdout or stderr are accepted values)
print_every = <integer> (frequency of output, in number steps for oxDNA, in number of configurations for DNAnalysis)
[start_from = <integer> (start outputing from the given step, defaults to 0)]
[stop_at = <integer> (stop outputing at this step, defaults to -1 (which means never))]
[only_last = <bool> (if true, the output will not be appended to the stream, but it will overwrite the previous output each time, defaults to false)]
[binary = <bool> (if true, the output will be printed in binary, defaults to false)]
col_<n> = {\ntype = name of the first observable\n[other observable options as lines of 'key = value']\n} (this syntax specifies the column of the output file. Note that <n> is the column index and should start from 1)
@endverbatim
 * You can have as many observables (columns) as you want. You can put them in any order, but there has to be a col_1 key.
 * In addition, in order to have, e.g., a col_4, you have to also have col_1, col_2 and col_3.
 *
 * SimBackend stores a list of {@link ObservableOutput ObservableOutputs}. For oxDNA, there are two default
 * streams: one writes to stdout, the other one writes to the energy file. For both oxDNA and DNAnalysis,
 * you can add custom streams by adding them to the input file as options or as command line arguments.
 * For oxDNA, streams can be specified with 'data_output_\<n\>' keys, whereas for DNAnalysis, streams can be specified
 * with 'analysis_data_output_\<n\>' keys. In both cases, \<n\> is an integer starting from 1.
 */
template<typename number>
class ObservableOutput {
protected:
	std::vector<BaseObservable<number> *> _obss;
	std::ofstream _output_stream;
	std::ostream *_output;
	llint _print_every;
	bool _is_binary;
	int _append;
	int _only_last;
	llint _start_from;
	llint _stop_at;
	std::string _prefix;
	char _output_name[512];
	input_file _sim_inp;

	void _open_output();

public:
	/**
	 * @brief Constructor. The two arguments are mandatory (i.e. there are no other constructors in this class)
	 *
	 * @param stream_string a string containing all the key=values lines related to the object and to its associated observables
	 * @param sim_inp simulation input file
	 */
	ObservableOutput(std::string &stream_string, input_file &sim_inp);
	virtual ~ObservableOutput();

	/**
	 * @brief Initialize the object
	 * @param config_info an instance of {@link ConfigInfo} containing all the values stored in the backend which may be required by the observables
	 */
	void init(ConfigInfo<number> &config_info);

	/**
	 * @brief Adds the observable defined by obs_string to the list
	 *
	 * The observable will be appended to the observable list. The output order will reflect the order with which
	 * observable have been added to the list.
	 * @param obs_string A string containing the definition of the observable. The accepted syntax is
	 * type = observable name
	 * [additional, observable-dependent options as lines of 'key = value']
	 */
	void add_observable(std::string obs_string);

	/**
	 * @brief Prints out the output generated by the stored observables
	 * @param step simulation step
	 */
	void print_output(llint step);

	/**
	 * @brief Changes the output stream. It only supports files (and not other kind of streams such as stdout or stderr)
	 *
	 * @param new_filename
	 */
	void change_output_file(std::string new_filename);

	/**
	 * @brief Checks whether the object is ready to print, and returns the result
	 * @param step simulation step
	 * @return true if the object is ready to print, false otherwise
	 */
	bool is_ready(llint step);
};

#endif /* OBSERVABLEOUTPUT_H_ */
