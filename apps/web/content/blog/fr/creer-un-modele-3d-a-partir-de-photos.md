---

group: how-to-make-a-3d-model-from-photos
title: Modélisation 3D à partir d'une photo, étape par étape
description: Modélisation 3D à partir d'une photo : choisis la bonne image, vérifie les côtés hors champ et récupère tes fichiers GLB et USDZ.
date: 2026-11-11
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: modélisation 3d à partir d'une photo
cta: Choisis une photo nette de ton catalogue, une chaise ou un buffet de trois quarts, et vérifie tous les angles avant de dépenser un crédit.
---

Pour créer un modèle 3D à partir d'une photo, donne à un outil image-vers-3D une image nette d'un seul objet, éclairé uniformément : les côtés hors champ sont déduits de cette image. Autre méthode, la photogrammétrie demande au moins 20 photos qui se recouvrent autour de l'objet. Dans les deux cas, la photo détermine largement le résultat.

![Illustration d'un arrosoir en métal galvanisé, une moitié en métal et l'autre en argile grise mate recouverte d'un maillage blanc, sur fond sombre](/blog/illustrations/how-to-make-a-3d-model-from-photos/hero.webp "Illustration, pas un résultat easyrender : un arrosoir dessiné moitié en métal galvanisé, moitié en argile avec un maillage blanc.")

## Créer un modèle 3D à partir de photos : une seule ou plusieurs ?

Le nombre de photos dépend d'une question : as-tu l'objet devant toi ? La photogrammétrie et le scan LiDAR l'exigent. L'image-vers-3D n'a besoin que d'une image, ce qui convient à la photo fournisseur d'un buffet que tu n'as jamais eu entre les mains.

La photogrammétrie assemble des photos qui se recouvrent. [Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) en demande au moins 20, avec environ 70 % de recouvrement, et 100 ou plus pour les objets détaillés. [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) commence l'analyse après 20 images, en accepte jusqu'à 300 et recommande des cercles et des arcs à plusieurs hauteurs.

Sur un iPhone Pro ou un iPad Pro, le LiDAR mesure la profondeur pendant que tu tournes autour du meuble. Il va vite sur les grandes formes simples, mais restitue moins bien les détails fins, comme les barreaux tournés.

![Deux méthodes : la photogrammétrie utilise 20 à 100 photos ou plus d'un objet accessible et observe chaque surface ; l'image-vers-3D utilise une seule photo dont elle déduit les côtés hors champ](diagram:photo-vs-photogrammetry "La photogrammétrie mesure ce que l'appareil a vu. L'image-vers-3D part d'une photo : les côtés hors champ sont déduits de cette image. Nombre de photos issu du guide Polycam.")

Voici ce que nous choisirions selon le cas :

- Une photo fournisseur seulement, le meuble dans un entrepôt à l'étranger : l'image-vers-3D, seule méthode qui puisse commencer.
- Le meuble dans ta réserve, une surface texturée comme le chêne ou le lin, une heure disponible : la photogrammétrie, qui enregistre la surface au lieu de la déduire.
- Une grande pièce simple, comme un canapé trois places, et un iPhone Pro disponible : le LiDAR, rapide et adapté à la forme plutôt qu'au tissage.
- Du verre, un miroir ou du chrome poli : aucune méthode ne fonctionne bien, car les reflets sont interprétés comme une surface.

Le comparatif [logiciels de photogrammétrie ou IA à partir d'une photo](/compare/photogrammetry-software) détaille les compromis.

## Comment fonctionne l'image-vers-3D ?

Les outils suivent deux approches. Certains passent directement de la photo au modèle. D'autres dessinent d'abord l'objet sous plusieurs angles, puis construisent le modèle à partir de ces vues, ce qui apporte davantage d'informations pour les côtés cachés.

easyrender suit la seconde approche, choisie après un test A/B sur de vraies annonces. Ce test utilisait un modèle d'image plus volumineux pour la planche ; le modèle moins coûteux qui la dessine aujourd'hui n'a pas encore été évalué de la même manière.

La première étape produit une planche de vues : une image carrée divisée en une grille de 3 par 3.

Huit cases font le tour de l'objet par pas de 45 degrés, de la face à l'avant gauche ; la neuvième montre le dessus. Chaque vue est centrée, complète, sur fond blanc avec une lumière douce. La seconde étape lit ta photo et ces neuf vues pour construire un maillage texturé.

![Cinq étapes en deux phases : photo, planche de vues, vérification du dos et des côtés, construction puis fichiers GLB et USDZ ; une mauvaise prévisualisation renvoie à une nouvelle photo](diagram:image-to-3d-pipeline "Les deux phases des étapes ci-dessous. Sur easyrender, la planche de vues est gratuite ; les crédits ne sont dépensés qu'à l'étape 4, si tu lances la construction.")

Une seule photo montre bien la forme et la couleur générales, mais pas ce qui se trouve derrière un tissage ajouré, et favorise les déductions par symétrie. Nos instructions demandent de déduire sobrement les faces cachées à partir de la construction visible, sans inventer de logo, de texte ni de décor.

Pour les meubles, nos essais ont donné des règles supplémentaires : conserver le nombre exact de pieds, d'accoudoirs, de coussins et de tiroirs, ainsi que le sens du fil du bois et des coutures. Les autres méthodes figurent dans [comment faire un modèle 3D](/fr/guides/comment-faire-un-modele-3d).

## Étape 1 : choisis la bonne photo

La meilleure photo montre l'objet entier, net, sous une lumière douce et uniforme, sur fond uni. Rien ne doit le masquer : ni coussin sur l'accoudoir, ni plante devant un pied.

Pour les meubles, préfère une vue de trois quarts à une vue de face. Une photo de face cache la profondeur de l'assise d'un fauteuil. De trois quarts, elle montre à la fois l'avant et un côté, donc laisse moins de forme hors champ.

![Un fauteuil en bouclette avec une structure tubulaire en acier, photographié de trois quarts sur fond blanc](/showcase/armchair.jpg "Une bonne photo de départ : fauteuil entier, angle de trois quarts, fond uni.")

Le fichier doit être un JPEG, un PNG ou un WebP de moins de 4 MB.

La résolution a aussi un seuil : notre contrôle refuse les photos dont le petit côté fait moins de 400 pixels et avertit sous 800. Il refuse également une photo plus de quatre fois plus large que haute, ou si uniforme qu'elle paraît vide.

Au-delà de ce seuil, la netteté compte davantage que le nombre de pixels ; nous contrôlons donc le flou sur une petite copie de chaque image. Vérifie à l'œil en zoomant à 100 % sur le bord d'un pied : si le grain ou le tissage n'y apparaît pas, la photo ne peut pas le transmettre au modèle.

Avant l'envoi, vérifie ces points :

- Le meuble est entier, avec une marge de chaque côté et aucun pied coupé.
- L'appareil se trouvait à mi-hauteur du meuble, sans vue plongeante prise debout.
- Les contours restent nets en plein format, pas seulement sur un écran de téléphone.
- La lumière est uniforme, sans ombre dure traversant l'objet.
- Le fond est uni : mur, papier de fond ou sol dégagé.
- La photo montre un seul objet, pas une pièce aménagée.

## Étape 2 : retire ce qui n'est pas l'objet

Un fond chargé suffit à fausser la reconstruction. Un motif de tapis peut être lu comme une partie du piètement d'une table, ou un lampadaire se confondre avec le rideau derrière lui.

Si tu n'as qu'une photo en situation, recadre autour du meuble avec une petite marge partout. Un buffet long peut rester large, jusqu'à quatre fois sa hauteur. Au-delà, notre contrôle demande une photo montrant le produit entier.

Le détourage aide, mais vérifie ses contours. Un outil de suppression du fond peut laisser un halo clair que la photo fait passer pour une partie de l'objet. Inspecte le bord en plein format avant l'envoi.

Les ombres font aussi partie du fond. Une ombre dure sous une table basse peut devenir une plaque sombre liée aux pieds ; mieux vaut attendre une lumière douce, par temps couvert.

## Étape 3 : vérifie la prévisualisation sous tous les angles

Les bons outils image-vers-3D montrent plusieurs côtés avant de construire le modèle final. Regarde surtout le dos et les côtés, là où la photo ne montrait pas l'objet.

Lis la planche comme une planche-contact : compte pieds, portes et tiroirs dans chaque case, pas seulement de face. Compare ensuite les cases opposées, par exemple avant droit et arrière gauche : des accoudoirs qui changent de forme donneraient un fauteuil déséquilibré.

La vue du dessus révèle ce que les autres cachent. C'est là que se voit d'abord un abat-jour rond devenu ovale ou un plateau plus large à une extrémité.

![Neuf vues du même fauteuil en bouclette, face, côtés, dos et dessus, dessinées à partir de la seule photo précédente](/showcase/armchair-angles.jpg "La planche de vues gratuite dessinée par easyrender à partir de cette photo, sans retouche. Le dos et le dessus sont déduits de la photo, qui ne les montrait pas.")

Certains problèmes sont interceptés avant l'affichage : nos contrôles refusent une planche de moins de 768 pixels, un objet absent de plus de deux cases ou plus de trois vues presque identiques parmi les huit vues autour de l'objet.

Ce dernier contrôle vient de nos essais. Sur de petites copies en niveaux de gris, deux vues réellement différentes s'écartent d'au moins 3 %, contre moins de 1 % pour une répétition. Une planche répétant la même photo n'apporte aucune autre vue pour la reconstruction.

Le comptage demande une personne : compare portes, tiroirs et pieds dans chaque case au vrai meuble avant de construire. Si la prévisualisation est incorrecte, change la photo ou ajoute une note plutôt que de relancer avec la même image.

Avec easyrender, une courte note peut préciser ce que la photo cache : « quatre portes », « dos ouvert », « poignées en laiton ». La planche ci-dessus est un vrai résultat issu de la photo de l'étape 1 ; deux prévisualisations par jour sont gratuites sans crédits ; tu ne dépenses des crédits que pour construire le modèle.

La prévisualisation gratuite porte un filigrane « easyrender.ai preview », absent de la planche ci-dessus. [Envoie une photo](/fr)

## Étape 4 : construis le modèle et télécharge les fichiers

Une fois la forme vérifiée, l'outil construit un modèle 3D texturé. La plupart exportent du GLB, format courant pour le web et Android. Beaucoup proposent aussi le fichier USDZ, ouvert par les iPhone et iPad dans AR Quick Look.

Notre construction demande une texture de 2048 pixels et renvoie un maillage avec un matériau, coloré par une image de couleur de base. C'est le cas le plus simple pour les visionneuses, bien en dessous des 10 matériaux maximum recommandés par Scene Viewer.

Les six modèles de notre galerie vont de 14 590 triangles pour un vase en argile à 69 910 pour une table de chevet à tiroirs. Tous restent sous les 100 000 triangles recommandés au maximum par [Scene Viewer de Google](https://developers.google.com/ar/develop/scene-viewer).

![Le fauteuil en bouclette sous forme de modèle 3D texturé, construit à partir de la photo de l'étape 1 et affiché dans une visionneuse](/showcase/armchair.glb "Le modèle construit par easyrender à partir de cette photo et de sa planche de vues, textures compressées pour cette page : 25 879 triangles, 538 KB. Fais-le tourner pour vérifier le dos, puis regarde le tissu sous une lumière neutre avant publication.")

Un GLB s'ouvre dans Blender via File, Import, glTF 2.0 et dans des visionneuses gratuites comme [Babylon.js Sandbox](https://sandbox.babylonjs.com/). Dans Blender, active Statistics dans les superpositions de la vue pour lire le nombre de triangles. Ouvre toujours le fichier avant de l'utiliser et fais-le tourner lentement.

easyrender fournit les deux fichiers pour chaque modèle terminé. Le fichier USDZ est converti depuis le GLB dans ton navigateur au téléchargement : ils correspondent donc toujours. La réalité augmentée arrive bientôt ; ses visionneuses utilisent la taille inscrite dans le fichier, alors garde les dimensions mesurées dans l'annonce.

Le contenu de chaque format est expliqué dans [le guide du fichier GLB](/fr/guides/fichier-glb) et [celui du fichier USDZ](/fr/guides/fichier-usdz).

## Quels problèmes rencontreras-tu et comment les corriger ?

La plupart des erreurs remontent à la photo. Voici nos vérifications, du symptôme à sa correction.

| Symptôme                                            | Cause                                                                                                                                                                              | Correction                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Photo refusée comme trop petite                     | Petit côté sous 400 pixels, souvent une miniature ou une capture d'écran                                                                                                           | Utilise l'original de l'appareil ou du fournisseur, sous 4 MB                |
| Photo refusée comme trop étroite                    | Image plus de quatre fois plus large que haute, par exemple un recadrage en bannière                                                                                               | Recadre sur l'objet, avec une marge partout                                  |
| Deux pieds de chaise se confondent                  | La photo de face cache les pieds arrière derrière ceux de devant                                                                                                                   | Prends une vue de trois quarts où les quatre pieds sont séparés              |
| Quatre portes deviennent trois                      | Joints entre les portes peu contrastés                                                                                                                                             | Éclaire la façade en lumière rasante ou écris « quatre portes » dans la note |
| Le dos ressemble à l'avant                          | La photo ne montrait que l'avant, qui sert donc de référence pour le dos                                                                                                           | Précise « dos ouvert » ou « dos uni », ou montre un angle arrière            |
| Le cannage devient un motif imprimé                 | Une photo ne montre pas ce qui se trouve derrière les ouvertures                                                                                                                   | Accepte-le pour une petite visionneuse ou utilise la photogrammétrie         |
| Le tissu paraît plus jaune ou sombre                | Éclairage différent de la photo, ou Metallic non défini, dont la valeur glTF par défaut est entièrement métallique                                                                 | Vérifie sous une lumière neutre et règle Metallic sur 0 dans Blender         |
| Des facettes apparaissent sous une lumière latérale | Absence de normales de sommets ; les visionneuses calculent des normales plates, conformément à la [spécification glTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) | Applique Shade Smooth dans Blender et exporte à nouveau                      |

## Comment savoir si le modèle est prêt à être publié ?

Fixe tes critères avant de regarder. Chacun de ces contrôles appelle une réponse claire, oui ou non.

1. Le nombre de pieds, portes, tiroirs et poignées correspond au produit.
2. Le dos et le dessous ressemblent au vrai meuble pour quelqu'un qui le possède.
3. La texture reste correcte en plein écran, pas seulement en miniature.
4. Le fichier s'ouvre dans une visionneuse web, sur un iPhone et sur un téléphone Android.
5. Le fichier respecte sa destination : [Shopify](https://help.shopify.com/en/manual/products/product-media/product-media-types) accepte jusqu'à 500 MB, tandis que Scene Viewer recommande 10 MB et 100 000 triangles.

Un échec au contrôle 1 ou 2 renvoie à l'étape 1, avec une nouvelle photo ou une note. Un échec au contrôle 5 demande seulement une compression, expliquée dans le guide GLB.

## Ce qu'une seule photo ne permet pas de connaître

Une photo ne donne pas les dimensions mesurées de l'objet. Si l'acheteur en a besoin, inscris-les dans l'annonce.

Les détails minuscules sont difficiles à lire sur une photo : petit logo, poignées fines en laiton ou texte imprimé sur une boîte. Le rotin ajouré devient souvent un motif sur une surface pleine, car une seule image ne montre pas ce qui se trouve derrière chaque ouverture.

Verre, miroirs et chrome poli gênent toutes les méthodes, photogrammétrie comprise, car leur surface montre les alentours plutôt qu'elle-même. Ces outils traitent un objet à la fois, pas une pièce meublée.

## FAQ

### Combien de photos faut-il pour un modèle 3D ?

Une seule pour l'image-vers-3D par IA : les côtés hors champ sont déduits de cette photo. La photogrammétrie mesure chaque face et demande au moins 20 photos qui se recouvrent, souvent 100 ou plus pour un meuble détaillé. Elle restitue mieux les surfaces si tu disposes de l'objet et peux en faire le tour.

### Quelle résolution doit avoir la photo ?

Prévois au moins 800 pixels sur le petit côté, davantage si possible. easyrender refuse les photos sous 400 pixels, avertit sous 800 et contrôle leur netteté. Ensuite, zoome à 100 % sur un bord : si la photo ne montre pas le grain ou le tissage, ces détails ne peuvent pas être transmis au modèle.

### L'image-vers-3D est-elle la même chose que la photogrammétrie ?

Non : la photogrammétrie mesure l'objet à partir de nombreuses photos réelles ; chaque surface a été vue par l'appareil. L'image-vers-3D part d'une seule image et en déduit les faces hors champ. La première exige l'objet sur place ; la seconde fonctionne avec une photo de catalogue d'un meuble que tu n'as jamais manipulé.

### Transformer une photo en modèle 3D est-il gratuit ?

L'essai l'est souvent, le fichier final rarement. Les outils proposent généralement une formule ou une prévisualisation gratuite, puis facturent le modèle ou l'abonnement. Chez easyrender, deux prévisualisations d'angles par jour sont gratuites sans crédits ; le modèle terminé coûte {{renderCredits}} crédits, soit {{renderPrice}} à {{creditPrice}} par crédit, selon la page des tarifs.

### Peut-on imprimer en 3D un modèle issu d'une photo ?

Considère-le comme un modèle pour écran, pas pour impression : la photo ne montre pas chaque face et ne donne aucune dimension mesurée. easyrender exporte des fichiers GLB et USDZ pour le web et la réalité augmentée, pas de STL ni de fichier d'impression. Pour fabriquer une pièce, utilise la CAO et de vraies mesures.
