killall node
killall python
node server/server.js &
cd app/mote.io/assets/www
python -m SimpleHTTPServer &
cd ../../../../
cd homebase
python -m SimpleHTTPServer 5000 &
echo "Mote.io Started!"
