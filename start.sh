killall node
killall python
node server/server.js &
cd app/assets/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
