killall node
killall python
node server/server.js &
cd app/mote.io/assets/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
