#!/bin/bash


[ ! -f "./all_data.json" ] && echo missing all_data.json file, run transform.sh first. && exit 1

YEAR=$1
[ -z "$YEAR" ] && echo missing year parameter && exit 1

cat all_data.json | iconv -f utf-8 -t ascii//TRANSLIT | jq 'select(.Ano == '${YEAR}')' > ${YEAR}_data.json


