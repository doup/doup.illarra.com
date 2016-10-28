---
title: Generando texturas procedurales
date: 2014-12-19
tags: [python, javascript, texgen]
draft: false
---

Entre los objetivos que me he marcado para los próximos meses esta aprender [Django](https://www.djangoproject.com) como reemplazo de Symfony2. Pero resulta que hay un problemilla: no se Python. Así que esta semana he empezado a trastear un poco y para hacer pruebas he retomado un antiguo proyecto llamado `sapo`. El proyecto en si es un generador de texturas procedurales que he reescrito varias veces durante los últimos años; la primera versión la hice cuando era miembro de [dust inc.](http://www.pouet.net/groups.php?which=1361), el grupo [demoscener](http://en.wikipedia.org/wiki/Demoscene) en el que _aprendí_ a programar (malamente, todo hay que decirlo).

Esta vez he hecho dos versiones: una en [Python](https://github.com/doup/sapo.py), otra en [JavaScript](https://github.com/doup/sapo.js)… más abajo intentare explicar las diferencias. :-)

## Los shaders

Las texturas procedurales son imágenes que se definen de forma matemática. La imagen se genera calculando el color de cada pixel mediante una función (_shader_) que tiene como entrada la posición del pixel y otros parámetros. Con un poco de paciencia se pueden generar cosas interesantes como estas:

![Ejemplo de texturas procedurales](/assets/images/sapo-examples.png)

Un ejemplo de shader super sencillo para `sapo.js` seria el siguiente:

```js
// Las coordenadas [s,t] van del 0.0 al 1.0, siendo la esquina
// superior izquierda [0,0] y la inferior derecha [1,1].
// Los colores van en formato [R,G,B,A], cada canal del 0.0 al 1.0.
//
function render(
    s, t,
    c1  = c(0.875, 0.0, 0.514, 1.0),
    c2  = c(1.0, 0.765, 0.0, 1.0),
    mid = f(0.5, 0.0, 1.0)
)
{
    if (s > mid) {
        return c1;
    } else {
        return c2;
    }
}
```

Teniendo como entrada la posición del pixel (`s` y `t`), dos colores (`c1` y `c2`) y el valor del punto medio (`mid`) se decide que color tiene que tener cada pixel. Básicamente el _shader_ dibujara una mitad de un color y la otra mitad de otro color. Puedes ver el resultado [aquí](http://doup.github.io/sapo.js/#halves.js).

### Unos ejemplos básicos

- [Degradado](http://doup.github.io/sapo.js/#gradient.js) mezclando dos colores según la coordenada `s`.
- Interpolación [lineal](http://doup.github.io/sapo.js/#lerp.js) y [smoothstep](http://doup.github.io/sapo.js/#smoothstep.js). Smoothstep es una tipo de interpolación muy útil para eliminar el [_aliasing_](http://es.wikipedia.org/wiki/Antialiasing) y definir transiciones suaves entre colores.
- Dibujar un [circulo](http://doup.github.io/sapo.js/#circle.js) utilizando la distancia entre `[s,t]` y el centro del circulo.
- Otros: [escamas](http://doup.github.io/sapo.js/#scales.js), [tablero de ajedrez](http://doup.github.io/sapo.js/#checker.js) y [rayo](http://doup.github.io/sapo.js/#beam.js).

Como ves, son _shaders_ sencillos y no hacen justicia a lo que se puede llegar a hacer. Si quieres ver imágenes/experimentos realmente flipantes te recomiendo visitar la [web de Iñigo Quilez](http://www.iquilezles.org).

## sapo.py

Bueno, este es mi primer proyecto en Python, [si miras el código](https://github.com/doup/sapo.py) veras que todavía es un poco básico y que no esta del todo bien ordenado, no es muy solido, faltan tests, etc. La idea es ir mejorando el código a medida que vaya aprendiendo más sobre Python, a ver si con el tiempo puedo hacer uso de funcionalidades más avanzadas del lenguaje.

En `sapo.py` se pueden conectar diferentes nodos (_shaders_) para crear imágenes más interesantes. Cada nodo tiene `n` _inputs_ y un _output_, siendo estos _inputs_/_outputs_ (puertos) de diferentes tipos: float, integer, bool, color, point… Así pues, al igual que en muchos softwares de 3D se pueden crear arboles conectando los puertos de diferentes nodos.

### Checker distorsionado

![Checker distorsionado](/assets/images/sapo-nodes-wavedistort.png)

```python
from PIL import Image
from sapo.renderer import PillowRender
from sapo.nodes import Checker, WaveDistort

canvas = PillowRender(Image.new('RGBA', (300, 300)))

checker = Checker(x_repeat=8, y_repeat=8, fuzz=0.01)
wave = WaveDistort(x_freq=4, x_amp=0.05, y_freq=4, y_amp=0.05)

wave.get_port('color').connect(checker)

canvas.render(wave)
```

### Circulo con radio variable

![Circulo con radio variable](/assets/images/sapo-nodes-circle.png)

```python
from PIL import Image
from sapo.renderer import PillowRender
from sapo.nodes import Checker, Circle, Color2Float

checker = Checker(x_repeat=4, y_repeat=4, fuzz=0.3)
radius = Color2Float(min=0.01, max=0.5)
circle = Circle(fuzz=0.025)

radius.get_port('color').connect(checker)
circle.get_port('radius').connect(radius)

canvas.render(checker)
```

## sapo.js

No estaba en los planes pero después de empezar a jugar con Python no he podido evitar la tentación de [crear una versión en JavaScript](http://doup.github.io/sapo.js). Las dos diferencias principales respecto a `sapo.py` son que es interactivo y que **no** permite conectar diferentes nodos. La parte interactiva lo hace ideal para enseñar fundamentos básicos de programación de forma visual. Si quieres ver el código lo puedes encontrar en [GitHub](https://github.com/doup/sapo.js).

Por cierto, si creas un _shader_ chulo no dudes en hacer un PR en el repositorio.
