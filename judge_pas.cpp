#include <cstdio>
#include <iostream>
#include <cstdlib>
#include <string>
#include <cstring>
#include <cstddef>
#include <vector>

using namespace std;

const double eps = 0.000000001;

string forbid_cmd[] = {"Assign", "Reset", "Rewrite", "Close", "Open", "open", "close", "assign",
                       "Fork", "fork", "Exec", "exec", "Wait", "wait", "Delay", "delay",
                       "Sleep", "sleep", "Signal", "signal", "Pipe", "pipe",
                       "Socket", "socket", "Listen", "listen", "Connect", "connect",
                       "Bind", "bind", "Dll", "dll", "Accept", "accept", "Sync", "sync",
                       "Parallel", "parallel", "Sys", "sys", "Kill", "kill", "Process", "process",
                       "Run", "run", "Command", "command", "-1"};

int main(int argc, char* argv[]){

    char* problem_name = argv[1];
    char* filename = argv[2];
    char buf[505], content[505];

    // Initial result files
    sprintf(buf, "logs/%s.judge.txt", filename);
    FILE* judge = fopen(buf, "w"); // judge result file
    sprintf(buf, "logs/%s.result.txt", filename);
    FILE* result = fopen(buf, "w");
    sprintf(buf, "logs/%s.running_time.txt", filename);
    FILE* running_time_file = fopen(buf, "w");

    // Read compile option
    sprintf(buf, "problems/%s/compile_option.txt", problem_name);
    FILE* compile_option_file = fopen(buf,"r");
    string compile_command = "";
    compile_command += "fpc ";

//    char compile_option[505]; int cnt = 0;
    while(fscanf(compile_option_file, "%s", content)!=EOF){
        for(int i=0;i<strlen(content);i++){
//            compile_option[cnt] = content[i];
//            cnt++;
            compile_command += content[i];
        }
        compile_command += " ";
//        compile_option[cnt] = ' '; cnt++;
    }
    sprintf(buf, "code/%s.pas > logs/%s.error.txt", filename, filename);
    for(int i=0;i<strlen(buf);i++){
//            compile_option[cnt] = content[i];
//            cnt++;
        compile_command += buf[i];
    }
    system(compile_command.c_str());
    sprintf(buf, "mv code/%s logs/%s", filename, filename);
    system(buf);
    sprintf(buf, "rm code/%s.o", filename);
    system(buf);
    fclose(compile_option_file);

    // Check compilation error
    sprintf(buf, "logs/%s.error.txt", filename);
    FILE* compile_result = fopen(buf, "r");
    bool compile_error = false;
    while(fgets(content, 500, compile_result)!=NULL){
        for(int i=0;i<=(int)strlen(content)-6;i++)
            if(content[i]=='E' && content[i+1]=='r' && content[i+2]=='r' && content[i+3]=='o' && content[i+4]=='r' && content[i+5]==':')
                compile_error = true;
        fprintf(judge, "%s", content);
        printf("%s", content);
    }
    fclose(compile_result);
    if(compile_error){
        fprintf(judge, "Compilation error\n"); fclose(judge);
        printf("Compilation error\n");
        fprintf(result, "0\n"); fclose(result);
        fprintf(running_time_file, "0.00\n"); fclose(running_time_file);
        return 0;
    }

    // Check code violation
    sprintf(buf, "cp code/%s.pas logs/%s.assembly.txt", filename, filename);
    system(buf);
    sprintf(buf, "logs/%s.assembly.txt", filename);
    FILE* assembly_file = fopen(buf, "r");
    bool code_violation = false;
    int line_of_code = 0;
    while(fgets(content, 500, assembly_file)!=NULL){
        line_of_code++;
        for(int i=0;i<(int)strlen(content);i++){
            for(int j=0;;j++){
                if(strcmp(forbid_cmd[j].c_str(),"-1")==0) break;
                if(i+forbid_cmd[j].length()-1 >= strlen(content)) continue;
                bool different = false;
                for(int k=i;k<=i+forbid_cmd[j].length()-1;k++){
                    if(content[k]!=forbid_cmd[j][k-i]){
                        different = true;
                        break;
                    }
                }
                if(!different){
                    code_violation = true;
                    fprintf(judge, "Line %d: violation: Please remove '%s' function\n", line_of_code, forbid_cmd[j].c_str());
                    printf("Line %d: violation: Please remove '%s' function\n", line_of_code, forbid_cmd[j].c_str());
                    break;
                }
            }
            if(code_violation) break;
        }
        if(code_violation) break;
    }
    fclose(assembly_file);

    if(code_violation){
        fprintf(judge, "Judgement denied!\n"); fclose(judge);
        printf("Judgement denied!\n");
        fprintf(result, "0\n"); fclose(result);
        fprintf(running_time_file, "0.00\n"); fclose(running_time_file);
        return 0;
    }

    // Read number of test cases
    int test;
    sprintf(buf, "problems/%s/test_num.txt", problem_name);
    FILE* test_num = fopen(buf, "r"); fscanf(test_num, "%d", &test); fclose(test_num);

    // Read time limit file
    sprintf(buf, "problems/%s/time_limit.txt", problem_name);
    FILE* time_limit_file = fopen(buf, "r");
    char time_limit[15]; fscanf(time_limit_file, "%s", time_limit); fclose(time_limit_file);

    // Read memory limit file
    sprintf(buf, "problems/%s/memory_limit.txt", problem_name);
    FILE* memory_limit_file = fopen(buf, "r");
    int memory_limit; fscanf(memory_limit_file, "%d", &memory_limit); fclose(memory_limit_file);

    // Compile checker
    sprintf(buf, "g++ problems/%s/checker.cpp -o problems/%s/checker", problem_name, problem_name);
    system(buf);

    // Grading
    int correct_answers = 0;
    double maxi_running_time = 0.0;
    for(int t=1;t<=test;t++){
        fprintf(judge, "TEST %d: ", t); printf("TEST %d: ", t);

        // Run user's program
        sprintf(buf, "rm logs/%s.time.txt", filename);
        system(buf);
        sprintf(buf, "{ timeout %s ./logs/%s < problems/%s/%d.in > logs/%s.%d.ans && echo finished > logs/%s.time.txt; } 2> logs/%s.error.txt", time_limit, filename, problem_name, t, filename, t, filename, filename);
        system(buf); //printf("%s\n", buf);

        // Check for runtime error
        sprintf(buf, "logs/%s.error.txt", filename);
        FILE* runtime_result = fopen(buf, "r");
        bool runtime_err = false;
        while(fgets(content, 500, runtime_result)!=NULL){
            runtime_err = true;
            fprintf(judge, "%s", content);
            printf("%s", content);
        }
        fclose(runtime_result);
        if(runtime_err){
            fprintf(judge, "Runtime error\n");
            printf("Runtime error\n");
            continue;
        }

        // Check for time limit exceeded
        sprintf(buf, "logs/%s.time.txt", filename);
        FILE* time_result = fopen(buf, "r");
        if(time_result == NULL){
            fprintf(judge, "Time limit exceeded\n");
            printf("Time limit exceeded\n");
            continue;
        }
        fclose(time_result);

        // Check for memory limit exceeded
        sprintf(buf, "/usr/bin/time -v ./logs/%s < problems/%s/%d.in > logs/%s.%d.ans 2> logs/%s.time.txt", filename, problem_name, t, filename, t, filename);
        system(buf);
        int memory_used = 0;
        double integer = 0.0, decimal = 0.0; int dec_cnt = 0; bool have_decimal = false;
        sprintf(buf, "logs/%s.time.txt", filename);
        FILE* info = fopen(buf, "r");
        while(fgets(content, 500, info)!=NULL){
            if(content[1]=='U' && content[2]=='s')
                for(int i=22;i<=(int)strlen(content)-2;i++){
                    if(content[i]=='.') have_decimal = true;
                    else if(!have_decimal) integer = integer*10.0 + (content[i]-'0');
                    else{
                        decimal = decimal*10.0+(content[i]-'0');
                        dec_cnt++;
                    }
                }

            else if(content[1]=='M' && content[2]=='a' && content[3]=='x'){
                for(int i=37;i<=strlen(content)-2;i++) memory_used = memory_used*10 + (content[i]-'0');
                memory_used = (memory_used-1)/(1 << 10) + 1; // memory used in Mb
            }
        }
        fclose(info);

        if(memory_used > memory_limit){
            fprintf(judge, "Memory limit exceeded\n");
            printf("Memory limit exceeded\n");
            continue;
        }

        // Run checker
        sprintf(buf, "./problems/%s/checker problems/%s/%d.out logs/%s.%d.ans logs/%s.%d.log problems/%s/%d.in", problem_name, problem_name, t, filename, t, filename, t, problem_name, t);
        system(buf);

        // Analyse result
        while(dec_cnt>0) {decimal = decimal/10.0; dec_cnt--;}
        double test_running_time = integer + decimal;

        fprintf(judge, "%.2lf seconds, %d MB used\n", test_running_time, memory_used);
        printf("%.2lf seconds, %d MB used\n", test_running_time, memory_used);

        sprintf(buf, "logs/%s.%d.log", filename, t);
        FILE* log = fopen(buf, "r");
        bool identical = false;
        while(fscanf(log, "%s", content)!=EOF){
            if(strcmp(content,"identical")==0){
                identical = true; break;
            }
        }
        if(identical){
            correct_answers++;
            fprintf(judge, "Correct!\n");
            printf("Correct!\n");

            maxi_running_time = max(maxi_running_time, test_running_time);
        }
        else{
            fprintf(judge, "Wrong answer\n");
            printf("Wrong answer\n");
        }
        fclose(log);
    }
    fprintf(judge, "RESULT: %d/%d\n", correct_answers, test);
    printf("RESULT: %d/%d\n", correct_answers, test);
    fclose(judge);
    // Write grade (points achieved) to result file
    fprintf(result, "%d\n", (int)(100.0*(double)correct_answers/(double)test+0.000000001));
    fclose(result);
    fprintf(running_time_file, "%.2lf\n", maxi_running_time);
    fclose(running_time_file);

    return 0;
}
