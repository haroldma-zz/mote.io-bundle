killall node
killall python
runjs server/server.js &
cd app/assets/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
