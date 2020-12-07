docker build -t smile-track-cors .
docker run \
  --rm -d \
 -p 8080:8080 \
  smile-track-cors
