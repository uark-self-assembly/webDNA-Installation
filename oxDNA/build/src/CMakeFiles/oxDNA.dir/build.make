# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.13

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /home/austin/WebDNA/oxDNA

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /home/austin/WebDNA/oxDNA/build

# Include any dependencies generated for this target.
include src/CMakeFiles/oxDNA.dir/depend.make

# Include the progress variables for this target.
include src/CMakeFiles/oxDNA.dir/progress.make

# Include the compile flags for this target's objects.
include src/CMakeFiles/oxDNA.dir/flags.make

src/CMakeFiles/oxDNA.dir/oxDNA.cpp.o: src/CMakeFiles/oxDNA.dir/flags.make
src/CMakeFiles/oxDNA.dir/oxDNA.cpp.o: ../src/oxDNA.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/austin/WebDNA/oxDNA/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object src/CMakeFiles/oxDNA.dir/oxDNA.cpp.o"
	cd /home/austin/WebDNA/oxDNA/build/src && /usr/bin/g++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/oxDNA.dir/oxDNA.cpp.o -c /home/austin/WebDNA/oxDNA/src/oxDNA.cpp

src/CMakeFiles/oxDNA.dir/oxDNA.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/oxDNA.dir/oxDNA.cpp.i"
	cd /home/austin/WebDNA/oxDNA/build/src && /usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/austin/WebDNA/oxDNA/src/oxDNA.cpp > CMakeFiles/oxDNA.dir/oxDNA.cpp.i

src/CMakeFiles/oxDNA.dir/oxDNA.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/oxDNA.dir/oxDNA.cpp.s"
	cd /home/austin/WebDNA/oxDNA/build/src && /usr/bin/g++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/austin/WebDNA/oxDNA/src/oxDNA.cpp -o CMakeFiles/oxDNA.dir/oxDNA.cpp.s

# Object files for target oxDNA
oxDNA_OBJECTS = \
"CMakeFiles/oxDNA.dir/oxDNA.cpp.o"

# External object files for target oxDNA
oxDNA_EXTERNAL_OBJECTS =

bin/oxDNA: src/CMakeFiles/oxDNA.dir/oxDNA.cpp.o
bin/oxDNA: src/CMakeFiles/oxDNA.dir/build.make
bin/oxDNA: src/libcommon.a
bin/oxDNA: src/CMakeFiles/oxDNA.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/home/austin/WebDNA/oxDNA/build/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable ../bin/oxDNA"
	cd /home/austin/WebDNA/oxDNA/build/src && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/oxDNA.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
src/CMakeFiles/oxDNA.dir/build: bin/oxDNA

.PHONY : src/CMakeFiles/oxDNA.dir/build

src/CMakeFiles/oxDNA.dir/clean:
	cd /home/austin/WebDNA/oxDNA/build/src && $(CMAKE_COMMAND) -P CMakeFiles/oxDNA.dir/cmake_clean.cmake
.PHONY : src/CMakeFiles/oxDNA.dir/clean

src/CMakeFiles/oxDNA.dir/depend:
	cd /home/austin/WebDNA/oxDNA/build && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /home/austin/WebDNA/oxDNA /home/austin/WebDNA/oxDNA/src /home/austin/WebDNA/oxDNA/build /home/austin/WebDNA/oxDNA/build/src /home/austin/WebDNA/oxDNA/build/src/CMakeFiles/oxDNA.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : src/CMakeFiles/oxDNA.dir/depend

