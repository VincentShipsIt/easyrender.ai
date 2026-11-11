---

group: 3d-models-for-ecommerce
title: Modèle 3D pour ecommerce : méthodes, fichiers et coûts
description: Modèle 3D pour ecommerce : ce qu'il apporte à ta fiche produit, les fichiers GLB et USDZ, quatre méthodes et les vérifications avant publication.
date: 2026-11-13
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: modèle 3d pour ecommerce
cta: Choisis un meuble avec de la profondeur, fauteuil ou buffet, et vérifie tous les angles avant de décider si la 3D vaut le coup pour ta boutique.
---

Un modèle 3D pour ecommerce est généralement un fichier GLB ou USDZ que l'acheteur peut faire tourner à l'écran et placer dans sa pièce en réalité augmentée sur téléphone. Pour l'obtenir, ta boutique dispose de quatre méthodes : un artiste 3D, les fichiers CAO du fabricant, un scan du produit ou l'IA à partir d'une photo.

![Illustration d'un mocassin en cuir brun près de sa boîte, l'avant en cuir et le talon en argile grise mate avec un maillage blanc, sur fond sombre](/blog/illustrations/3d-models-for-ecommerce/hero.webp "Illustration, pas un résultat easyrender : un mocassin dessiné moitié en cuir, moitié en argile avec un maillage blanc, à côté de sa boîte.")

## Qu'apporte un modèle 3D à une fiche produit ?

Une photo montre l'angle que tu as choisi. Un modèle 3D laisse l'acheteur choisir : dos d'une bibliothèque, dessous d'une table basse, épaisseur du coussin d'un fauteuil.

![Un fauteuil pivotant gris rembourré, photographié de trois quarts depuis l'arrière pour le catalogue](/showcase/swivel-chair.jpg "La photo de catalogue : une vue de dos, choisie par le photographe.")
![Le même fauteuil pivotant gris en modèle 3D que l'acheteur peut tourner pour voir l'avant et l'assise](/showcase/swivel-chair.glb "Le modèle construit par easyrender à partir de cette photo : l'acheteur choisit sa vue. L'avant est déduit de la photo, qui ne montre que le dos.")

Sur iPhone et iPad, un fichier USDZ s'ouvre dans [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) et place l'objet dans la pièce via l'appareil photo. Sur Android, [Scene Viewer de Google](https://developers.google.com/ar/develop/scene-viewer) fait de même avec un GLB.

La réalité augmentée montre l'aspect d'un meuble dans une pièce. Sa taille vient du fichier, pas d'une mesure : Scene Viewer lit une unité comme un mètre, et un modèle issu d'une photo utilise la valeur inscrite dans son fichier. Les dimensions doivent donc figurer dans le texte produit.

## Comment mesurer l'intérêt de la 3D ?

Décide de ton objectif avant de payer un modèle. Pour une boutique de meubles, c'est souvent réduire les questions sur le dos et la profondeur, augmenter les ajouts au panier sur les fiches équipées ou diminuer les retours liés à l'aspect du meuble.

Nous ne publions pas de chiffres de conversion ou de retours liés à la 3D : nous n'en avons pas mesuré que nous puissions garantir. Considère tout chiffre lu ailleurs comme une hypothèse à tester sur ton catalogue.

Choisis cinq à dix produits avec modèle et un groupe comparable sans modèle. Garde prix, photos et textes inchangés dans les deux groupes pendant quatre à six semaines. Compare ensuite les ajouts au panier par vue produit et lis les motifs de retour.

Sur ton site, [model-viewer](https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/features/ar.ts) émet des événements utilisables dans tes statistiques. `camera-change` avec la source `user-interaction` indique que l'acheteur a tourné le modèle ; `ar-status` signale le démarrage ou l'échec d'une session de réalité augmentée. `quick-look-button-tapped` indique le passage d'un iPhone à Quick Look.

## Quels fichiers 3D faut-il à une boutique ?

Le GLB pour le web et Android, le fichier USDZ pour la réalité augmentée sur les appareils Apple. Les plateformes compatibles 3D acceptent généralement l'un ou les deux.

![Un modèle produit donne deux fichiers : GLB pour une fiche produit dans le navigateur et Scene Viewer sur Android, USDZ pour AR Quick Look sur iPhone et iPad](diagram:store-files "Un modèle, deux fichiers, trois points de consultation. Un site développé sur mesure peut fournir les deux avec model-viewer.")

### Les modèles 3D sur Shopify

[Shopify accepte les modèles 3D comme médias produit](https://help.shopify.com/en/manual/products/product-media/product-media-types), en GLB ou USDZ, jusqu'à 500 MB, au même endroit que les photos. Au-delà de 15 MB, la géométrie et les textures sont optimisées à l'envoi. Shopify convertit chaque modèle pour disposer des deux versions.

### WooCommerce et les sites sur mesure

Une boutique WooCommerce ajoute la 3D via une extension, comme [Arty 3D Viewer](https://woocommerce.com/products/arty-3d-viewer/). Sur un site sur mesure, le composant libre [model-viewer](https://modelviewer.dev/) de Google affiche le GLB ; `ar-modes="webxr scene-viewer quick-look"` dirige chaque téléphone vers sa visionneuse de réalité augmentée.

### Quelles limites de poids fixer à un modèle produit ?

Shopify accepte les gros fichiers, mais le téléphone de l'acheteur préfère les petits. Les recommandations Scene Viewer sont les plus précises que nous connaissions ; nous les comparons donc à nos propres fichiers.

| Critère   | Recommandation Scene Viewer                    | Les six modèles de notre galerie  |
| --------- | ---------------------------------------------- | --------------------------------- |
| Triangles | Jusqu'à 100 000, idéalement 30 000 à 50 000    | 14 590 à 69 910                   |
| Texture   | 2048 x 2048 maximum                            | Une texture de 1024 x 1024 chacun |
| Matériaux | Jusqu'à 10                                     | Un chacun                         |
| Poids     | 10 MB ; au-delà, l'expérience peut se dégrader | 308 448 à 1 287 432 octets        |

Scene Viewer liste aussi les extensions glTF prises en charge. Un fichier utilisant une extension absente, comme les textures WebP, peut ne pas s'ouvrir : pour Android, préfère des textures PNG ou JPEG. Ouvre-le sur un vrai téléphone Android avant de le relier à une fiche produit.

## Comment créer des modèles 3D de produits ?

Nous comparons quatre méthodes selon quatre critères : accès au produit, temps que tu dois y consacrer, fidélité des faces cachées et cas qui posent problème.

### Faire appel à un artiste 3D

L'artiste construit le modèle à partir de tes photos, dessins et mesures, sans avoir besoin du produit sur place. Cette méthode demande le plus de préparation et d'attente, mais donne le résultat le plus fidèle, puisque rien n'est deviné. Les devis Fiverr ou Upwork varient selon la complexité.

Notre choix : pour un modèle qui doit être exact, comme un canapé vendu en trois largeurs, ou un produit vedette de campagne.

### Utiliser les fichiers CAO du fabricant

Si tu vends tes propres créations, l'usine possède peut-être déjà des fichiers CAO ou SketchUp. Leur forme est précise, mais ils sont rarement prêts pour le web : il faut généralement ajouter les textures et réduire fortement les triangles pour un affichage fluide sur téléphone.

Notre choix : demande-les d'abord si tu possèdes les dessins. Prévois le nettoyage : un fichier d'usine peut dépasser largement les 100 000 triangles de Scene Viewer.

### Scanner le produit

Les applications de photogrammétrie comme Polycam et [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) assemblent des photos qui se recouvrent. RealityScan commence le traitement après 20 images et en accepte jusqu'à 300. Il faut avoir le meuble et pouvoir en faire le tour.

Notre choix : pour les meubles texturés dans ta réserve, comme une chaise en rotin ou un buffet en chêne. Le verre, les miroirs et le métal poli posent problème.

### Partir d'une seule photo avec l'IA

Les outils image-vers-3D, comme Meshy, Tripo et easyrender, partent d'une image. C'est la seule méthode possible avec une photo fournisseur sans accès au meuble. La photo ne montre qu'une partie de l'objet : vérifie donc le dos dans la prévisualisation avant de garder le modèle.

![Neuf vues d'un vase en grès mat dessinées à partir d'une photo produit](/showcase/vase-angles.jpg "Une planche de vues dessinée par easyrender à partir d'une photo de vase en grès, sans retouche. Un objet rond et mat représente un cas simple.")

Notre choix : pour un catalogue reposant sur des photos fournisseur. Petits logos, tissages ajourés et faces hors champ sont difficiles à lire sur une seule photo. [Comment faire un modèle 3D](/fr/guides/comment-faire-un-modele-3d) détaille chaque méthode, ses besoins et ses difficultés.

Le comparatif [artiste 3D ou IA](/compare/3d-modeler-vs-ai) oppose ces deux approches. Les pages [Meshy](/compare/meshy) et [Tripo](/compare/tripo) examinent deux outils plus précisément.

## Par où commencer pour une boutique de meubles ?

Classe tes produits avant de créer un modèle. Pose quatre questions pour chacun : le dos ou la profondeur comptent-ils, le prix fait-il hésiter, les clients demandent-ils d'autres angles et les retours mentionnent-ils l'aspect ?

Commence par les cinq produits les mieux placés. Ce sont souvent un fauteuil, un buffet ou un lampadaire à abat-jour travaillé. Une affiche encadrée ou un tapis gagne peu à passer en 3D.

Teste ensuite deux méthodes sur un produit, par exemple un scan au téléphone et un modèle image-vers-3D de la même lampe. Compare-les sur un téléphone : ce sera plus instructif qu'une liste de fonctionnalités.

Pour un grand catalogue, regarde le traitement par lot et le coût par modèle. easyrender permet de déposer plusieurs photos dans une bibliothèque, de vérifier gratuitement chaque prévisualisation et de ne construire que les modèles qui te conviennent.

## Comment ajouter la 3D à ta boutique, étape par étape ?

Voici l'ordre que nous suivrions pour un premier lot :

1. Choisis cinq produits avec les quatre questions précédentes.
2. Crée chaque modèle par la méthode adaptée.
3. Vérifie le nombre de pieds et de portes, le dos et les textures en plein écran.
4. Respecte les limites : textures de 2048 pixels ou moins, géométrie compressée si ta visionneuse le permet.
5. Envoie les fichiers avec les outils de la plateforme, comme les médias produit Shopify.
6. Ouvre chaque page sur un iPhone et un Android en connexion mobile, puis essaie la réalité augmentée sur les deux.
7. Mesure les résultats pendant quatre à six semaines avant de choisir le lot suivant.

## Exemple : un buffet en noyer

Imagine trois photos fournisseur d'un buffet en noyer : face, trois quarts et gros plan des poignées en laiton. Pour l'image-vers-3D, choisis celle de trois quarts : elle montre la profondeur et un panneau latéral.

![Trois photos fournisseur dessinées : face sans profondeur, trois quarts montrant la façade et un côté, signalée comme le choix à faire, et gros plan d'une poignée](diagram:sideboard-photo-pick "Seule la vue de trois quarts montre le panneau latéral : la photo laisse donc moins de profondeur à déduire. Dessin pour cet exemple, pas une vraie annonce.")

Portes, pieds et fil du bois doivent rester lisibles. Compare les poignées au gros plan, car la petite quincaillerie perd d'abord du détail, quelle que soit la méthode. Vérifie particulièrement le dos, absent de la photo.

Envoie ensuite le GLB avec les outils de ta plateforme et ouvre la page sur iPhone et Android avant publication. Sur Shopify, le fichier USDZ pour iPhone est créé à partir de ce même envoi.

## Quels problèmes apparaissent quand une boutique ajoute la 3D ?

Beaucoup ne se voient que sur un vrai téléphone, d'où l'étape 6. Voici les symptômes à contrôler et leur correction.

| Symptôme                                            | Cause                                                            | Correction                                                                                                                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pas de bouton de réalité augmentée sur Android      | Scene Viewer exige HTTPS, ou le téléphone n'est pas compatible   | Sers le GLB en HTTPS et teste un second téléphone                                                                                                                         |
| Pas de réalité augmentée sur iPhone depuis ton site | USDZ absent ou mauvais type de contenu                           | Ajoute le fichier USDZ et sers-le comme `model/vnd.usdz+zip`, [type attendu par Safari](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) |
| Objet minuscule ou immense                          | Taille inscrite dans le fichier, sans mesure préalable           | Écris les dimensions dans le texte ; l'acheteur peut pincer pour redimensionner                                                                                           |
| Meuble en suspension au-dessus du sol               | Base du modèle au-dessus de son origine                          | Place l'origine à la base dans Blender avant l'export                                                                                                                     |
| Page lente en connexion mobile                      | Textures de 4096 pixels ou géométrie non compressée              | Textures de 2048 ou 1024, compression Draco ou Meshopt si compatible                                                                                                      |
| Modèle sombre ou sale en réalité augmentée          | Ombres inscrites dans la texture, déconseillées par Scene Viewer | Utilise une texture sans ombres intégrées et Metallic à 0 si non défini                                                                                                   |
| GLB impossible à ouvrir dans Scene Viewer           | Extension glTF absente de sa liste, comme les textures WebP      | Exporte une version simple avec des textures PNG ou JPEG                                                                                                                  |

## Quelles limites connaître pour la 3D en ecommerce ?

Un modèle issu d'une photo représente forme et matières, sans dimensions mesurées. Garde celles-ci dans le texte produit et ne demande pas à la réalité augmentée de remplacer les mesures prises chez l'acheteur.

Les objets transparents ou réfléchissants, comme un vase en verre ou une lampe chromée, sont difficiles à saisir par toutes les méthodes. Petits textes et logos sont aussi difficiles à lire sur une seule photo.

La 3D ne remplace pas les photos : les plateformes utilisent toujours des images fixes dans les recherches, publicités et grilles de catégories. Les bases de [photographie produit](/fr/guides/photographie-produit-e-commerce) restent donc utiles.

## FAQ

### Faut-il des modèles 3D pour ta boutique en ligne ?

Pas pour tous les produits : la 3D aide surtout quand l'acheteur veut voir la profondeur et le dos d'une chaise, d'un canapé, d'un buffet ou d'une lampe. Pour les objets plats, de bonnes photos suffisent. Commence par quelques produits qui suscitent des demandes d'angles supplémentaires, puis évalue avant de convertir tout le catalogue.

### Quel format 3D faut-il à une boutique en ligne ?

Deux, généralement : le GLB pour le web et la réalité augmentée sur Android, le fichier USDZ pour AR Quick Look sur iPhone et iPad. Shopify accepte les deux et crée la version manquante. Si ton outil n'en fournit qu'une, Reality Converter d'Apple sur Mac ou Blender peut produire l'autre ; vérifie ensuite les matériaux.

### Quel poids viser pour un modèle 3D produit ?

Un poids adapté à un téléphone en connexion mobile. Scene Viewer recommande 10 MB maximum, 100 000 triangles et des textures de 2048 pixels ; son idéal est de 30 000 à 50 000 triangles. Shopify accepte jusqu'à 500 MB et optimise au-delà de 15 MB, mais un fichier léger reste plus rapide à charger.

### Combien coûte un modèle 3D pour ecommerce ?

Le coût dépend de la méthode : devis selon la complexité pour un artiste, abonnement pour les applications de scan, paiement au modèle ou au mois pour l'IA. Chez easyrender, la prévisualisation est gratuite et le modèle coûte {{renderCredits}} crédits ({{renderPrice}}), achetés à l'usage ou avec Pro : {{proCredits}} crédits mensuels pour {{proPrice}}.

### Quelle taille a un produit affiché en réalité augmentée ?

La plupart des téléphones récents peuvent l'afficher : iPhone et iPad avec AR Quick Look et USDZ, Android avec Scene Viewer et GLB. La taille provient toutefois du fichier. Elle ne correspond aux dimensions du meuble que si des mesures ont servi à le construire ; une photo seule ne fournit pas ces mesures.
