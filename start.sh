killall node
killall python
runjs server/server.js &
cd ../pusher-phonegap-android/assets/www
python -m SimpleHTTPServer &
echo "Mote.io Started!"
