# CODECARD

Competitive programming webgame. Released in August 2017 by Nguyen Viet Dung.

To retrieve a problem with multiple zip parts, use: cat problemid.zip.part* > problemid.zip

(To split a problem zip file into multiple parts, use: split -b 24M problemid.zip "problemid.zip.part")

To run, use: node algorithm_server.js

Before run, change ip and port in file "algorithm_server.js" and change mysql database, user, password in file "action.js". Also you have to change ip and port in all js and html file.
