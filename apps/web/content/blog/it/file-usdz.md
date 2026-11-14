---

group: usdz-file
title: "File USDZ: come funziona AR Quick Look su iPhone"
description: "Cos'è un file USDZ, come aprirlo e crearlo per iPhone e iPad, cosa contiene e perché in realtà aumentata può apparire troppo grande."
date: 2026-11-17
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: file usdz
cta: Scegli una foto nitida di un solo pezzo, come un tavolino in rovere o una lampada da terra, e controlla ogni angolo prima di spendere un credito.
---

Un file USDZ contiene un modello 3D nel formato Universal Scene Description di Pixar, USD, racchiuso in un archivio zip non compresso. Apple lo usa per AR Quick Look: su iPhone o iPad puoi aprirlo da Safari, File, Mail o Messaggi e vedere l'oggetto nella stanza attraverso la fotocamera. Android non apre USDZ.

![Illustrazione di una lampada a fungo accesa accanto a un telefono, metà illuminata con luce calda e metà in argilla grigia opaca con reticolo bianco, su fondo scuro](/blog/illustrations/usdz-file/hero.webp "Illustrazione, non un risultato di easyrender: una lampada metà accesa e metà in argilla con reticolo, accanto a un telefono.")

## Cosa contiene un file USDZ?

USD è il formato di scena creato da Pixar per il cinema. La [specifica USDZ](https://openusd.org/release/spec_usdz.html) descrive uno zip senza compressione che contiene livelli USD e le relative immagini; ogni file inizia a un multiplo di 64 byte, così il dispositivo può leggerlo senza estrarre nulla.

![Un file USDZ rappresentato come archivio zip senza compressione, contenente un livello USD con mesh e materiali e le immagini delle texture a cui rimanda](diagram:usdz-anatomy "La struttura descritta dalla specifica USDZ. Senza compressione, l'iPhone legge ogni parte direttamente dall'archivio.")

I livelli USD hanno due codifiche: .usda è testo leggibile, .usdc è binario. Le texture sono solitamente PNG o JPEG; la scelta dello strumento di esportazione determina buona parte del peso del file.

Apple ha [presentato USDZ con ARKit 2](https://www.apple.com/newsroom/2018/06/apple-unveils-arkit-2/) alla WWDC di giugno 2018, per iOS 12, insieme ad AR Quick Look. Da allora è il formato usato dai dispositivi Apple per aprire modelli in realtà aumentata da pagine web e messaggi.

## Da cosa dipende il peso di un file USDZ?

Da due scelte dello strumento che lo scrive. La geometria nel formato di testo .usda occupa diverse volte lo spazio della stessa mesh nel formato binario .usdc, perché ogni numero viene scritto in cifre; inoltre, una texture fotografica PNG con compressione senza perdita di qualità pesa solitamente diverse volte la stessa immagine in JPEG.

La specifica include PNG e JPEG tra i formati immagine, ma non WebP. Quando converti un GLB con texture WebP in USDZ, anche le immagini vengono convertite: il formato scelto dal convertitore determina quanto aumentano di peso.

| Scelta nell'esportazione | File più leggero                           | File più pesante                         |
| ------------------------ | ------------------------------------------ | ---------------------------------------- |
| Geometria                | Binario .usdc                              | Testo .usda                              |
| Formato delle texture    | JPEG, salvo necessità di trasparenza       | PNG                                      |
| Dimensioni delle texture | 1024 o 2048 pixel                          | 4096 pixel                               |
| Mesh                     | Semplificata per lo schermo di un telefono | Tutti i triangoli di una scansione densa |

Nessuna scelta è sbagliata in sé: Quick Look legge entrambe le codifiche e i due formati immagine. Il peso conta comunque, perché diversi megabyte rallentano l'invio tramite Messaggi e il caricamento sulla rete mobile.

## Come controlli il contenuto di un USDZ?

USDZ è uno zip: `unzip -l side-table.usdz` elenca tutti i file interni con il loro peso. Vedi subito se la geometria è .usda o .usdc e se le texture sono PNG o JPEG; poiché la specifica vieta la compressione, i pesi elencati sono quelli effettivi.

Estrai una copia e apri il livello .usda principale in un editor di testo. `metersPerUnit` e `upAxis` indicano le dimensioni visualizzate e l'orientamento verticale; l'impostazione di ancoraggio specifica se Quick Look appoggia il modello su una superficie orizzontale, come il pavimento, o verticale, come una parete.

Cerca un'esportazione con geometria binaria .usdc, texture JPEG se non servono trasparenze e immagini da 2048 pixel al massimo. Confronta il peso con quello del GLB e apri il risultato in Quick Look su Mac prima di inserirlo in una pagina.

## Come apri un file USDZ?

Dipende dal dispositivo:

- iPhone e iPad: tocca il file in Safari, File, Mail o Messaggi. Quick Look offre le viste Oggetto e AR.
- Mac: seleziona il file nel Finder e premi la barra spaziatrice per l'anteprima Quick Look.
- Windows e Android: non hanno un visualizzatore integrato. [Blender dalla versione 3.5](https://developer.blender.org/docs/release_notes/3.5/pipeline_assets_io/) importa USDZ, quindi puoi aprirlo sul computer con Blender.

La [pagina Apple su Quick Look](https://developer.apple.com/augmented-reality/quick-look/) elenca Safari, Messaggi, Mail, News e Note tra le app compatibili, da iOS 12 o iPadOS 12. Per mostrare lo stesso modello su Android o nel browser usa il GLB, descritto nella [guida ai file GLB](/it/guide/file-glb).

<!-- IMAGE PENDING: una schermata reale e non ritoccata di un USDZ easyrender nella vista Oggetto di Quick Look su iPhone. Niente vista AR prima della prova su dispositivo (REQ-00). -->

## Come funziona AR Quick Look su una pagina web?

La pagina usa un link al file USDZ con `rel="ar"`, che contiene un'immagine di anteprima: Safari vi aggiunge un piccolo simbolo AR. La [guida WebKit](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) mostra il codice: toccando l'immagine apri il modello nella stanza, senza installare un'app.

Servono quattro accorgimenti; se ne manca uno, l'apertura può fallire:

1. Ospita il file USDZ su HTTPS con il tipo di contenuto `model/vnd.usdz+zip`, richiesto da Safari.
2. Inserisci l'immagine in un link al file: `<a rel="ar" href="side-table.usdz"><img src="side-table.jpg"></a>`.
3. Lascia nel link un solo elemento figlio, `img` oppure `picture`, senza altro.
4. Verifica il supporto con `a.relList.supports("ar")` e mostra un normale link per scaricare il file quando il controllo restituisce false.

Il componente open source di Google [model-viewer](https://modelviewer.dev/) gestisce entrambi i sistemi: mostra un GLB nella pagina e passa agli iPhone un USDZ per Quick Look.

![Due accessi ad AR Quick Look su iPhone: un'anteprima con simbolo AR in Safari oppure un USDZ aperto da Messaggi, Mail o File, entrambi con viste Oggetto e AR](diagram:quick-look-path "Entrambi i percorsi portano alle stesse due viste. Le dimensioni visualizzate sono quelle salvate nel file, che per un modello ricavato da una foto non derivano da misure.")

AR Quick Look usa le dimensioni memorizzate nel file. Se non provengono da misure, l'oggetto può apparire più grande o più piccolo di quello fisico; chi lo guarda può comunque ridimensionarlo con due dita.

## Come crei un file USDZ?

I quattro metodi più comuni si distinguono per sistema operativo e tipo di lavoro.

| Strumento                    | Dove funziona        | Vantaggio                                        | Da controllare                                       |
| ---------------------------- | -------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Reality Converter di Apple   | Mac                  | Controllo dei materiali prima dell'esportazione  | Solo Mac                                             |
| Blender dalla versione 3.5   | Mac, Windows, Linux  | Modifica del modello prima dell'esportazione     | Alcuni materiali Blender risultano più piatti in USD |
| Esportatore USDZ di three.js | Qualsiasi browser    | Nessun server, USDZ sempre corrispondente al GLB | Peso e materiali in Quick Look                       |
| Shopify                      | Pannello del negozio | Crea GLB e USDZ da ogni modello caricato         | Il risultato lo decide la piattaforma                |

Reality Converter [converte OBJ, glTF, FBX e USD](https://developer.apple.com/videos/play/wwdc2022/10141/) in USDZ. In Blender scegli File, Export, Universal Scene Description e assegna al file l'estensione .usdz.

Se modifichi i modelli, esporta da Blender e verifica in Quick Look su Mac. Su Shopify carica il GLB e lascia che la piattaforma crei il file USDZ; sul tuo sito puoi esportarlo nel browser per gestire un solo file sorgente, ma confronta il peso con quello del GLB.

Se parti da una foto, alcuni strumenti forniscono già USDZ e GLB, evitando la conversione manuale. Trovi i passaggi nella guida per [creare un modello 3D da foto](/it/guide/creare-un-modello-3d-da-foto).

easyrender fornisce entrambi i file per ogni modello completato. La funzione AR è in arrivo e ti permetterà di vedere il mobile nella stanza dal telefono; lascia le misure nella descrizione, perché l'AR usa le dimensioni memorizzate nel file.

## Un esempio: un tavolino in rovere su iPhone

Inviati il file USDZ di un tavolino in rovere tramite Messaggi e toccalo. Quick Look apre prima la vista Oggetto, dove puoi ruotarlo con un dito; passa ad AR, punta la fotocamera verso il pavimento e tocca il punto in cui vuoi vederlo.

Giragli intorno e guarda dove le gambe toccano il pavimento. Se la base del modello è spostata, il tavolino sembra sospeso.

![Un tavolino rotondo in legno massello come modello 3D ruotabile per controllare le gambe da ogni lato](/showcase/coffee-table.glb "Tavolino in legno massello modellato da easyrender a partire da una foto, qui nel suo GLB: 16.228 triangoli. Il file USDZ deriva dallo stesso GLB, quindi i due corrispondono. Ruotalo e guarda l'appoggio delle gambe.")

Controlla poi la venatura sotto la tua lampada, la cui luce è più calda di quella da studio della foto originale.

## Cosa può andare storto con un USDZ e come lo correggi?

Di solito il problema riguarda come viene servito il file o cosa ha scritto il convertitore. Parti dal sintomo e controlla la causa corrispondente.

| Sintomo                                       | Causa                                                      | Rimedio                                                                          |
| --------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Il link scarica il file invece di aprire l'AR | Manca `rel="ar"` oppure il tipo di contenuto è errato      | Aggiungi `rel="ar"` e servi il file come `model/vnd.usdz+zip`                    |
| Nessun simbolo AR sull'anteprima              | Più elementi figli nel link oppure iOS precedente al 12    | Lascia un solo figlio `img` o `picture` e prova su un iPhone recente             |
| Il mobile appare enorme o minuscolo           | Quick Look usa dimensioni salvate senza misurare il mobile | Scrivi le misure nella descrizione; l'acquirente può ridimensionare con due dita |
| Il mobile sembra sospeso                      | La base del modello è sopra l'origine                      | Porta l'origine alla base in Blender e riesporta                                 |
| Colori più piatti che in Blender              | Materiale non trasferibile fedelmente in USD               | Controlla in Quick Look su Mac e semplifica il materiale                         |
| Curve sfaccettate                             | GLB sorgente senza normali                                 | Aggiungi normali smussate al GLB prima della conversione                         |
| File troppo pesante da inviare                | Geometria testuale e texture PNG                           | Esporta geometria binaria e texture JPEG, poi confronta i pesi                   |

## Da GLB a USDZ: conviene tenerli entrambi?

Sì, per una pagina prodotto. GLB copre web e Android, USDZ la realtà aumentata sui dispositivi Apple; Shopify accetta entrambi come contenuti prodotto e crea quello mancante.

La guida su [come creare un modello 3D](/it/guide/come-creare-un-modello-3d) spiega da dove arrivano i file con ciascun metodo. La guida ai [modelli 3D per ecommerce](/it/guide/modelli-3d-ecommerce) aiuta a scegliere i prodotti da cui partire.

## FAQ

### Puoi aprire un file USDZ su Android?

Non direttamente: l'AR di Android usa Scene Viewer di Google, che legge glTF e GLB. Usa quindi la versione GLB dello stesso modello; se hai solo il file Apple, Blender dalla versione 3.5 può importare USDZ ed esportare GLB, ma controlla i materiali dopo la conversione.

### Puoi convertire un USDZ in GLB?

Sì: importa il file USDZ in Blender dalla versione 3.5 ed esportalo come glTF 2.0 nel formato binario GLB. Controlla il risultato in un visualizzatore, perché USD e glTF descrivono le superfici diversamente: alcune impostazioni, come il rivestimento trasparente del legno laccato, potrebbero non trasferirsi fedelmente.

### Perché un modello USDZ appare troppo grande o piccolo in AR?

AR Quick Look usa le dimensioni salvate nel file. Se il modello deriva da una foto o da una scansione senza riferimento misurato, può apparire più grande o più piccolo del mobile fisico: usa l'AR per osservarne l'aspetto e consulta le misure nella descrizione del prodotto.

### Perché un USDZ pesa più del GLB di partenza?

Dipende solitamente dal convertitore: la geometria testuale occupa diverse volte lo spazio di quella binaria e USDZ non include WebP tra i formati immagine. Una piccola texture WebP viene spesso convertita in un PNG molto più pesante; geometria binaria .usdc e texture JPEG riducono il peso.

### USDZ e USD sono la stessa cosa?

USDZ è un contenitore per USD. Una scena USD può essere un file di testo .usda, un file binario .usdc o più file collegati tra loro; USDZ raccoglie livelli e texture in un unico file non compresso, facile da inviare tramite messaggio e aprire su iPhone.
