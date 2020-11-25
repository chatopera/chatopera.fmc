#! /bin/bash 
###########################################
#
###########################################

# constants
baseDir=$(cd `dirname "$0"`;pwd)
rootDir=$baseDir/..
registry=
imagename=chatopera/fmt
# functions

# main 
[ -z "${BASH_SOURCE[0]}" -o "${BASH_SOURCE[0]}" = "$0" ] || return
cd $rootDir

# Version key/value should be on his own line
PACKAGE_VERSION=`git rev-parse --short HEAD`
# PACKAGE_VERSION=$(cat package.json \
#   | grep version \
#   | head -1 \
#   | awk -F: '{ print $2 }' \
#   | sed 's/[",]//g' | xargs)


docker build \
    --no-cache=true \
    --force-rm=true \
    --build-arg VCS_REF=$PACKAGE_VERSION \
    --tag $imagename:$PACKAGE_VERSION .

if [ $? -eq 0 ]; then
    docker tag $imagename:$PACKAGE_VERSION $imagename:develop
    docker push $imagename:develop
    docker push $imagename:$PACKAGE_VERSION
fi