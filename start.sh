killall python
killall node
node server/server.js &
cd ../mote.io-app/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
