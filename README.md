## a socket.io chatroom 

[demo](http://lah.no.de:8031/chat/) user:alvin|password:pass  

a quick hack to try out chat on nodejs, socketio, mongodb, backbonejs mvc with its todo list example.  

#### inspired by  
* [socketio](http://socket.io)  
* [nodejs](http://nodejs.org)  
* [chat.nodejs.org](http://chat.nodejs.org/)  
* [backbonejs](http://documentcloud.github.com/backbone/)  
* [backbonejs-example-todos](http://documentcloud.github.com/backbone/examples/todos/index.html)  

#### current features  
* todo list with local storage (originally implemented by [Jérôme Gravel-Niquet](http://jgn.me/)  
* user verification to enter a chat/broadcast message  
* check in current location with web browser  
* chatroom features with command: key in /help(command for help), /ding(play a ding sound), /whoishere(check login users), /get10(get last 10 messages), /crashnode(force restart server, for development)
* unfiltered message input, (e.g. place a youtube <iframe> to play music during chat), place image, audio, video tag in chatroom, or place a chatroom within a chatroom, etc  

#### chatroom bot  
* send http request - e.g.: "@lahbot request http://callapi.com:8080/api/getsomething" (action:send request and get response)  
* remember command - e.g: "@lahbot $remember [$helloworld] [Hello world!]" (usage:@lahbot $helloworld)(action:send a message "Hello world!")  

#### server requirement  
* nodejs server   
: server setup: [no.de](http://no.de) or [manual setup](http://nodejs.org)  
: nodejs packages via npm: [expressjs](http://expressjs.com/), [socket.io](http://socket.io), [googlemaps](https://github.com/moshen/node-googlemaps), [mongoosejs](http://mongoosejs.com)  
* [mongodb](http://mongodb.org)  
* (optional) php server, to display user location in map  

#### setting up  
* install the nodejs packages as stated in the requirement above  
* copy and rename config.js.sample to config.js, enter the listening port used for server and chat app  
* copy and rename public/chat/js/config.js.sample to public/chat/js/config.js, enter your server host and port as above  
* (optional)copy public/chat/map.php to a php server if you want show location on map  
* install mongodb, then insert at least a username, password in users collections  
* run node!  
* browse to http://yournodeserver.com/chat, type a random message, you should see "Please login to chat"

#### troubleshooting  
* make sure all the required nodejs packages are installed  
* make sure mongodb is installed and connected  
* make sure the html page is connected to the nodejs server, you will see "client <random number> connected", when you type message in the chat box, you will see "Please login to chat"  

#### links  
check out [@honcheng](http://github.com/honcheng) to get the iphone/ipad client  
