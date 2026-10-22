# Historias de usuario

## S01 Dash
Como jugador, quiero presionar espacio para acelerar, para poder escapar del peligro o alcanzar comida.

**Criterios de aceptación**
- Dado que estoy vivo con longitud mayor a 3, cuando mantengo presionado espacio, entonces mi serpiente se mueve más rápido.
- Dado que estoy haciendo dash, cuando pasa cada tick de dash, entonces mi serpiente pierde un segmento de cola.
- Dado que mi longitud es 3, cuando presiono espacio, entonces no pasa nada.
- Dado que suelto espacio, cuando se ejecuta el siguiente tick, entonces mi velocidad vuelve a la normal.

Archivos que toca: server/game.js, client/render.js

## S02 Orbe de escudo
Como jugador, quiero recoger un orbe de escudo, para ser inmune a las colisiones durante 5 segundos.

**Criterios de aceptación**
- Dado que hay un orbe de escudo en el mapa, cuando mi cabeza lo alcanza, entonces obtengo un escudo y el orbe desaparece.
- Dado que tengo un escudo, cuando choco con una pared o con otra serpiente, entonces no muero.
- Dado que tengo un escudo, cuando pasan 5 segundos, entonces el escudo expira.
- Dado que tengo un escudo, cuando otros jugadores me miran, entonces mi serpiente muestra un brillo visible.

Archivos que toca: server/game.js, client/render.js

## S03 Zona que se encoge
Como jugador, quiero que la zona segura se reduzca con el tiempo, para que las partidas se conviertan en un battle royale.

**Criterios de aceptación**
- Dado que una ronda está en curso, cuando pasa el tiempo, entonces el borde de la zona segura se mueve hacia adentro.
- Dado que estoy fuera de la zona segura, cuando pasa cada tick, entonces recibo daño y pierdo un segmento.
- Dado que estoy fuera de la zona con longitud 1, cuando se aplica el daño, entonces muero y reaparezco.
- Dado que la zona llegó a su tamaño mínimo, cuando pasa el tiempo, entonces deja de encogerse.

Archivos que toca: server/game.js, client/render.js

## S04 Comida dorada
Como jugador, quiero comida dorada poco frecuente que valga x5, para que los riesgos valgan la pena.

**Criterios de aceptación**
- Dado que aparece comida, cuando el sorteo es poco frecuente, entonces la comida es dorada.
- Dado que como comida dorada, cuando mi cabeza la alcanza, entonces mi puntaje sube 5 puntos.
- Dado que como comida dorada, cuando se consume, entonces mi serpiente crece 5 segmentos.
- Dado que existe comida dorada, cuando se dibuja, entonces se ve distinta a la comida normal.

Archivos que toca: server/game.js, client/render.js

## S05 Portales
Como jugador, quiero portales en pareja que me teletransporten, para tomar atajos.

**Criterios de aceptación**
- Dado que existe una pareja de portales, cuando mi cabeza entra en uno, entonces aparezco en el otro portal.
- Dado que acabo de teletransportarme, cuando sigo avanzando, entonces conservo mi dirección y mi longitud.
- Dado que existen portales, cuando se dibujan, entonces cada pareja comparte un color distinto.
- Dado que la salida de un portal está bloqueada por una serpiente, cuando entro, entonces muero.

Archivos que toca: server/game.js, client/render.js

## S06 Minas de veneno
Como jugador, quiero que las serpientes muertas dejen minas, para que el mapa siga siendo peligroso.

**Criterios de aceptación**
- Dado que una serpiente muere, cuando reaparece, entonces aparecen minas donde estaba su cuerpo.
- Dado que existe una mina, cuando la cabeza de otra serpiente la toca, entonces esa serpiente pierde 3 segmentos.
- Dado que una mina fue activada, cuando se resuelve el golpe, entonces la mina se elimina.
- Dado que existen minas, cuando se dibujan, entonces están claramente marcadas como un peligro.

Archivos que toca: server/game.js, client/render.js

## S07 Tormenta de controles
Como jugador, quiero un evento global de tormenta que invierta los controles, para que las partidas tengan momentos caóticos.

**Criterios de aceptación**
- Dado que el juego está en curso, cuando se activa una tormenta, entonces todos los jugadores reciben un aviso en pantalla.
- Dado que hay una tormenta activa, cuando presiono izquierda, entonces mi serpiente gira a la derecha (y lo mismo con arriba y abajo).
- Dado que hay una tormenta activa, cuando pasan 5 segundos, entonces los controles vuelven a la normalidad.
- Dado que no hay una tormenta activa, cuando presiono una dirección, entonces se comporta de forma normal.

Archivos que toca: server/game.js, client/render.js

## S08 Orbe imán
Como jugador, quiero un orbe imán que atraiga la comida cercana, para recogerla más rápido.

**Criterios de aceptación**
- Dado que hay un orbe imán en el mapa, cuando mi cabeza lo alcanza, entonces obtengo el efecto de imán.
- Dado que tengo el imán, cuando hay comida a 5 celdas o menos de mi cabeza, entonces se acerca una celda por tick.
- Dado que tengo el imán, cuando pasan 8 segundos, entonces el efecto termina.
- Dado que tengo el imán, cuando se me dibuja, entonces un anillo alrededor de mi cabeza muestra el radio de atracción.

Archivos que toca: server/game.js, client/render.js

## S09 Tabla de posiciones en vivo con rachas
Como jugador, quiero una tabla de posiciones en vivo con rachas de eliminaciones, para ver quién domina.

**Criterios de aceptación**
- Dado que hay jugadores conectados, cuando cambian los puntajes, entonces la tabla muestra los 5 mejores por puntaje.
- Dado que elimino a otra serpiente, cuando muere al chocar con mi cuerpo, entonces mi racha de eliminaciones aumenta en 1.
- Dado que muero, cuando reaparezco, entonces mi racha vuelve a 0.
- Dado que un jugador tiene una racha de 3 o más, cuando se dibuja la tabla, entonces aparece una insignia de racha junto a su nombre.

Archivos que toca: server/game.js, client/render.js, client/index.html

## S10 Burbujas de chat
Como jugador, quiero burbujas de chat sobre las cabezas de las serpientes, para burlarme de mis amigos.

**Criterios de aceptación**
- Dado que estoy conectado, cuando escribo un mensaje y presiono Enter, entonces se envía al servidor.
- Dado que el servidor recibe un mensaje, cuando lo retransmite, entonces todos los jugadores ven una burbuja sobre la cabeza de esa serpiente.
- Dado que se muestra una burbuja, cuando pasan 4 segundos, entonces desaparece.
- Dado que un mensaje tiene más de 60 caracteres, cuando se envía, entonces se trunca.

Archivos que toca: server/index.js, client/main.js, client/render.js
