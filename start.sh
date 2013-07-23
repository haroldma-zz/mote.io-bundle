killall node
killall python
runjs server/server.js &
cd ../mote.io-android/assets/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
