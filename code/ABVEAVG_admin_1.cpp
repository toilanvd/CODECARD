#include<stdio.h>
int main()
{
      int cases,student,i,j,count;
      int grade[1000];
      float sum=0;
      
      while(scanf("%d\n",&cases)==1)
      {
      for(i=0;i<cases;i++)
      {                         
                                sum=0;
                                count=0   ;            
      scanf("%d\n",&student);
      if(student>1000) break;
      for(j=1;j<=student;j++)
      {scanf("%d",&grade[j]);
      if(grade[j]>100) goto foo;
      sum=sum+grade[j];}
      sum=sum/student;
      
      for(j=1;j<=student;j++)
      {
      if(grade[j]>sum) count++;}


printf("%.3f%%\n",(float)count/student*100);
                             foo:;
                             }
                             }
                             }
