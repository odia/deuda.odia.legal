#!/bin/bash

find ../3_unzip_database/ -type f | while read FILE; do 
  DB=$(basename "$FILE")
  echo processing $DB
  mdb-tables "$FILE" -1 | while read TABLE; do 
    mdb-json "$FILE" "$TABLE" | jq -c \
	  --arg TABLE "$TABLE" \
 	  --arg DATABASE "$DB" \
  	  'inputs + {"_table":$TABLE, "_database": $DATABASE}' >> all_data.json 
  done
done

