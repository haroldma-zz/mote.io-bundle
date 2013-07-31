killall python
killall node
node server/server.js &
node proxy-2/app.js &
cd ../mote.io-app/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
