---

group: how-to-make-a-3d-model
title: Comment faire un modèle 3D : cinq méthodes
description: Comment faire un modèle 3D : compare cinq méthodes, de Blender à l'IA depuis une photo, selon ton objet, le temps disponible et les erreurs à éviter.
date: 2026-11-16
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: comment faire un modèle 3d
cta: Si tu as une photo nette d'une chaise, d'une lampe ou d'un buffet, vérifie tous les angles avant de décider de construire le modèle.
---

Tu peux créer un modèle 3D de cinq façons : le modéliser dans Blender, utiliser la photogrammétrie, scanner l'objet avec le LiDAR d'un téléphone, partir d'une photo avec l'IA ou faire appel à un artiste 3D. Le choix dépend de trois choses : l'objet existe-t-il, l'as-tu devant toi et combien de temps peux-tu y consacrer ?

![Illustration d'un cavalier d'échecs en noyer, visage et avant en bois sculpté, dos en argile grise mate avec un maillage blanc, sur fond sombre](/blog/illustrations/how-to-make-a-3d-model/hero.webp "Illustration, pas un résultat easyrender : un cavalier d'échecs dessiné moitié en noyer, moitié en argile avec un maillage blanc.")

## Quelle méthode choisir ?

Si l'objet n'existe pas encore, construis-le dans un logiciel ou fais appel à un artiste. S'il existe et se trouve devant toi, scanne-le. Si tu n'en as qu'une photo, utilise l'image-vers-3D.

![Arbre de décision : objet inexistant, logiciel ou artiste ; seulement une photo, IA image-vers-3D ; objet accessible, LiDAR pour les grandes formes simples ou photogrammétrie pour les détails](diagram:method-decision-tree "Les trois questions qui guident le choix dans le tableau suivant. Un artiste 3D convient aussi chaque fois que le modèle doit être exact.")

En général, plus tu consacres de temps au modèle, plus il sera précis. Un artiste travaillant avec des mesures produit le modèle le plus exact. Partir d'une photo est plus rapide, mais les côtés hors champ sont déduits de cette seule image.

| Méthode                  | Ce qu'il te faut                                   | Ton temps                                          | Convient surtout à                           | Points à surveiller                                     |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| Logiciel de modélisation | Semaines de pratique, photos de référence, mesures | Une journée ou plus par meuble après apprentissage | Objets qui n'existent pas encore             | Proportions, textures, dépliage UV                      |
| Photogrammétrie          | Objet sur place, 20 à 100 photos ou plus           | Une à deux heures de prise de vue, puis traitement | Détails réels de surface                     | Blanc uni, verre, métal poli                            |
| LiDAR sur téléphone      | iPhone Pro ou iPad Pro, objet sur place            | Quelques minutes à tourner autour                  | Grandes formes simples, comme un canapé      | Moins de détails sur les pieds tournés et sièges tissés |
| IA depuis une photo      | Une photo nette                                    | Vérification de la prévisualisation et du modèle   | Photo fournisseur d'un meuble inaccessible   | Photo d'un seul côté, aucune dimension mesurée          |
| Artiste 3D               | Photos, mesures et budget                          | Préparation du brief et validation des versions    | Modèle exact ou décliné en plusieurs tailles | Temps de préparation et de commande                     |

Ce guide ne couvre pas l'impression 3D : il traite des modèles pour écrans, fiches produit et réalité augmentée. Une pièce à fabriquer demande un modèle CAO construit à partir de mesures : c'est un autre travail.

Quelle que soit la méthode, vise les mêmes limites. Pour le web ou la réalité augmentée sur téléphone, [Scene Viewer de Google](https://developers.google.com/ar/develop/scene-viewer) recommande 100 000 triangles maximum, idéalement 30 000 à 50 000, des textures de 2048 pixels maximum et un fichier de 10 MB ou moins.

## Méthode 1 : modéliser toi-même dans un logiciel

Blender est gratuit, libre et exporte GLB, FBX, OBJ et USD. SketchUp facilite la création de meubles et de bâtiments : tu y [pousses et tires des formes planes](https://help.sketchup.com/en/sketchup/pushing-and-pulling-shapes-3d). [Tinkercad](https://www.tinkercad.com/help-center/what-is-tinkercad), gratuit dans le navigateur, est le point de départ le plus accessible pour les volumes simples.

Prévois plusieurs semaines de pratique avant qu'une chaise soit convaincante. Proportions et textures posent le plus de difficultés. Le dépliage UV, qui met une surface à plat pour y appliquer une image, bloque souvent les débutants.

Pour une table d'appoint simple, suis cet ordre :

1. Rassemble une photo de face, une de profil et les mesures réelles.
2. Construis les volumes avec des blocs et des cylindres : plateau, pieds, ceinture sous le plateau.
3. Biseaute légèrement les arêtes pour qu'elles accrochent la lumière comme le bois.
4. Déplie les UV et ajoute les matériaux : texture bois sur le plateau, métal sur les poignées.
5. Applique l'échelle et la rotation de l'objet pour conserver les valeurs à l'export.
6. Vérifie chaque côté, dessous compris, puis exporte en GLB.

![Une table d'appoint en trois étapes : blocs et cylindres, arêtes biseautées, puis texture bois avant export](diagram:blockout-side-table "Les étapes 2 à 6 sur une table simple. Dessin réalisé pour ce guide.")

Deux réglages évitent beaucoup d'erreurs. Dans Blender, Object, Apply, All Transforms avant l'export empêche une orientation ou une taille inattendue dans la visionneuse. Une texture en damier, placée avant la vraie texture, révèle immédiatement les UV étirés.

## Méthode 2 : la photogrammétrie

La photogrammétrie reconstruit un objet à partir de photos qui se recouvrent. [Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) en demande au moins 20, avec environ 70 % de recouvrement, en cercles à plusieurs hauteurs sous une lumière douce et uniforme. Les objets détaillés en demandent 100 ou plus.

![Un lampadaire entouré de positions d'appareil à trois hauteurs, basse, moyenne et haute, avec deux photos voisines dont les vues se recouvrent](diagram:photogrammetry-rings "Des cercles à plusieurs hauteurs et environ 70 % de recouvrement entre photos voisines, comme le demande Polycam.")

Pour réussir les prises de vue :

1. Choisis une lumière douce et uniforme : dehors par temps couvert, ou dans une pièce sans soleil direct.
2. Verrouille l'exposition du téléphone pour garder la même luminosité.
3. Fais le tour à trois hauteurs : basse, moyenne, puis haute en visant vers le bas, toujours en avançant à petits pas.
4. Cadre l'objet d'assez près : [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) demande qu'il occupe au moins la moitié de chaque image.
5. Ne déplace jamais l'objet pendant la séance : c'est toi qui bouges.

RealityScan commence le traitement après 20 images et en accepte jusqu'à 300. Son guide donne une limite claire : ce qui n'apparaît pas dans plusieurs images n'apparaîtra pas dans le modèle.

RealityScan et Polycam fonctionnent sur téléphone ; [Meshroom](https://alicevision.org/), libre, sur ordinateur. La photogrammétrie restitue bien les détails réels des surfaces, mais peine sur le blanc uni, le verre et le métal poli : elle doit retrouver des points texturés d'une photo à l'autre.

Le comparatif [photogrammétrie ou IA depuis une photo](/compare/photogrammetry-software) explique quand cette préparation vaut le coup.

## Méthode 3 : le scan LiDAR sur téléphone

Les iPhone Pro depuis l'iPhone 12 Pro et les iPad Pro récents possèdent un [capteur LiDAR](https://www.apple.com/newsroom/2020/03/apple-unveils-new-ipad-pro-with-lidar-scanner-and-trackpad-support-in-ipados/) qui mesure directement la profondeur. Des applications comme Polycam construisent un modèle pendant que tu tournes autour de l'objet.

Le LiDAR va vite et convient aux grandes formes simples, comme un canapé. Il enregistre moins de détails que la photogrammétrie : pieds tournés et assises tissées paraissent bosselés.

Avance lentement à distance régulière dans une pièce bien éclairée : la profondeur vient du capteur, mais la couleur vient de l'appareil photo. Éloigne d'abord un canapé du mur, sinon son dos ne sera pas capturé.

## Méthode 4 : générer le modèle avec l'IA

L'IA peut partir d'une photo, en image-vers-3D, ou d'une description écrite, en texte-vers-3D. La première conserve l'aspect d'un produit réel. La seconde invente un objet : utile pour un concept, inadapté pour représenter ce que tu vends.

Dans tous les outils, pars d'une photo nette de l'objet entier sur fond uni, puis vérifie les côtés hors champ avant de garder le résultat. Les étapes figurent dans [la modélisation 3D à partir d'une photo](/fr/guides/creer-un-modele-3d-a-partir-de-photos).

![Un vase en grès mat photographié de face sur fond blanc pour le catalogue](/showcase/vase.jpg "La seule photo de départ.")
![Le modèle 3D du vase en grès clair construit à partir de cette photo, dans une visionneuse](/showcase/vase.glb "Le modèle construit par easyrender via une planche de vues gratuite, textures compressées pour cette page : 16 708 triangles. Fais-le tourner pour vérifier le dos, absent de la photo.")

Parmi ces outils, easyrender dessine d'abord gratuitement neuf vues : huit autour de l'objet par pas de 45 degrés et une du dessus. Il construit ensuite le modèle, pour {{renderCredits}} crédits ({{renderPrice}}). [Envoie une photo](/fr)

Il traite un objet à la fois : meuble, objet de décoration ou extérieur de bâtiment. Meshy et Tripo transforment aussi les images en modèles 3D et ajoutent le texte-vers-3D, avec leurs propres tarifs. Les pages [alternative à Meshy pour les photos produit](/compare/meshy) et [alternative à Tripo](/compare/tripo) les examinent.

Pour comparer deux outils, utilise la même photo, affiche les résultats côte à côte et vérifie ces cinq points :

1. Dos et dessous : cohérents avec la construction visible ou décor inventé ?
2. Nombre de pieds, portes, tiroirs et poignées.
3. Texture en plein écran.
4. Nombre de triangles et poids du fichier face aux limites précédentes.
5. Coût du modèle terminé et présence d'une prévisualisation avant paiement.

## Méthode 5 : faire appel à un artiste 3D

Un artiste modélise l'objet à partir de tes photos et de tes mesures. Choisis cette méthode si le modèle doit être exact, par exemple un canapé vendu en trois largeurs, ou pour le produit phare d'une campagne publicitaire.

Un brief précis réduit les échanges. Prévois :

- Des photos de tous les côtés et des gros plans de chaque matière et finition.
- Les dimensions prises au mètre ruban.
- Les formats : GLB et USDZ pour une fiche produit.
- Les limites : 30 000 à 50 000 triangles, textures de 2048 pixels maximum et le moins de matériaux possible.
- Le fichier source, comme le .blend, pour tes modifications futures.

Fiverr et Upwork proposent des prestataires en modélisation produit. Demande un modèle d'exemple, idéalement de la même catégorie, avant de commander tout un catalogue. Coût, délais et choix de méthode sont détaillés dans [artiste 3D ou IA](/compare/3d-modeler-vs-ai).

## Combien coûte un modèle 3D ?

Un logiciel gratuit demande du temps. Un artiste facture au modèle selon la complexité. Applications de scan et outils IA facturent au modèle ou par abonnement, souvent après une formule ou une prévisualisation gratuite.

Chez easyrender, un crédit coûte {{creditPrice}} ; l'achat à l'usage commence à {{paygMinCredits}} crédits. Pro coûte {{proPrice}} par mois pour {{proCredits}} crédits. Les crédits n'expirent pas.

## Comment vérifier un modèle terminé ?

Quelle que soit la méthode, ouvre le fichier et regarde le dessous et le dos, où se cachent les erreurs. Reprends ensuite la même liste :

1. Fais tourner lentement le modèle en plein écran, en t'arrêtant sur le dos et le dessous.
2. Compare le nombre de pièces au vrai meuble.
3. Zoome sur les textures : un tissu convaincant en miniature peut être flou de près.
4. Lis le nombre de triangles et le poids, puis compare aux limites précédentes.
5. Ouvre le modèle sur téléphone en connexion mobile et essaie la réalité augmentée sur iPhone et Android.

Pour une fiche produit, il faut généralement deux fichiers : GLB pour le web et Android, USDZ pour Apple. [Le guide GLB](/fr/guides/fichier-glb) explique ouverture, contrôle et compression ; [le guide USDZ](/fr/guides/fichier-usdz) couvre les appareils Apple.

## Exemple : un lampadaire, trois méthodes

Prends un lampadaire avec abat-jour en lin et tige en laiton. Dans Blender, un débutant peut construire les volumes en une après-midi. Donner au lin son aspect réel prend beaucoup plus longtemps.

La photogrammétrie peine avec le laiton poli, qui reflète la pièce et perturbe les correspondances. Les professionnels du scan matifient parfois les parties brillantes avec un spray temporaire, ce que tu éviterais sur un meuble à vendre.

L'image-vers-3D tire d'une bonne photo de catalogue la forme générale et la couleur de l'abat-jour. Vérifie la tige : une partie aussi fine peut être difficile à lire sur l'image et devenir plus épaisse ou courbée.

Notre choix : l'image-vers-3D si tu n'as que la photo du fournisseur, la photogrammétrie avec le laiton masqué si tu possèdes la lampe, un artiste si elle est au centre de ta campagne.

## Quelles erreurs rencontre-t-on avec chaque méthode ?

Chaque méthode a ses difficultés et des causes habituelles. Voici comment examiner un résultat incorrect.

| Méthode             | Symptôme                               | Cause                                         | Correction                                                            |
| ------------------- | -------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| Logiciel            | Modèle tourné ou de taille inattendue  | Échelle et rotation non appliquées            | Applique toutes les transformations puis réexporte                    |
| Logiciel            | Fil du bois étiré sur une face         | Mauvais dépliage UV                           | Vérifie avec un damier et déplie cette face à nouveau                 |
| Photogrammétrie     | Trous dans un plateau blanc uni        | Aucun repère entre les photos                 | Photographie par temps couvert ou choisis une autre méthode           |
| Photogrammétrie     | Dessous absent ou confondu avec le sol | Dessous jamais photographié                   | Accepte-le ou fais une seconde séance avec l'objet couché             |
| LiDAR               | Pieds fins bosselés ou absents         | Détails trop fins pour le capteur             | Choisis la photogrammétrie pour ce meuble                             |
| IA depuis une photo | Dos différent du vrai meuble           | Cette face était absente de la photo          | Utilise une photo de trois quarts ou ajoute une note sur le dos       |
| IA depuis une photo | Logo ou étiquette flous                | Détails difficiles à lire sur une seule photo | Garde le logo dans les photos plutôt que dans le modèle               |
| Artiste             | Retard ou modèle incorrect             | Brief sans dimensions, formats ou limites     | Fournis photos, mesures, formats et nombre de triangles dès le départ |

## Quelles limites pour chaque méthode ?

Une photo ne fournit pas de dimensions mesurées. Un scan ne capture pas ce que l'appareil ne voit pas, par exemple le dessous d'un canapé posé au sol. Modéliser soi-même demande un apprentissage ; faire appel à un artiste demande du temps pour préparer et suivre la commande.

Les cinq méthodes traitent un objet à la fois ; une pièce entièrement meublée est un autre projet. [La 3D pour l'e-commerce](/fr/guides/modeles-3d-e-commerce) compare les méthodes pour un catalogue ; [vendre des meubles vintage](/fr/guides/vendre-des-meubles-vintage) traite les pièces uniques.

## FAQ

### Faut-il apprendre Blender pour faire un modèle 3D ?

Non : scan et image-vers-3D produisent un modèle sans modélisation manuelle. Il faut quand même examiner dos, textures et parties fines pour distinguer un résultat utilisable d'un objet déformé. Apprendre Blender devient utile si tu as souvent besoin de modèles exacts et modifiables d'objets qui n'existent pas encore, avec des dimensions précises.

### Combien de temps faut-il pour créer un modèle 3D ?

La méthode compte plus que l'objet : l'image-vers-3D et le scan au téléphone te mobilisent le moins longtemps ; la photogrammétrie exige une à deux heures de photos, puis le traitement. Une chaise dans Blender peut prendre une journée après plusieurs semaines d'apprentissage. L'artiste te communique son propre délai de réalisation.

### Peut-on faire un modèle 3D avec une seule photo ?

Oui, avec un outil image-vers-3D : les côtés hors champ sont déduits de cette photo. Examine le dos et les détails fins dans la prévisualisation, surtout là où l'appareil ne les a pas vus. Une photo nette de trois quarts, montrant un seul objet entier sur fond uni, donne la meilleure base de travail.

### Est-ce la même chose qu'un modèle pour impression 3D ?

Non : un modèle pour l'écran ou la réalité augmentée doit avoir un aspect fidèle ; l'impression exige des mesures exactes et un volume fermé. L'image-vers-3D et la plupart des scans visent le premier usage. easyrender exporte GLB et USDZ, pas de STL ; pour fabriquer une pièce, utilise la CAO avec des mesures.

### Combien de triangles doit avoir un modèle 3D ?

Pour une fiche produit ou la réalité augmentée sur téléphone, vise 30 000 à 50 000 triangles et reste sous 100 000, selon Scene Viewer de Google. Nos modèles vont de 14 590 triangles pour un vase à 69 910 pour une table de chevet. Les scans sont généralement plus denses et nécessitent une simplification avant utilisation sur mobile.
