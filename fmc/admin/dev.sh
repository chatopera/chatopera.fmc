#! /bin/bash 
###########################################
#
###########################################

# constants
baseDir=$(cd `dirname "$0"`;pwd)
export PYTHONUNBUFFERED=1
export PATH=/opt/miniconda3/envs/venv-py3/bin:$PATH

# functions

# main 
[ -z "${BASH_SOURCE[0]}" -o "${BASH_SOURCE[0]}" = "$0" ] || return
cd $baseDir
if [ -f localrc ]; then
    source localrc
fi

cd $baseDir/../app

export DEBUG=fmc*
export FMC_ACCOUNTS=$PWD/config/accounts-dev.json

npm run dev