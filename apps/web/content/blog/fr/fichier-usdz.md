---

group: usdz-file
title: Fichier USDZ : comprendre AR Quick Look sur iPhone
description: Un fichier USDZ ouvre un modèle 3D en réalité augmentée sur iPhone : contenu, ouverture, création et taille affichée dans Quick Look.
date: 2026-11-17
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: fichier usdz
cta: Choisis une photo nette d'un seul meuble, table d'appoint en chêne ou lampadaire, et vérifie tous les angles avant de dépenser un crédit.
---

Un fichier USDZ regroupe un modèle 3D au format USD de Pixar dans une archive zip non compressée. Apple l'utilise pour AR Quick Look : depuis Safari, Fichiers, Mail ou Messages, un iPhone ou iPad ouvre le modèle et le place dans la pièce via l'appareil photo. Android ne lit pas directement le fichier USDZ.

![Illustration d'une lampe champignon lumineuse près d'un téléphone posé à plat, moitié éclairée chaudement et moitié en argile grise mate avec un maillage blanc, sur fond sombre](/blog/illustrations/usdz-file/hero.webp "Illustration, pas un résultat easyrender : une lampe dessinée moitié éclairée, moitié en argile avec un maillage blanc, près d'un téléphone.")

## Que contient un fichier USDZ ?

USD est le format de scène créé par Pixar pour le cinéma. La [spécification USDZ](https://openusd.org/release/spec_usdz.html) décrit un zip sans compression contenant des couches USD et leurs images. Chaque fichier commence à un multiple de 64 octets, ce qui permet une lecture directe sans extraction.

![Un USDZ représenté comme une archive zip sans compression, contenant une couche USD avec maillage et matériaux, ainsi que ses images de texture](diagram:usdz-anatomy "La structure décrite par la spécification USDZ. Sans compression, l'iPhone lit directement chaque partie dans l'archive.")

Les couches USD utilisent deux encodages : .usda est un texte lisible, .usdc est binaire. Les textures sont généralement en PNG ou JPEG. Le choix de l'outil d'export détermine une grande partie du poids final.

Apple a [présenté le format USDZ avec ARKit 2](https://www.apple.com/newsroom/2018/06/apple-unveils-arkit-2/) à la WWDC de juin 2018 pour iOS 12, avec AR Quick Look. Depuis, les appareils Apple attendent ce format pour la réalité augmentée lancée depuis une page ou un message.

## Qu'est-ce qui détermine le poids d'un USDZ ?

Deux choix d'export : la géométrie en texte .usda demande plusieurs fois plus d'octets que le même maillage en binaire .usdc, chaque nombre étant écrit en chiffres. Les textures comptent aussi : une image photographique en PNG sans perte pèse généralement plusieurs fois son équivalent JPEG.

La spécification liste notamment PNG et JPEG, mais pas WebP. Les textures WebP d'un GLB sont donc converties lors du passage au format USDZ ; le format choisi par le convertisseur détermine leur augmentation de poids.

| Choix d'export          | Plus léger                          | Plus lourd                         |
| ----------------------- | ----------------------------------- | ---------------------------------- |
| Géométrie               | Binaire .usdc                       | Texte .usda                        |
| Format des textures     | JPEG, sauf besoin de transparence   | PNG                                |
| Dimensions des textures | 1024 ou 2048 pixels                 | 4096 pixels                        |
| Maillage                | Simplifié pour l'écran du téléphone | Tous les triangles d'un scan dense |

Aucun de ces choix n'est une erreur : Quick Look lit les deux encodages et les deux formats d'image. Mais plusieurs mégaoctets supplémentaires ralentissent l'envoi dans Messages et le chargement en connexion mobile.

## Comment vérifier le contenu d'un USDZ ?

Comme c'est un zip, `unzip -l side-table.usdz` liste les fichiers et leur poids. Tu vois immédiatement si la géométrie est en .usda ou .usdc et si les textures sont PNG ou JPEG. Sans compression, les poids affichés correspondent aux tailles réelles.

Extrais ensuite une copie et ouvre sa couche principale .usda dans un éditeur de texte. `metersPerUnit` et `upAxis` indiquent la taille d'affichage et l'orientation ; une ligne d'ancrage précise si Quick Look place le modèle sur une surface horizontale, comme le sol, ou verticale, comme un mur.

Demande à l'exporteur une géométrie binaire .usdc, des textures JPEG sauf transparence nécessaire et 2048 pixels maximum. Compare le résultat au poids du GLB, puis ouvre-le dans Quick Look sur Mac avant publication.

## Quelle visionneuse pour ouvrir un fichier USDZ ?

Cela dépend de ton appareil :

- iPhone et iPad : touche le fichier dans Safari, Fichiers, Mail ou Messages ; Quick Look propose une vue Objet et une vue en réalité augmentée.
- Mac : sélectionne-le dans Finder et appuie sur la barre d'espace pour l'aperçu Quick Look.
- Windows et Android : pas de visionneuse intégrée ; [Blender 3.5 et versions ultérieures](https://developer.blender.org/docs/release_notes/3.5/pipeline_assets_io/) importe le fichier USDZ.

[La page Quick Look d'Apple](https://developer.apple.com/augmented-reality/quick-look/) cite Safari, Messages, Mail, News et Notes parmi les applications compatibles, dès iOS 12 ou iPadOS 12. Pour Android ou le navigateur, prends plutôt la version GLB. [Le guide GLB](/fr/guides/fichier-glb) explique cet usage.

<!-- IMAGE PENDING: a real iPhone screenshot of an easyrender USDZ (for example the bouclé armchair) open in Quick Look's Object view, unretouched. Not the AR view until AR is tested on device (REQ-00). -->

## Comment fonctionne AR Quick Look depuis une page web ?

La page lie le fichier USDZ avec `rel="ar"` autour d'une image d'aperçu ; Safari ajoute alors un badge de réalité augmentée. Le [guide WebKit](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) montre le balisage. Un appui sur l'image ouvre le modèle dans la pièce, sans application à installer.

Quatre détails doivent être respectés :

1. Héberge le fichier USDZ en HTTPS avec le type de contenu `model/vnd.usdz+zip`, attendu par Safari.
2. Entoure l'image d'un lien vers le fichier : `<a rel="ar" href="side-table.usdz"><img src="side-table.jpg"></a>`.
3. Donne au lien un seul enfant, `img` ou `picture`, sans autre contenu.
4. Vérifie la compatibilité avec `a.relList.supports("ar")` et propose un simple téléchargement si le résultat est faux.

Le composant libre [model-viewer](https://modelviewer.dev/) de Google gère les deux systèmes : il affiche un GLB dans la page et transmet un USDZ aux iPhone pour Quick Look.

![Deux accès à AR Quick Look sur iPhone : image avec badge dans Safari ou fichier USDZ dans Messages, Mail ou Fichiers ; tous deux donnent les vues Objet et réalité augmentée](diagram:quick-look-path "Les deux chemins ouvrent les mêmes vues. Le modèle prend la taille inscrite dans son fichier ; pour un modèle issu d'une photo, elle ne vient pas d'une mesure.")

Quick Look utilise la taille inscrite dans le fichier. Si personne ne l'a mesurée, l'objet peut paraître plus grand ou plus petit que le meuble. L'acheteur peut aussi pincer pour le redimensionner.

## Comment créer un fichier USDZ ?

Quatre méthodes courantes se distinguent par l'appareil utilisé et le travail qu'elles permettent.

| Outil                               | Où l'utiliser                 | Intérêt                                          | À vérifier                                      |
| ----------------------------------- | ----------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| Reality Converter d'Apple           | Mac                           | Contrôler les matériaux avant export             | Mac uniquement                                  |
| Blender 3.5 et versions ultérieures | Mac, Windows, Linux           | Modifier le modèle avant export                  | Certains matériaux paraissent plus plats en USD |
| Exporteur USDZ de three.js          | Tout navigateur               | Sans serveur, USDZ correspondant toujours au GLB | Poids et matériaux dans Quick Look              |
| Shopify                             | Administration de la boutique | Créer GLB et USDZ pour chaque modèle envoyé      | Résultat décidé par la plateforme               |

Reality Converter [convertit notamment OBJ, glTF, FBX et USD](https://developer.apple.com/videos/play/wwdc2022/10141/) au format USDZ. Dans Blender, choisis File, Export, Universal Scene Description et donne l'extension .usdz au fichier.

Notre choix : si tu modifies tes modèles, exporte depuis Blender et contrôle dans Quick Look sur Mac. Sur Shopify, envoie le GLB et laisse la plateforme créer le fichier USDZ. Pour ton propre site, l'export navigateur garde une source unique ; compare son poids au GLB.

Si tu pars d'une photo, certains outils image-vers-3D fournissent directement GLB et USDZ. Tu évites alors la conversion ; les étapes figurent dans [la modélisation 3D à partir d'une photo](/fr/guides/creer-un-modele-3d-a-partir-de-photos).

Pour chaque modèle terminé, easyrender fournit les deux fichiers. La réalité augmentée arrive bientôt : tu pourras ouvrir le meuble sur ton téléphone et le voir dans ta pièce. Garde les dimensions mesurées dans le texte produit, puisque l'affichage utilise la taille inscrite dans le fichier.

## Exemple : une table d'appoint en chêne sur iPhone

Envoie-toi le fichier USDZ d'une table d'appoint en chêne dans Messages et touche le fichier. Quick Look ouvre d'abord la vue Objet, où tu peux le tourner d'un doigt. Passe en réalité augmentée, vise le sol et touche l'endroit où placer la table.

Fais-en le tour et regarde où les pieds rencontrent le sol. Si la base du modèle est décalée, il semblera flotter.

![Une table ronde en bois massif sous forme de modèle 3D, à tourner pour examiner les pieds de chaque côté](/showcase/coffee-table.glb "Une table ronde en bois massif modélisée par easyrender depuis une photo, affichée ici en GLB : 16 228 triangles. Le fichier USDZ est créé depuis ce même GLB ; ils correspondent toujours. Fais tourner la table et vérifie la jonction des pieds avec le sol.")

Regarde ensuite le fil du bois sous ta propre lampe, dont la lumière est plus chaude que celle du studio de la photo d'origine.

## Quels problèmes avec un USDZ et comment les corriger ?

La plupart viennent de la façon de servir le fichier ou des choix du convertisseur. Pars du symptôme pour déterminer la correction.

| Symptôme                                                 | Cause                                                | Correction                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| Le lien télécharge au lieu d'ouvrir la réalité augmentée | `rel="ar"` absent ou mauvais type de contenu         | Ajoute `rel="ar"` et sers le fichier en `model/vnd.usdz+zip`                   |
| Pas de badge sur l'image                                 | Plusieurs enfants dans le lien ou iOS antérieur à 12 | Un seul enfant `img` ou `picture`, puis test sur iPhone récent                 |
| Objet immense ou minuscule                               | Dimensions du modèle jamais mesurées                 | Écris les dimensions dans le texte ; l'acheteur peut redimensionner en pinçant |
| Objet en suspension                                      | Base au-dessus de l'origine du modèle                | Place l'origine à la base dans Blender et réexporte                            |
| Couleurs plus plates que dans Blender                    | Matériau qui se traduit mal en USD                   | Contrôle dans Quick Look sur Mac et simplifie le matériau                      |
| Courbes facettées                                        | GLB source sans normales                             | Ajoute des normales lissées au GLB avant conversion                            |
| Fichier difficile à envoyer                              | Géométrie texte et textures PNG                      | Exporte en binaire avec textures JPEG et compare le poids                      |

## GLB vers USDZ : faut-il conserver les deux ?

Oui, pour une fiche produit : le GLB couvre le web et Android ; le fichier USDZ, la réalité augmentée Apple. Shopify accepte les deux comme médias produit et crée lui-même la version manquante.

[Comment faire un modèle 3D](/fr/guides/comment-faire-un-modele-3d) explique d'où viennent ces fichiers, quelle que soit la méthode. Pour ta boutique, [la 3D pour ecommerce](/fr/guides/modeles-3d-e-commerce) aide à choisir les produits concernés.

## FAQ

### Peut-on ouvrir un fichier USDZ sur Android ?

Pas directement : la réalité augmentée Android passe par Scene Viewer de Google, qui lit glTF et GLB plutôt que USDZ. Utilise donc une version GLB du même modèle. Si tu n'as que le fichier Apple, Blender 3.5 ou plus récent peut importer le fichier USDZ et exporter un GLB ; contrôle ensuite les matériaux.

### Peut-on convertir un USDZ en GLB ?

Oui : importe le fichier USDZ dans Blender 3.5 ou plus récent, puis exporte en glTF 2.0 au format binaire GLB. Vérifie le résultat dans une visionneuse : USD et glTF décrivent différemment les surfaces. Certains réglages, comme une couche de vernis sur un bois laqué, peuvent changer pendant la conversion entre les deux formats.

### Pourquoi un USDZ apparaît-il à une taille inattendue ?

AR Quick Look utilise la taille inscrite dans le fichier. Sans mesures à la création, comme avec une photo ou un scan sans référence, l'objet peut paraître plus grand ou plus petit que le meuble. Utilise la réalité augmentée pour observer son aspect dans la pièce ; garde les dimensions mesurées dans le texte.

### Pourquoi le fichier USDZ pèse-t-il plus que le GLB d'origine ?

Cela vient généralement du convertisseur : la géométrie en texte prend plusieurs fois le poids du binaire. La spécification USDZ ne liste pas WebP parmi ses formats d'image ; une petite texture peut donc devenir un PNG bien plus lourd. Exporte une géométrie binaire .usdc et des textures JPEG pour alléger le fichier.

### USDZ et USD sont-ils la même chose ?

Le fichier USDZ est un emballage pour USD. Une scène USD peut être un fichier texte .usda, un binaire .usdc ou plusieurs fichiers liés entre eux. Le fichier USDZ regroupe ces couches et leurs textures dans un seul zip sans compression, plus pratique à envoyer et à ouvrir sur un iPhone ou un iPad.
