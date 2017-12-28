#include <cstdio>
#include <iostream>

using namespace std;

typedef long long ll;

const int MAXN = 900005;

ll n, q;
bool erased_row[MAXN], erased_col[MAXN];
ll sum_row_erased, sum_col_erased;
ll num_row_erased, num_col_erased;

int main(){
    ios_base::sync_with_stdio(false);

    cin >> n >> q;
    while(q--){
        char c; ll x;
        cin >> c >> x;
        if(c=='R'){
            if(erased_row[x]) cout << 0 << "\n";
            else{
                cout << (2*x+n+1)*n/2 - (sum_col_erased + (x+1)*num_col_erased) << "\n";
                sum_row_erased += (x-1);
                num_row_erased ++;
                erased_row[x] = true;
            }
        }
        else{
            if(erased_col[x]) cout << 0 << "\n";
            else{
                cout << (2*x+n+1)*n/2 - (sum_row_erased + (x+1)*num_row_erased) << "\n";
                sum_col_erased += (x-1);
                num_col_erased ++;
                erased_col[x] = true;
            }
        }
    }

    return 0;
}