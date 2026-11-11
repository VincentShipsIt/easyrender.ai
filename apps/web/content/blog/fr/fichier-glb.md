---

group: glb-file
title: Fichier GLB : l'ouvrir, le vérifier et l'alléger
description: Un fichier GLB réunit un modèle 3D et ses textures : regarde son contenu, ouvre-le sur tes appareils et réduis son poids sans perdre la forme.
date: 2026-11-15
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: fichier glb
cta: Avec une photo nette de lampe ou de chaise, tu peux vérifier tous les angles avant même la construction du GLB.
---

Un fichier GLB contient un modèle 3D dans la version binaire de glTF 2.0, format ouvert du Khronos Group. Il réunit forme, matériaux, textures et éventuelles animations dans un seul fichier .glb, sans dépendances à charger séparément. C'est un format courant pour les fiches produit en 3D et la réalité augmentée sur Android.

![Illustration d'une théière céladon, moitié émaillée et moitié en argile grise mate avec un maillage blanc dont les panneaux UV se détachent, sur fond sombre](/blog/illustrations/glb-file/hero.webp "Illustration, pas un résultat easyrender : une théière dessinée moitié émaillée, moitié en maillage, avec ses panneaux UV dépliés.")

## Que contient un fichier GLB ?

Un modèle glTF peut comprendre un fichier texte .gltf, des images de texture séparées et un fichier .bin pour la géométrie. Le GLB réunit le tout dans un fichier binaire, plus simple à envoyer, héberger ou joindre à un courriel. La [spécification glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) définit les deux.

Sa structure est simple : un en-tête de 12 octets contient le mot glTF, la version 2 et la longueur totale du fichier. Suivent deux blocs : du JSON décrivant la scène, puis un bloc binaire avec la géométrie et les images.

Nous contrôlons ces trois champs sur chaque modèle livré. Un fichier sans signature glTF, hors version 2 ou dont la longueur annoncée diffère de la longueur réelle est refusé avant téléchargement. Tout fichier de moins de 20 000 octets l'est également.

![Le GLB du vase en argile décomposé selon son poids : JSON de 1,4 KB, indices de triangles de 85 KB, positions et coordonnées de texture de 164 KB, texture WebP de 50 KB ; dessous, le même modèle en trois fichiers glTF](diagram:glb-anatomy "Contenu lu directement dans le GLB du vase présenté plus bas : 301 KB au total. Avec une texture WebP de 1024 pixels, la géométrie occupe l'essentiel du fichier.")

Les chiffres s'additionnent exactement. Les 14 590 triangles du vase désignent chacun leurs trois sommets avec 2 octets par référence, soit 87 540 octets d'indices. Ses 8 406 sommets stockent chacun position et coordonnées de texture en 20 octets, soit 168 120 octets.

## Combien pèsent de vrais GLB et que contiennent-ils ?

Nous avons lu les six modèles de notre galerie de la même façon. Tous contiennent un maillage, un matériau et une texture WebP de 1024 pixels, préparés pour le web avec glTF Transform.

| Modèle                | Poids en octets | Triangles | Texture en octets | Part de géométrie |
| --------------------- | --------------- | --------- | ----------------- | ----------------- |
| Vase en argile        | 308 448         | 14 590    | 51 354            | 83 %              |
| Vase en grès          | 312 816         | 16 708    | 28 466            | 90 %              |
| Table basse ronde     | 322 876         | 16 228    | 34 266            | 89 %              |
| Fauteuil pivotant     | 519 988         | 24 268    | 57 680            | 89 %              |
| Fauteuil en bouclette | 551 068         | 25 879    | 70 690            | 87 %              |
| Table de chevet       | 1 287 432       | 69 910    | 40 628            | 97 %              |

On dit souvent que les textures pèsent le plus dans un GLB : c'est vrai avec des PNG de 4096 pixels. Une fois la texture convertie en WebP de 1024 pixels, comme ici, la géométrie non compressée représente 83 % à 97 % du fichier. Le nombre de triangles détermine alors le poids.

## Que décrivent les matériaux d'un GLB ?

Ils suivent le modèle PBR métallique-rugueux. Le PBR, rendu fondé sur les propriétés physiques, décrit une surface par sa couleur de base, son caractère métallique et sa rugosité. Un même GLB garde ainsi un aspect proche dans les visionneuses respectant la norme.

![L'image de texture du vase en argile : surface découpée en morceaux à plat, bandes d'argile blanchie, rebord et fond](/blog/figures/glb-file/clay-vase-texture.webp "La texture de couleur de base extraite du GLB sans modification, 1024 x 1024 pixels. Les coordonnées de texture indiquent à la visionneuse où placer chaque morceau sur le vase.")

Toute valeur absente prend celle prévue par la spécification. Attention au caractère métallique : sans valeur explicite, il vaut 1, soit entièrement métallique. Un matériau qui ne définit que sa couleur de base peut donc donner à l'argile, au bois ou au tissu un aspect plus sombre ou teinté.

Un réglage suffit à vérifier : Metallic à 0 dans Blender, puis nouvel export. Nous ferions ce contrôle sur tout GLB destiné à une fiche produit, quelle que soit son origine.

## Pourquoi un GLB peut-il paraître facetté ?

Les normales de sommets indiquent à la visionneuse comment éclairer chaque coin pour lisser une surface courbe. Elles sont facultatives en glTF : un fichier peut ne contenir que positions et coordonnées de texture.

La spécification prévoit alors le calcul de normales plates. Les facettes restent petites sur un maillage dense, mais une lumière latérale basse peut les rendre visibles sur une courbe.

Les normales occupent 12 octets par sommet, trois nombres de 4 octets : environ 96 000 octets pour 8 000 sommets. Dans Blender, applique Shade Smooth et coche Normals à l'export. `gltf-transform inspect` indique si le fichier possède un attribut NORMAL.

## Comment ouvrir un fichier GLB ?

Il te faut une visionneuse, pas un convertisseur. Ces outils l'ouvrent directement :

- Dans le navigateur : dépose le fichier dans [Babylon.js Sandbox](https://sandbox.babylonjs.com/) ou [l'éditeur model-viewer](https://modelviewer.dev/editor/).
- Dans Blender : [File, Import, glTF 2.0](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) (.glb/.gltf).
- En programmation : three.js et Babylon.js chargent directement le GLB ; Unity utilise le [paquet glTFast](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html).
- Sur Android : [Scene Viewer de Google](https://developers.google.com/ar/develop/scene-viewer) ouvre un GLB lié depuis une page web, en 3D ou en réalité augmentée.

Les iPhone et iPad n'ouvrent pas les GLB dans AR Quick Look. Apple utilise le format USDZ : une boutique visant la réalité augmentée sur les deux systèmes conserve donc les deux fichiers.

![Un vase en argile patinée au format GLB, ouvert dans model-viewer de Google et prêt à tourner](/showcase/clay-vase.glb "Un vrai GLB easyrender de vase en argile patinée, ouvert dans model-viewer. Le fichier pèse 301 KB : un maillage de 14 590 triangles et une texture WebP de 1024 pixels, préparés avec glTF Transform.")

Une fois le fichier ouvert, fais-le tourner lentement. Regarde le dessous, le dos et les détails fins, comme les poignées et les coutures.

Pour lire le contenu sans visionneuse, lance `gltf-transform inspect`, fourni par [glTF Transform](https://gltf-transform.dev/cli). Il liste maillages, textures et extensions avec nombre de sommets et poids, pour comparer ton fichier au tableau précédent.

## À quoi sert un fichier GLB ?

Shopify accepte les GLB comme médias produit. Sur ton propre site, le composant libre [model-viewer](https://modelviewer.dev/) de Google affiche un GLB avec quelques lignes de code ; rotation et zoom sont intégrés.

Hors ecommerce, le GLB se retrouve dans la 3D web, les jeux et les applications de réalité augmentée : il est compact, ouvert et lu par de nombreux logiciels. Blender et la plupart des outils de scan ou d'IA l'exportent.

Sur Android, respecte les recommandations Scene Viewer : 10 MB, 100 000 triangles et textures de 2048 pixels maximum. Tous les fichiers de notre tableau restent dans ces limites.

## Comment réduire le poids d'un GLB ?

Pour comparer les commandes, nous les avons lancées sur une copie de la table de chevet, modèle le plus dense du tableau, avec glTF Transform 4.5. Le nombre de triangles reste identique sauf en cas de simplification.

| Version de la table de chevet                                                | Poids en octets | Triangles |
| ---------------------------------------------------------------------------- | --------------- | --------- |
| Version affichée ici                                                         | 1 287 432       | 69 910    |
| Géométrie compressée avec Meshopt (`gltf-transform meshopt`)                 | 422 480         | 69 910    |
| Géométrie compressée avec Draco (`gltf-transform draco`)                     | 235 776         | 69 910    |
| Nombre de triangles réduit de moitié (`gltf-transform simplify --ratio 0.5`) | 710 072         | 34 954    |

Draco produit le plus petit fichier, 82 % plus léger. Meshopt réduit le poids de 67 % ; sur le vase en argile, il passe de 308 448 à 135 740 octets. La simplification seule économise moins, car les triangles restants ne sont toujours pas compressés.

La compression exige une visionneuse compatible. model-viewer et three.js décodent les deux méthodes, mais la documentation Scene Viewer ne liste aucune de ces extensions. Teste un fichier compressé dans chaque visionneuse prévue avant de publier.

Voici notre choix selon la destination :

- Ton site avec model-viewer : Meshopt ou Draco pour la géométrie, textures WebP, puis contrôle des contours pour repérer les arrondis indésirables.
- Réalité augmentée Android via Scene Viewer : GLB simple avec textures JPEG ou PNG de 2048 pixels maximum ; simplification seulement au-delà de 100 000 triangles.
- Shopify : envoie le fichier non compressé, puisque Shopify optimise lui-même au-delà de 15 MB.

## Comment obtenir un GLB depuis Blender, un scan ou une photo ?

Dans Blender, choisis File, Export, glTF 2.0, puis glTF Binary (.glb) pour inclure les textures. Coche Normals et UVs sous Mesh ; préfère JPEG sauf si l'objet nécessite de la transparence. Les applications de scan et d'IA proposent généralement le téléchargement GLB.

Les méthodes de création sont comparées dans [comment faire un modèle 3D](/fr/guides/comment-faire-un-modele-3d). Pour un catalogue, [la 3D pour ecommerce](/fr/guides/modeles-3d-e-commerce) associe chaque méthode aux produits concernés.

easyrender fournit par exemple un GLB et un USDZ pour chaque modèle terminé à partir d'une photo. Les étapes figurent dans [la modélisation 3D à partir d'une photo](/fr/guides/creer-un-modele-3d-a-partir-de-photos). Le modèle conserve forme et matières, sans mesures issues de l'objet.

## GLB vers USDZ : faut-il garder les deux ?

Oui pour la réalité augmentée sur iPhone et iPad. Reality Converter, application Mac gratuite d'Apple, convertit un GLB au format USDZ ; Blender récent exporte aussi directement des fichiers USDZ. [Le guide du fichier USDZ](/fr/guides/fichier-usdz) explique notamment pourquoi il peut peser davantage que le GLB de départ.

| Fichier | Contenu                                                      | Où l'ouvrir                                          | Usage                                             |
| ------- | ------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- |
| GLB     | Un fichier binaire : géométrie, matériaux, textures          | Navigateurs, Blender, Scene Viewer Android           | Fiches produit, 3D web, réalité augmentée Android |
| glTF    | Un JSON .gltf, un .bin et des textures séparées              | Mêmes visionneuses, si les fichiers restent ensemble | Édition et inspection du JSON lisible             |
| USDZ    | Archive zip non compressée de couches USD et de leurs images | Quick Look sur iPhone, iPad et Mac                   | Réalité augmentée Apple                           |

## Quels problèmes avec un GLB et comment les corriger ?

Les problèmes reviennent souvent aux mêmes causes. Pars de ce que tu vois pour trouver le réglage à modifier.

| Symptôme                                    | Cause                                                            | Correction                                           |
| ------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| Modèle tout gris                            | .gltf sans ses textures ou export sans images                    | Réexporte en .glb binaire pour inclure les textures  |
| Fichier de plusieurs dizaines de mégaoctets | Textures de 4096 pixels, ou nombreuses textures                  | Réduis à 2048 ou 1024 et compresse la géométrie      |
| Courbes facettées                           | Absence de normales de sommets, calcul de normales plates        | Shade Smooth dans Blender puis export avec normales  |
| Argile ou tissu sombre ou teinté            | Metallic non défini, donc entièrement métallique par défaut      | Règle Metallic sur 0 et réexporte                    |
| Taches noires ou faces vues de l'intérieur  | Faces orientées à l'envers                                       | Recalcule les normales vers l'extérieur dans Blender |
| Fichier accepté ici, refusé ailleurs        | Extension glTF incompatible, comme Draco ou WebP                 | Exporte une version simple pour cette visionneuse    |
| Fichier annoncé invalide                    | Téléchargement interrompu, longueur différente de celle annoncée | Télécharge à nouveau et compare le poids             |

## Que ne dit pas un fichier GLB ?

glTF utilise le mètre, mais la taille ne correspond au meuble que si la personne qui l'a créé l'a réglée correctement. Une photo ne fournit pas de dimensions mesurées : garde celles-ci dans le texte produit.

Le format ne garantit pas non plus la qualité. Un fichier peut passer le [glTF Validator](https://github.khronos.org/glTF-Validator/) tout en contenant un pied déformé ou une texture floue. Seul l'examen dans une visionneuse les révèle.

## FAQ

### GLB et glTF sont-ils la même chose ?

C'est le même format sous deux présentations : le glTF peut comprendre un texte .gltf accompagné de fichiers de géométrie et de textures. Le GLB est sa version binaire, qui réunit le tout dans un seul fichier. Tous deux suivent la norme glTF 2.0 du Khronos Group et sont généralement lus par les mêmes outils.

### Peut-on ouvrir un fichier GLB sur iPhone ?

Pas directement dans AR Quick Look, qui utilise le fichier USDZ. Tu peux toutefois regarder un GLB dans le navigateur de l'iPhone avec une visionneuse web comme Babylon.js Sandbox. Pour la réalité augmentée Apple, convertis-le au format USDZ avec Reality Converter sur Mac ou demande à ton outil les deux fichiers dès le départ.

### Comment convertir un GLB dans un autre format ?

Ouvre-le dans Blender, qui importe le GLB et exporte notamment FBX, OBJ, USD et USDZ. Certaines informations peuvent disparaître : OBJ ne décrit pas les matériaux métallique-rugueux et une poignée en laiton peut paraître plus plate. Contrôle toujours le fichier converti dans une visionneuse avant de le montrer à un client.

### Pourquoi mon fichier GLB est-il si lourd ?

Souvent à cause de grandes textures ou d'une géométrie non compressée une fois les images réduites. Lors de nos essais, Draco a fait passer un modèle de 69 910 triangles de 1 287 432 à 235 776 octets. Réduis les textures à 2048 ou 1024 pixels, compresse avec glTF Transform et vérifie les surfaces dans une visionneuse.

### Pourquoi mon GLB est-il gris ou sans texture ?

Les textures n'ont généralement pas été exportées : un .gltf réassemblé sans ses images ou un export limité à la géométrie donne une forme grise. Réexporte en .glb binaire pour les inclure. Si le résultat est correct dans Babylon.js Sandbox mais pas dans une application, c'est cette dernière qu'il faut examiner.
