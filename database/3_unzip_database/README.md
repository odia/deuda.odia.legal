# Extraccion automatica

A cada archivo en la carpeta `2_download_zips` que termina en `.zip`, descomprimirlo y dejar el resultado en `3_unzip_database`

```
(cd ../2_download_zips/; for file in *.zip; do unzip $file -d ../3_unzip_database/$file; done)
```

# Limpiando porqueria

Hay bases de datos que adicionalmente tienen un zip adentro (anda a saber porque...). Debido a esto se procede con lo siguiente: por cada archivo `.zip` que queda en esta carpeta, extraerlos con un sufijo `_unzip` extra.

```
for file in */*.zip; do unzip $file -d ${file}_unzip; done
rm */*.zip
```

Hay base de datos duplicadas, para encontrarlas usamos una funcion de hash que devuelve el mismo id si el contenido es identico.

```
find . -type f -print0 | xargs -0 md5sum | sed "s/ .*//" | sort | uniq -c
```

Para las base de datos que se usaron en el momento de esta prueba se encontraron dos base de datos duplicadas con los siguientes id:

```
32365231e0773e25b9fc7b49075e1400
39b9ef14d383ab592245b28c334175af
```

Que deben ser eliminadas

```
rm "./basesigade2008-03-31.zip/basesigade-3ertrimestre-2009.zip_unzip/Base de datos Deuda Publica 3er. trimestre de 2009.mdb"
rm "./basesigade_2013-06-30.zip/2003_para_el_sitio_basesigade_2008_12_30.zip_unzip/2003-Para el Sitio basesigade 2008-12-30.mdb"
```

