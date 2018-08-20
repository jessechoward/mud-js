#!/bin/bash

# one of the best things about stackexchange...
# https://unix.stackexchange.com/questions/9957/how-to-check-if-bash-can-print-colors
if [ test -t -eq 0 ]; then
	# see if it supports colors...
	ncolors=$(tput colors)
	# populate the colors
	if test -n "$ncolors" && test $ncolors -ge 8; then
		bold="$(tput bold)"
		underline="$(tput smul)"
		standout="$(tput smso)"
		normal="$(tput sgr0)"
		black="$(tput setaf 0)"
		red="$(tput setaf 1)"
		green="$(tput setaf 2)"
		yellow="$(tput setaf 3)"
		blue="$(tput setaf 4)"
		magenta="$(tput setaf 5)"
		cyan="$(tput setaf 6)"
		white="$(tput setaf 7)"
	fi
fi

FAIL="${red}[FAIL]:${CLR} "
PASS="${green}[PASS]:${CLR} "
IMPORTANT="${yellow}"
CLR="${normal}"

# most everything is 2048 these days but the 4096 is going
# to be required soon so might as well suck it up
KEY_SIZE=4096
C_DATE=`date +'%Y%m%d%H%M%S'`

PRIV_PEM="rsa_${KEY_SIZE}_${C_DATE}.key"
PUB_PEM="rsa_${KEY_SIZE}_${C_DATE}.pub"

openssl genrsa -out ${PRIV_PEM} ${KEY_SIZE}
if [ $? -eq 0 ]; then
	echo -e "${PASS}Generated private key file ${PRIV_PEM}"
	openssl rsa -in ${PRIV_PEM} -outform PEM -pubout -out ${PUB_PEM}
	if [ $? -eq 0 ]; then
		echo -e "${PASS}Generated public key ${PUB_PEM}"
	else
		echo -e "${FAIL}There was a problem generating the public key"
		exit -1
	fi
else
	echo -e "${FAIL}There was a problem generating the private key"
	exit -1
fi

echo -e "\n${IMPORTANT}Be sure to update config/<default | env>.json with the new certs${CLR}\n"
