FreeMarketLite
=====================

A web interface and browser for the Nxt FreeMarket decentralized exchange written in Node.js with express.

To use
=====================
Download NxT client and run - https://bitbucket.org/JeanLucPicard/nxt/downloads

--sh run.sh

Download FreeMarket and run - https://nxtforum.org/freemarket-releases/

--java -cp libs/*:conf blackyblack.Application

Download and Install MongoDB

	Linux: sudo apt-get install mongodb

	Windows: mongodb.org (install to C:\mongodb)

Run Mongo:

	Linux: ./mongodb.sh

	Windows: mongodb.bat

	Note: If it gives you a 'addr already in use' error, run:

		ps wuax | grep mongo
		then
		sudo kill -9 <pid>
		and try again

Install Packages:

run: npm install -d


Run app.js using node
