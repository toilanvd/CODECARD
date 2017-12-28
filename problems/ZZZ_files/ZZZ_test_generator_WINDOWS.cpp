#include <bits/stdc++.h>

using namespace std;

void generate_test(FILE* input){
    int test = rand()%20 + 1; fprintf(input,"%d\n",test);
    while(test--){
        int n = rand()%8 + 1; fprintf(input,"%d\n",n);
        for(int i=1;i<=n;i++){
            for(int j=1;j<=n;j++){
                int x = rand()%1001, y = (rand()%2 == 0) ? 1 : -1;
                fprintf(input,"%d ",x*y);
            }
            fprintf(input,"\n");
        }
    }
}

int main(){
    srand(time(NULL));

    char problem[50]; printf("PROBLEM NAME: "); scanf("%s", problem);
    int test_num; printf("TEST NUM: "); scanf("%d", &test_num);

    char buf[100];

    sprintf(buf,"mkdir %s",problem);
    system(buf);

    sprintf(buf,"g++ %s.cpp -o %s.exe",problem,problem);
    system(buf);

    for(int test=1;test<=test_num;test++){
        sprintf(buf,"%s\\%d.in",problem,test);
        FILE* input = fopen(buf,"w");

        generate_test(input);

        fclose(input);

        sprintf(buf,"%s.exe < %s\\%d.in > %s\\%d.out",problem,problem,test,problem,test);
        system(buf);
    }

    sprintf(buf,"del %s.exe",problem);
    system(buf);

    return 0;
}
