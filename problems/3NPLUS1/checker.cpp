#include <cstdio>
#include <string>
#include <iostream>
#include <cstring>
#include <cstdlib>
#include <cstddef>

using namespace std;



int main(int argc, char* argv[]){
    char buf[505]; sprintf(buf, "diff -b -B -s -q %s %s > %s", argv[1], argv[2], argv[3]);
    //printf("%s\n", buf);
    system(buf);


    return 0;
}
