@echo off
echo Running containers:
echo:
docker ps
echo:
echo Stopping all running containers:
echo:
FOR /f "tokens=*" %%i IN ('docker ps -a -q') DO docker stop %%i
echo:
echo Deleted containers:
echo:
docker container prune -f
echo:
echo Deleted images:
echo:
docker image prune -a -f
pause