---

group: glb-file
title: "File GLB: cos'è, come aprirlo e come usarlo"
description: "Un file GLB è un modello 3D in glTF 2.0 binario: cosa contiene, come aprirlo, controllarlo e ridurne il peso per web e Android."
date: 2026-11-15
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: file glb
cta: Con una foto nitida di una lampada o di una sedia puoi controllare tutti gli angoli prima di creare il GLB.
---

Un file GLB è un modello 3D salvato nella versione binaria di glTF 2.0, formato aperto del Khronos Group. Racchiude geometria, materiali, texture ed eventuali animazioni in un solo file, senza risorse esterne da caricare. È il formato abituale per i modelli nelle pagine prodotto e per la realtà aumentata su Android.

![Illustrazione di una teiera celadon, metà smaltata e metà in argilla grigia con reticolo bianco e pannelli UV che si staccano dal corpo, su fondo scuro](/blog/illustrations/glb-file/hero.webp "Illustrazione, non un risultato di easyrender: una teiera metà smaltata e metà a reticolo, con i pannelli UV aperti.")

## Cosa contiene un file GLB?

Un modello glTF può essere composto da un file di testo .gltf, immagini separate e file .bin per la geometria. GLB riunisce tutto in un unico file binario, più comodo da caricare, inviare e ospitare; la [specifica glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) definisce entrambi.

L'intestazione di 12 byte contiene la parola glTF, la versione 2 e la lunghezza totale del file. Seguono due blocchi: JSON per descrivere la scena e binario per geometria e immagini.

Controlliamo questi tre campi su ogni modello consegnato. Rifiutiamo prima del download file che non iniziano con glTF, non sono in versione 2, dichiarano una lunghezza diversa da quella effettiva oppure pesano meno di 20.000 byte.

![Il GLB del vaso in argilla suddiviso in proporzione ai byte: JSON da 1,4 KB, indici da 85 KB, posizioni e coordinate texture da 164 KB e texture WebP da 50 KB, con glTF separato sotto](diagram:glb-anatomy "Il GLB del vaso mostrato più sotto, letto direttamente dal file: 301 KB totali. Con una texture WebP da 1024 pixel, la geometria occupa la maggior parte dello spazio.")

Il conteggio è verificabile: il vaso ha 14.590 triangoli, ognuno con tre indici da 2 byte, per 87.540 byte. Gli 8.406 vertici conservano ciascuno posizione e coordinate texture in 20 byte, per 168.120 byte.

## Quanto pesano i GLB e cosa occupa spazio?

Abbiamo analizzato allo stesso modo i sei modelli della nostra galleria di esempi. Ognuno ha una mesh, un materiale e una texture WebP da 1024 pixel, preparati per il web con glTF Transform.

| Modello           | Peso del file (byte) | Triangoli | Texture (byte) | Quota della geometria |
| ----------------- | -------------------- | --------- | -------------- | --------------------- |
| Vaso in argilla   | 308.448              | 14.590    | 51.354         | 83%                   |
| Vaso in gres      | 312.816              | 16.708    | 28.466         | 90%                   |
| Tavolino rotondo  | 322.876              | 16.228    | 34.266         | 89%                   |
| Poltrona girevole | 519.988              | 24.268    | 57.680         | 89%                   |
| Poltrona bouclé   | 551.068              | 25.879    | 70.690         | 87%                   |
| Comodino          | 1.287.432            | 69.910    | 40.628         | 97%                   |

Si dice spesso che pesano soprattutto le texture: è vero con PNG da 4096 pixel. Con WebP da 1024 pixel, come qui, la geometria non compressa rappresenta dall'83% al 97% del file e il numero di triangoli ne determina il peso.

## Cosa descrivono i materiali di un GLB?

I materiali seguono il modello PBR metallic-roughness. PBR, rendering basato sulla fisica, descrive colore di base, metallicità e rugosità: per questo lo stesso GLB appare simile nei visualizzatori che rispettano lo standard.

![Texture del vaso in argilla estratta dal GLB: superficie divisa in porzioni distese, con anelli di argilla chiara, bordo e base](/blog/figures/glb-file/clay-vase-texture.webp "Texture del colore di base estratta senza modifiche dal GLB, 1024 per 1024 pixel. Le coordinate texture indicano dove applicare ciascuna porzione sul vaso.")

Per i valori omessi si applica l'impostazione predefinita della specifica. Se Metallic non è impostato, vale 1, cioè completamente metallico: un materiale con il solo colore di base viene quindi rappresentato come metallo ruvido e argilla, legno e tessuto possono apparire più scuri o con una dominante di colore.

In Blender imposta Metallic a 0 e riesporta. È un controllo da fare su qualsiasi GLB destinato a una pagina prodotto, indipendentemente da chi lo ha creato.

## Perché un GLB può apparire sfaccettato?

Le normali ai vertici indicano le direzioni usate per illuminare in modo continuo una superficie curva. In glTF sono facoltative: un file può contenere soltanto posizioni e coordinate texture.

In quel caso la specifica richiede al visualizzatore di calcolare normali piatte. Su una mesh densa le facce sono piccole, ma una luce laterale radente può renderle visibili.

Le normali richiedono 12 byte per vertice, tre numeri da 4 byte: circa 96.000 byte per 8.000 vertici. In Blender usa Shade Smooth ed esporta con Normals attivo per salvare le normali smussate; `gltf-transform inspect` mostra se il file contiene l'attributo NORMAL.

## Come apri un file GLB?

Puoi aprirlo direttamente in un visualizzatore, senza convertirlo:

- Nel browser trascina il file nel [Babylon.js Sandbox](https://sandbox.babylonjs.com/) o nell'[editor model-viewer](https://modelviewer.dev/editor/).
- In Blender scegli [File, Import, glTF 2.0](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) (.glb/.gltf).
- Nel codice three.js e Babylon.js caricano GLB direttamente; Unity usa il [pacchetto glTFast](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html).
- Su Android [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) apre un GLB collegato da una pagina web in 3D o AR.

AR Quick Look su iPhone e iPad usa USDZ e non apre GLB. Per offrire AR sui due sistemi, conserva entrambi i file.

![Un vaso in argilla invecchiata come file GLB aperto in model-viewer di Google, pronto da ruotare](/showcase/clay-vase.glb "Un vero GLB easyrender in model-viewer: vaso in argilla invecchiata, 301 KB, una mesh da 14.590 triangoli e una texture WebP da 1024 pixel, preparato con glTF Transform.")

Ruota lentamente il modello. Guarda sotto, dietro e da vicino, soprattutto maniglie e cuciture.

Per ispezionarlo senza visualizzatore usa `gltf-transform inspect` di [glTF Transform](https://gltf-transform.dev/cli). Elenca mesh, texture ed estensioni, con conteggi dei vertici e pesi, così puoi confrontare il file con la tabella.

## A cosa serve un file GLB?

Shopify accetta GLB come contenuto prodotto. Sul tuo sito, il componente open source [model-viewer](https://modelviewer.dev/) di Google lo mostra con poche righe di codice e include rotazione e zoom.

GLB è usato anche per 3D sul web, videogiochi e app AR: è compatto, aperto e leggibile da molti programmi. Lo esportano Blender e la maggior parte degli strumenti di scansione e IA.

Per AR su Android, Scene Viewer consiglia al massimo 10 MB, 100.000 triangoli e texture da 2048 pixel. Tutti i file della tabella rispettano questi valori.

## Come riduci il peso di un GLB?

Abbiamo provato i comandi su una copia del comodino, il modello con più triangoli della tabella, usando glTF Transform 4.5. Il numero di triangoli cambia solo con la semplificazione.

| Versione del comodino                                       | Peso (byte) | Triangoli |
| ----------------------------------------------------------- | ----------- | --------- |
| Come mostrato sul sito                                      | 1.287.432   | 69.910    |
| Geometria compressa con Meshopt (`gltf-transform meshopt`)  | 422.480     | 69.910    |
| Geometria compressa con Draco (`gltf-transform draco`)      | 235.776     | 69.910    |
| Triangoli dimezzati (`gltf-transform simplify --ratio 0.5`) | 710.072     | 34.954    |

Draco ha prodotto il file più leggero, con una riduzione dell'82%. Meshopt ha ridotto il peso del 67% e ha portato il vaso in argilla da 308.448 a 135.740 byte; la sola semplificazione fa risparmiare meno spazio perché lascia la geometria non compressa.

Il visualizzatore deve supportare la compressione. model-viewer e three.js decodificano entrambe, ma la documentazione di Scene Viewer non elenca queste estensioni: verifica il file ovunque verrà aperto.

Scegli in base alla destinazione:

- Il tuo sito con model-viewer: Meshopt o Draco e texture WebP, controllando che i bordi non si arrotondino.
- AR Android tramite Scene Viewer: GLB semplice con PNG o JPEG entro 2048 pixel, semplificato solo oltre 100.000 triangoli.
- Shopify: carica il file non compresso; la piattaforma ottimizza quelli oltre 15 MB.

## Come ottieni un GLB da Blender, una scansione o una foto?

In Blender scegli File, Export, glTF 2.0 e glTF Binary (.glb), così le texture restano nel file. Attiva Normals e UVs nella sezione Mesh e scegli JPEG se non servono trasparenze; app di scansione e strumenti IA offrono solitamente il download GLB.

La guida su [come creare un modello 3D](/it/guide/come-creare-un-modello-3d) confronta modellazione, scansione e foto. Per scegliere il metodo adatto al tuo catalogo, consulta [modelli 3D per ecommerce](/it/guide/modelli-3d-ecommerce).

easyrender fornisce GLB e USDZ per ogni modello completato da una foto, con i passaggi descritti in [creare un modello 3D da foto](/it/guide/creare-un-modello-3d-da-foto). Il modello rappresenta forma e materiali, non misure.

## Da GLB a USDZ: servono entrambi?

Per AR su iPhone e iPad, sì. Reality Converter di Apple, gratuito su Mac, converte GLB in USDZ e le versioni recenti di Blender esportano USDZ direttamente; la [guida ai file USDZ](/it/guide/file-usdz) spiega anche perché il risultato può pesare più del GLB originale.

| File | Contenuto                                          | Dove si apre                                     | Uso                                     |
| ---- | -------------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| GLB  | Un file binario con geometria, materiali e texture | Browser, Blender, Scene Viewer su Android        | Pagine prodotto, web 3D, AR Android     |
| glTF | JSON .gltf, file .bin e immagini separate          | Stessi visualizzatori, mantenendo i file insieme | Modifica e ispezione del JSON leggibile |
| USDZ | Zip non compresso di livelli USD e immagini        | Quick Look su iPhone, iPad e Mac                 | AR sui dispositivi Apple                |

## Cosa può andare storto con un GLB e come lo correggi?

I problemi più comuni hanno poche cause. Parti da ciò che vedi e modifica l'impostazione corrispondente.

| Sintomo                                       | Causa                                                    | Rimedio                                                  |
| --------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| Modello tutto grigio                          | .gltf senza texture o immagini escluse dall'esportazione | Riesporta come .glb binario con texture incluse          |
| File da decine di megabyte                    | Texture da 4096 pixel o troppe texture                   | Riduci a 2048 o 1024 e comprimi la geometria             |
| Curve sfaccettate                             | Normali mancanti, calcolate piatte dal visualizzatore    | Shade Smooth in Blender ed esportazione con normali      |
| Argilla o tessuto scuri o con colori alterati | Metallic non impostato, quindi completamente metallico   | Imposta Metallic a 0 e riesporta                         |
| Macchie nere o interno visibile               | Facce orientate al contrario                             | Ricalcola le normali verso l'esterno in Blender          |
| Funziona solo in un visualizzatore            | Estensione non supportata, come Draco o WebP             | Esporta una versione semplice per l'altro visualizzatore |
| Caricamento rifiutato come non valido         | Download interrotto, lunghezza dichiarata errata         | Scarica di nuovo e confronta il peso                     |

## Cosa non ti dice un file GLB?

glTF usa i metri, ma le dimensioni dipendono da come è stato costruito il modello. Una foto non fornisce misure: riportale nella descrizione del prodotto.

Il formato non garantisce la qualità. Un file può superare il [glTF Validator](https://github.khronos.org/glTF-Validator/) e contenere una gamba deformata o una texture sfocata: per accorgertene devi guardarlo in un visualizzatore.

## FAQ

### GLB e glTF sono la stessa cosa?

Sono due modi di salvare lo stesso formato. glTF può essere un file di testo .gltf con geometria e texture separate; GLB è la versione binaria che riunisce tutto in un file, sempre secondo lo standard glTF 2.0 del Khronos Group e leggibile con la maggior parte degli stessi strumenti.

### Puoi aprire un GLB su iPhone?

Non direttamente in AR Quick Look, che usa USDZ. Puoi però vederlo nel browser dell'iPhone con un visualizzatore web come Babylon.js Sandbox; per l'AR sui dispositivi Apple, converti il GLB in USDZ con Reality Converter su Mac oppure chiedi entrambi i file allo strumento che usi.

### Come converti un GLB in un altro formato?

Aprilo in Blender, che importa GLB ed esporta FBX, OBJ, USD e USDZ, tra gli altri. A ogni conversione possono andare perse informazioni: OBJ non descrive materiali metallic-roughness, quindi una maniglia in ottone può apparire piatta; controlla sempre il risultato in un visualizzatore prima di mostrarlo ai clienti.

### Perché il tuo GLB pesa tanto?

Di solito per texture grandi o geometria non compressa. Nei nostri test, Draco ha ridotto un modello da 69.910 triangoli da 1.287.432 a 235.776 byte: riduci le texture a 2048 o 1024 pixel, comprimi la geometria con glTF Transform e verifica che le superfici conservino l'aspetto previsto.

### Perché il GLB è grigio o senza texture?

Spesso le texture non sono state esportate: un .gltf salvato senza le immagini, oppure un'esportazione della sola geometria, produce una forma grigia. Riesporta come .glb binario con le texture incluse; se il file appare corretto nel Babylon.js Sandbox ma non in un'app, il problema è in quell'app.
