#include <bits/stdc++.h>

using namespace std;

void generate_test(FILE* input){
    int test = rand()%100 + 1;
    while(test--) fprintf(input,"%d\n",rand()%1500+1);
    fprintf(input,"0\n");
}

int main(){
    srand(time(NULL));

    char problem[50]; printf("PROBLEM NAME: "); scanf("%s", problem);
    int test_num; printf("TEST NUM: "); scanf("%d", &test_num);

    char buf[100];

    sprintf(buf,"rm -rf %s",problem);
    system(buf);

    sprintf(buf,"g++ %s.cpp -o %s",problem,problem);
    system(buf);

    for(int test=1;test<=test_num;test++){
        sprintf(buf,"%d.in",test);
        FILE* input = fopen(buf,"w");

        generate_test(input);

        fclose(input);

        sprintf(buf,"./%s < %d.in > %d.out",problem,test,test);
        system(buf);
    }

    sprintf(buf,"rm %s",problem);
    system(buf);

    sprintf(buf,"mkdir %s",problem);
    system(buf);

    for(int test=1;test<=test_num;test++){
        sprintf(buf,"mv %d.in %s/%d.in",test,problem,test);
        system(buf);

        sprintf(buf,"mv %d.out %s/%d.out",test,problem,test);
        system(buf);
    }

    return 0;
}
