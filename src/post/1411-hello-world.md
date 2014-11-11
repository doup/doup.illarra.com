---
title: helloWorld()
date: 2014-11-06
tags: [misc]
---

Declaración de intenciones para este, mi primer, blog:

```js
(function helloWorld() {
    while (enjoySabbatical()) {
        try {
            learnMeteor();
            learnFamous();
            learnDjango();
            codeSomeProjects();
            postFindings();
        } catch (err) {
            console.log('A ver si te pones las pilas!!');
        }
    }
})();
```

Espero que sea un fructifero año y pueda compartir mis descubrimientos. :-)

##Las tripas del blog

Para quien este interesado, este blog esta generado con [Metalsmith](http://www.metalsmith.io) un generador de websites estáticos que funciona sobre [Node.js](http://nodejs.org). El `build` y el `deploy` se gestionan con [Gulp](http://gulpjs.com) un sistema de compilación que funciona con _streams_; si conoces Grunt y quieres algo más rapido y explicito deberias de echarle un vistazo. En cuanto al alojamiento, el blog esta en Amazon S3, nada del otro mundo pero muy conveniente para un website estático. Si quieres saber más puedes mirar [el repositorio](https://github.com/doup/doup.illarra.com), lo importante se encuentra en `gulpfile.js`. Ya veras que es bastante sencillo.
