---

group: how-to-make-a-3d-model
title: "Come creare un modello 3D: cinque metodi a confronto"
description: "Come creare un modello 3D con Blender, scansioni, una foto o un professionista: cosa serve, tempi, controlli e scelta del metodo."
date: 2026-11-16
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: come creare un modello 3d
cta: Se hai una foto nitida di una sedia, una lampada o una credenza, puoi controllare ogni angolo prima di decidere se creare il modello.
---

Puoi creare un modello 3D in cinque modi: modellarlo in Blender, ricostruire l'oggetto con la fotogrammetria, scansionarlo con il LiDAR del telefono, generarlo da una foto con l'IA oppure affidarlo a un professionista. La scelta dipende dall'esistenza dell'oggetto, dalla possibilità di averlo davanti e dal tempo che puoi dedicarci.

![Illustrazione di un cavallo degli scacchi in noce, volto e parte anteriore in legno scolpito e retro in argilla grigia opaca con reticolo bianco, su fondo scuro](/blog/illustrations/how-to-make-a-3d-model/hero.webp "Illustrazione, non un risultato di easyrender: un cavallo degli scacchi metà in noce e metà in argilla con reticolo.")

## Quale metodo scegli?

Se l'oggetto non esiste ancora, modellalo con un programma o incarica un professionista. Se esiste ed è davanti a te, scansionalo; se hai soltanto una foto, usa uno strumento da immagine a 3D.

![Albero decisionale: modellazione o professionista per oggetti ancora inesistenti, IA da foto se hai solo un'immagine, LiDAR per grandi forme semplici e fotogrammetria per superfici dettagliate accessibili](diagram:method-decision-tree "Le tre domande alla base della tabella. Un professionista 3D è anche la scelta quando serve un modello esatto.")

La precisione tende a seguire l'impegno richiesto. Un professionista che lavora da misure produce il modello più esatto; partire da una foto è più rapido, ma i lati che la foto non mostra vengono ricavati da quell'immagine.

| Metodo                        | Cosa serve                                        | Il tuo tempo                                          | Adatto a                                     | Da controllare                                       |
| ----------------------------- | ------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| Modellazione con un programma | Settimane di pratica, foto di riferimento, misure | Un giorno o più per pezzo, dopo aver imparato         | Oggetti che non esistono ancora              | Proporzioni, texture e mappatura UV                  |
| Fotogrammetria                | Oggetto disponibile, da 20 a 100 foto o più       | Una o due ore di scatti, più elaborazione             | Dettagli reali delle superfici               | Superfici bianche uniformi, vetro, metallo lucido    |
| LiDAR sul telefono            | iPhone Pro o iPad Pro, oggetto disponibile        | Qualche minuto girando intorno                        | Grandi forme semplici, come un divano        | Meno dettaglio su gambe tornite e sedute intrecciate |
| IA da foto                    | Una foto nitida                                   | Verifica di anteprima e modello                       | Foto di un fornitore, senza accesso al pezzo | La foto mostra un solo lato e non contiene misure    |
| Professionista 3D             | Foto, misure e budget                             | Preparazione delle istruzioni e revisione delle bozze | Modelli esatti o in più dimensioni           | Tempi di preparazione e incarico                     |

Questa guida riguarda modelli per schermi, pagine prodotto e AR, non la stampa 3D. Per fabbricare una parte serve un modello CAD costruito da misure: è un lavoro diverso.

Per una pagina prodotto o l'AR sul telefono, [Scene Viewer di Google](https://developers.google.com/ar/develop/scene-viewer) consiglia al massimo 100.000 triangoli, idealmente da 30.000 a 50.000, texture entro 2048 pixel e file entro 10 MB. Punta a questi valori con qualsiasi metodo.

## Metodo 1: modella tu con un programma

Blender è gratuito, open source ed esporta GLB, FBX, OBJ e USD. SketchUp è più accessibile per mobili ed edifici perché permette di [estrudere forme piane](https://help.sketchup.com/en/sketchup/pushing-and-pulling-shapes-3d); [Tinkercad](https://www.tinkercad.com/help-center/what-is-tinkercad), gratuito nel browser, è un punto di partenza semplice per imparare le forme di base.

Metti in conto settimane di pratica prima di ottenere una sedia convincente. Proporzioni e texture sono gli ostacoli iniziali; la mappatura UV, che distende una superficie per applicarvi un'immagine, è il passaggio in cui molti si fermano.

Per un tavolino semplice, procedi così:

1. Raccogli una foto frontale, una laterale e le misure.
2. Abbozza piano, gambe e fascia sottopiano con parallelepipedi e cilindri.
3. Smussa leggermente gli spigoli, perché prendano la luce come il legno.
4. Distendi le UV e applica i materiali: legno sul piano, metallo sulle eventuali maniglie.
5. Applica scala e rotazione dell'oggetto, per mantenere nell'esportazione le dimensioni impostate.
6. Controlla tutti i lati, compreso il fondo, ed esporta in GLB.

![Un tavolino in tre fasi: volumi semplici per piano e gambe, spigoli smussati e infine texture di legno prima dell'esportazione](diagram:blockout-side-table "I passaggi da 2 a 6 su un tavolino semplice. Disegno realizzato per questa guida.")

Due controlli risolvono molti errori iniziali. In Blender, Object, Apply, All Transforms evita esportazioni ruotate o con dimensioni errate; una texture a scacchi, applicata prima di quella definitiva, mostra subito dove le UV deformano l'immagine.

## Metodo 2: fotogrammetria

La fotogrammetria ricostruisce l'oggetto da foto sovrapposte. La [guida Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) ne richiede almeno 20, con circa il 70% di sovrapposizione, scattate in cerchi a diverse altezze e con luce morbida uniforme; per oggetti dettagliati ne servono 100 o più.

![Lampada da terra circondata da posizioni della fotocamera a tre altezze, con due inquadrature vicine parzialmente sovrapposte](diagram:photogrammetry-rings "Ripresa per fotogrammetria: cerchi a diverse altezze, con circa il 70% della vista condivisa tra scatti vicini, secondo Polycam.")

Segui sempre queste regole:

1. Usa luce morbida uniforme: all'aperto con cielo coperto o al chiuso senza sole diretto.
2. Blocca l'esposizione del telefono per mantenere la stessa luminosità.
3. Scatta un cerchio basso, uno intermedio e uno alto rivolto verso il basso, spostandoti poco per volta.
4. Tieni l'oggetto grande nell'inquadratura: [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) chiede almeno metà dell'immagine.
5. Non spostare l'oggetto durante la sessione: muoviti tu.

RealityScan avvia l'elaborazione dopo 20 immagini e ne accetta fino a 300. Il criterio è semplice: ciò che non compare in più immagini non sarà presente nel modello.

RealityScan e Polycam funzionano sul telefono, [Meshroom](https://alicevision.org/) è open source e funziona sul computer. La fotogrammetria registra bene i dettagli, ma superfici bianche uniformi, vetro e metallo lucido offrono pochi punti riconoscibili da abbinare tra gli scatti.

Il confronto [fotogrammetria o IA da una foto](/compare/photogrammetry-software) spiega quando vale la pena preparare questa ripresa.

## Metodo 3: scansione LiDAR sul telefono

Gli iPhone Pro dall'iPhone 12 Pro e gli iPad Pro recenti hanno un [sensore LiDAR](https://www.apple.com/newsroom/2020/03/apple-unveils-new-ipad-pro-with-lidar-scanner-and-trackpad-support-in-ipados/) che misura direttamente la profondità. App come Polycam lo usano per costruire il modello mentre giri intorno all'oggetto.

Il LiDAR è rapido sulle grandi forme semplici, come un divano. Registra meno dettagli della fotogrammetria: gambe tornite e sedute intrecciate possono risultare irregolari.

Cammina lentamente a distanza costante e illumina bene la stanza: il sensore misura la profondità, ma la fotocamera registra i colori. Allontana prima il divano dalla parete, altrimenti il retro resta fuori dalla ripresa.

## Metodo 4: genera il modello con l'IA

L'IA può partire da una foto, con strumenti image-to-3D, oppure da una descrizione, con strumenti text-to-3D. La foto mantiene l'aspetto di un prodotto esistente; il testo ne inventa uno, adatto a un'idea ma non a rappresentare ciò che vendi.

Il procedimento è simile: una foto nitida dell'oggetto intero su fondo uniforme, poi il controllo dei lati nascosti. La guida per [creare un modello 3D da foto](/it/guide/creare-un-modello-3d-da-foto) descrive ogni passaggio.

![Un vaso in gres opaco nella foto di catalogo, ripreso frontalmente su fondo bianco](/showcase/vase.jpg "La singola foto di partenza.")
![Modello 3D di un vaso chiaro in gres, creato da easyrender a partire dalla foto e mostrato in un visualizzatore ruotabile](/showcase/vase.glb "Il modello creato da easyrender passando per un'anteprima gratuita di più viste, con texture compresse per questa pagina: 16.708 triangoli. Ruotalo e controlla il retro che la foto non mostrava.")

easyrender disegna prima un'anteprima gratuita con nove viste: otto intorno all'oggetto, a intervalli di 45 gradi, e una dall'alto. Poi costruisce il modello, che costa {{renderCredits}} crediti ({{renderPrice}}). [Carica una foto](/it)

Lavora su un oggetto alla volta, come mobili, decorazioni ed esterni di edifici. Anche Meshy e Tripo trasformano foto in 3D e aggiungono la generazione da testo, con prezzi propri: trovi i confronti in [alternativa a Meshy per foto prodotto](/compare/meshy) e [alternativa a Tripo per foto prodotto](/compare/tripo).

Per confrontare due strumenti, usa la stessa foto e verifica questi punti:

1. Retro e fondo: sono coerenti con il pezzo, soprattutto dove la foto non li mostra?
2. Numero di gambe, ante, cassetti e maniglie.
3. Texture a schermo intero.
4. Triangoli e peso del file rispetto ai valori indicati sopra.
5. Costo per modello completato e possibilità di vedere un'anteprima prima di pagare.

## Metodo 5: incarica un professionista 3D

Un professionista modella l'oggetto dalle tue foto e misure. È la scelta per un modello esatto, come un divano venduto in tre larghezze, o per il prodotto principale di una campagna pubblicitaria.

Per ridurre le revisioni, prepara queste informazioni:

- Foto di ogni lato e dettagli di materiali e finiture.
- Misure prese con il metro.
- Formati richiesti: GLB e USDZ per una pagina prodotto.
- Limiti: da 30.000 a 50.000 triangoli, texture entro 2048 pixel e meno materiali possibile.
- File sorgente, per esempio .blend, per le modifiche future.

Su Fiverr e Upwork trovi professionisti della modellazione prodotto. Chiedi un esempio nella stessa categoria prima di affidare un catalogo intero; il confronto [professionista 3D o IA](/compare/3d-modeler-vs-ai) tratta costi, tempi e criteri di scelta.

## Quanto costa un modello 3D?

Un programma gratuito richiede tempo. Un professionista fa un preventivo per modello in base alla complessità; app di scansione e strumenti IA fatturano per modello o in abbonamento, spesso dopo una prova gratuita.

Su easyrender i crediti costano {{creditPrice}} ciascuno e si acquistano a consumo, da {{paygMinCredits}} crediti. Pro costa {{proPrice}} al mese per {{proCredits}} crediti, che non scadono.

## Come controlli un modello completato?

Aprilo in un visualizzatore e osserva retro e fondo, dove gli errori passano inosservati. Ripeti questi controlli per ogni modello:

1. Ruotalo lentamente a schermo intero, fermandoti sul retro e sul fondo.
2. Confronta il numero delle parti con il pezzo fisico.
3. Ingrandisci le texture: un tessuto convincente in miniatura può perdere definizione da vicino.
4. Leggi triangoli e peso del file e confrontali con i valori indicati sopra.
5. Aprilo sul telefono con rete mobile e prova l'AR su iPhone e Android.

Per le pagine prodotto servono solitamente GLB per web e Android e USDZ per AR sui dispositivi Apple. La [guida ai file GLB](/it/guide/file-glb) spiega apertura, verifica e compressione; la [guida ai file USDZ](/it/guide/file-usdz) copre il lato Apple.

## Un esempio: una lampada da terra, tre metodi

Prendi una lampada con paralume in lino e stelo in ottone. In Blender un principiante può abbozzare stelo e paralume in un pomeriggio; rendere credibile il lino richiede molto più tempo.

L'ottone lucido riflette la stanza e ostacola l'abbinamento delle foto nella fotogrammetria. Chi scansiona per mestiere opacizza le parti lucide con spray temporanei, un trattamento da evitare sulla merce in vendita.

Una foto di catalogo pulita mostra la forma generale e il colore del paralume per la ricostruzione image-to-3D. Controlla bene lo stelo sottile: nella foto deve essere leggibile, senza confondersi con lo sfondo.

Per questa lampada scegliamo IA se c'è solo la foto del fornitore, fotogrammetria con l'ottone mascherato se il pezzo è disponibile, un professionista se sostiene tutta la campagna.

## Quali errori incontri con ciascun metodo?

Ogni metodo ha cause ricorrenti di errore. Confronta il risultato con questa tabella per capire cosa correggere.

| Metodo         | Sintomo                                 | Causa                                           | Rimedio                                                                  |
| -------------- | --------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| Programma      | Modello ruotato o con dimensioni errate | Scala e rotazione non applicate                 | Applica tutte le trasformazioni e riesporta                              |
| Programma      | Venatura allungata su una faccia        | UV distese male                                 | Controlla con texture a scacchi e ridistendi quella faccia               |
| Fotogrammetria | Buchi in un piano bianco uniforme       | Mancano punti da abbinare                       | Scatta con cielo coperto o cambia metodo                                 |
| Fotogrammetria | Base assente o unita al pavimento       | Fondo mai fotografato                           | Accettalo oppure riprendi una seconda sessione con il pezzo su un fianco |
| LiDAR          | Gambe sottili irregolari o assenti      | Dettagli inferiori alla risoluzione del sensore | Passa alla fotogrammetria                                                |
| IA da foto     | Retro diverso dal pezzo                 | La foto non mostrava quel lato                  | Usa una vista di tre quarti o una nota sul retro                         |
| IA da foto     | Logo o etichetta poco leggibile         | Dettaglio troppo fine nella singola foto        | Documenta il logo nelle fotografie                                       |
| Professionista | Modello in ritardo o errato             | Istruzioni senza misure, formati o limiti       | Fornisci subito foto, misure, formati e limite di triangoli              |

## Quali sono i confini di ciascun metodo?

I modelli da una foto non contengono dimensioni misurate. Le scansioni non registrano ciò che la fotocamera non vede, come il fondo di un divano appoggiato a terra; modellare richiede pratica e incaricare un professionista richiede tempo.

Tutti e cinque i metodi trattano un oggetto alla volta: una stanza arredata è un lavoro diverso. Per un catalogo consulta [modelli 3D per ecommerce](/it/guide/modelli-3d-ecommerce); per pezzi unici, [vendere mobili vintage](/it/guide/vendere-mobili-vintage).

## FAQ

### Devi imparare Blender per creare un modello 3D?

No: app di scansione e strumenti da foto producono modelli senza modellazione manuale. Serve comunque occhio per controllare retro, texture e parti sottili; imparare Blender conviene se ti servono spesso modelli esatti e modificabili di oggetti che non esistono ancora, perché ti dà controllo sulla costruzione.

### Quanto tempo serve per creare un modello 3D?

Conta soprattutto il metodo: IA da foto e scansioni telefoniche richiedono meno lavoro personale, mentre la fotogrammetria richiede una o due ore di scatti più elaborazione. Modellare una sedia in Blender può richiedere un giorno dopo settimane di pratica; un professionista indica i propri tempi nel preventivo.

### Puoi creare un modello 3D da una sola foto?

Sì, con uno strumento image-to-3D: i lati che la fotocamera non vede vengono ricavati dalla foto disponibile. Controlla retro e dettagli nell'anteprima, soprattutto dove manca informazione visiva; parti da uno scatto nitido di tre quarti, con un solo oggetto intero su fondo uniforme e senza ostacoli.

### È come creare un modello per la stampa 3D?

No: schermi e AR richiedono un aspetto convincente, la stampa richiede misure precise e una geometria chiusa adatta alla fabbricazione. IA da foto e molte scansioni servono al primo uso; easyrender esporta GLB e USDZ per web e AR, non STL, mentre per fabbricare una parte servono CAD e misure.

### Quanti triangoli dovrebbe avere un modello 3D?

Per pagine prodotto e AR sul telefono punta a 30.000–50.000 triangoli, l'intervallo ideale indicato da Scene Viewer, restando sotto il limite consigliato di 100.000. I nostri esempi vanno dai 14.590 triangoli di un vaso ai 69.910 di un comodino con cassetti; le scansioni sono spesso più dense e vanno semplificate.
