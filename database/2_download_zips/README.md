Los datos en esta carpeta pueden ser generados con el siguiente comando

cat ../links.txt | while read line; do wget $line; done

