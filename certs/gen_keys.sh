#!/bin/bash

openssl genrsa -out rsa_priv.pem 2048
openssl rsa -in rsa_priv.pem -outform PEM -pubout -out rsa_pub.pem
