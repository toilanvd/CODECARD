
#include<stdio.h>
int cycle(int n)
{
    int counter=1;

        while(n!=1)
        {
               if (n%2==0) n=n/2;
               else  n=3*n+1;
               counter++;
        }

    return(counter);
}

int max_length(int n1, int n2)
{
    int i,temp,max=cycle(n1);

        for(i=n1+1;i<=n2;i++)
        {
        temp=cycle(i);
        if(temp>max)
        max=temp;
        }
    return(max);
}

main()
{
    int n1,n2,temp,max;
   while( (scanf("%d %d",&n1,&n2))==2)
   {
        if(n1>n2)
max=max_length(n2,n1);
else
max=max_length(n1,n2);

    printf("%d %d %d\n",n1,n2,max);
    }
}

