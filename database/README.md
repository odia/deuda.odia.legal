Base de datos de ODIA Deudas
============================

La base de datos fue generada con la informacion publica en https://www.argentina.gob.ar/economia/finanzas/deuda-publica.
En este repositorio se encuentra el procedimiento y un ejemplo de los datos par que cualquiera pueda reproducir y verificar.

0.- Acceder al sitio y guardar una copia de las paginas de datos trimestrales o mensuales.
-----------

Este sitio contiene links a las base de datos en formato MDB (Microsoft Access). 

Como ejemplo se dejan copias del estado del sitio https://www.argentina.gob.ar/ en el momento de producir el informe en la carpeta `pages`.

1.- Obtener los links a las base de datos
-----------

Una vez que tenemos una copia de las paginas podemos extraer cada uno de los links los cuales seran similares al siguiente link:

```
https://www.argentina.gob.ar/sites/default/files/sin_cod_2003-para_el_sitio_basesigade_2020-31-12.zip
```

Una vez extraidos los links, guardarlos en un archivo "links.txt". El archivo solo debe contener un link por linea.

El script en la carpeta `1_get_links` se puede usar para extraer la informacion automaticamente.

2.- Descargar todas las base de datos 
----------

Una vez que tenemos le archivo "links.txt" hay que descargar todos los archivos .zip y guardarlos en una carpeta.

3.- Extraer y limpiar base de datos
----------

El siguiente paso es descomprimir las base de datos para obtener los archivos `.mdb` eliminando base de datos duplicadas

4.- Transformar a JSON
--------

Para transformar las base de datos a un formato que se pueda utilizar en la web se utiliza la herramienta [MDB Tools](https://github.com/mdbtools/mdbtools)

```
apt install mdbtools
```
Despues de generar la base de datos en formato JSON, es necesario filtrar caracteres invalidos y utilizar un formato de caracteres UTF-8. Esto se puede automatizar con la herramienta `iconv` que generalmente viene en un sistema operativo moderno.

```
apt install libc6
```

En total el archivo final puede llegar a pesar unos 600 Megas y unos 20 Megas anuales.

