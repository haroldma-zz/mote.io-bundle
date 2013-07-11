killall node
killall python
runjs server/server.js &
cd ../mote.io-app/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
