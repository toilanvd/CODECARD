for f in ~/Desktop/problems/neerc_16/*;
do
	for i in {1..9};
	do
		mv $f/0$i $f/$i.in
		mv $f/0$i.a $f/$i.out
	done

	for i in {10..200};
	do
		mv $f/$i $f/$i.in
		mv $f/$i.a $f/$i.out
	done
done
