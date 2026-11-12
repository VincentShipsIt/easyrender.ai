---

group: how-to-make-a-3d-model-from-photos
title: "Modello 3D da foto: come crearlo e controllarlo"
description: "Crea un modello 3D da foto: scegli lo scatto, controlla i lati fuori campo nell'anteprima e scarica GLB e USDZ dopo la verifica."
date: 2026-11-11
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: modello 3d da foto
cta: Scegli una foto di catalogo nitida, con una sedia o una credenza di tre quarti, e controlla ogni angolo prima di spendere un credito.
---

Per creare un modello 3D da foto, carica in uno strumento image-to-3D un'immagine nitida di un solo oggetto, con luce uniforme: i lati fuori campo vengono ricavati da quella foto. L'alternativa è la fotogrammetria, che richiede almeno 20 foto sovrapposte tutt'intorno al pezzo. In entrambi i casi, lo scatto determina gran parte del risultato.

![Illustrazione di un annaffiatoio zincato, metà in metallo e metà in argilla grigia opaca con reticolo bianco, su fondo scuro](/blog/illustrations/how-to-make-a-3d-model-from-photos/hero.webp "Illustrazione, non un risultato di easyrender: un annaffiatoio metà in metallo zincato e metà in argilla con reticolo.")

## Modello 3D da foto: una sola o tante?

Hai l'oggetto davanti a te? Per la fotogrammetria e il LiDAR serve averlo a disposizione; con image-to-3D basta anche la foto del fornitore, persino per una credenza che non hai mai visto dal vivo.

La fotogrammetria unisce scatti sovrapposti. [Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) ne richiede almeno 20, con circa il 70% di sovrapposizione, e 100 o più per oggetti dettagliati; [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) inizia dopo 20 immagini, arriva a 300 e consiglia cerchi e archi a varie altezze.

Il LiDAR su iPhone Pro o iPad Pro misura la profondità mentre giri intorno al pezzo. È rapido con le forme grandi e semplici, ma registra meno dettagli minuti, come quelli delle gambe tornite.

![Due metodi: fotogrammetria con 20–100 foto o più di un oggetto accessibile e image-to-3D con una foto da cui ricavare i lati fuori campo](diagram:photo-vs-photogrammetry "La fotogrammetria misura ciò che la fotocamera ha visto. Image-to-3D parte da una foto e ne ricava i lati fuori campo. Quantità di foto dalla guida Polycam.")

Scegliamo così:

- Solo foto del fornitore, pezzo in un magazzino estero: image-to-3D, l'unico metodo disponibile.
- Pezzo in magazzino, rovere o lino con texture visibile e un'ora libera: fotogrammetria per registrare la superficie.
- Grande forma semplice, come un divano a tre posti, e iPhone Pro: LiDAR, quando il volume conta più della trama del tessuto.
- Vetro, specchi o cromo lucido: difficili per tutti, perché i riflessi vengono letti come superficie.

Il confronto [fotogrammetria o IA da una foto](/compare/photogrammetry-software) spiega vantaggi e limiti dei due metodi.

## Come funziona image-to-3D?

Alcuni strumenti passano direttamente dalla foto al modello. Altri disegnano prima l'oggetto da più angoli e usano quelle viste per costruire il modello, con più riferimenti per i lati fuori campo.

easyrender usa il secondo metodo, scelto dopo una prova A/B su annunci reali. In quella prova, le viste erano generate da un modello di immagini più grande; quello meno costoso usato oggi non è ancora stato sottoposto allo stesso confronto.

La prima fase produce una tavola di viste: un'immagine quadrata con griglia 3 per 3.

Otto riquadri mostrano l'oggetto da angoli distanziati di 45 gradi, dal fronte fino ai tre quarti anteriori sinistri; il nono lo mostra dall'alto. In ciascuno, l'oggetto è intero e centrato su fondo bianco, con luce morbida; nella seconda fase, la foto e le nove viste servono a costruire una mesh con texture.

![Cinque passaggi in due fasi: foto, tavola di viste, controllo di retro e lati, costruzione e file GLB e USDZ, con ritorno a una nuova foto se l'anteprima è errata](diagram:image-to-3d-pipeline "I passaggi descritti qui sotto. Su easyrender la tavola di viste è gratuita e spendi crediti solo al passaggio 4, se avvii la creazione del modello.")

Una foto mostra la forma e il colore dell'oggetto, ma non ciò che si trova dietro un intreccio aperto: per ricostruire le parti mancanti si tende a seguire la simmetria. Le nostre istruzioni chiedono di ricavare con prudenza i lati fuori campo dalla struttura visibile, senza inventare loghi, testo o decorazioni.

Per i mobili aggiungiamo regole nate dalle prove: mantenere numero di gambe, braccioli, cuscini e cassetti, direzione della venatura e cuciture. Gli altri metodi sono in [come creare un modello 3D](/it/guide/come-creare-un-modello-3d).

## Passaggio 1: scegli la foto giusta

Mostra l'oggetto intero, nitido, con luce morbida uniforme e fondo semplice. Niente deve coprirlo: né un cuscino sul bracciolo né una pianta davanti a una gamba.

Per i mobili scegli una foto di tre quarti. Una foto frontale nasconde la profondità della seduta; di tre quarti si vedono insieme fronte e lato, quindi resta meno da ricostruire fuori campo.

![Poltrona bouclé con struttura tubolare in acciaio, fotografata di tre quarti su fondo bianco](/showcase/armchair.jpg "Una buona foto di partenza: poltrona intera, tre quarti, fondo uniforme.")

Usa JPEG, PNG o WebP sotto 4 MB.

Il controllo automatico rifiuta le foto con il lato corto sotto 400 pixel e ti avvisa sotto 800. Rifiuta anche immagini più di quattro volte più larghe che alte o talmente uniformi da sembrare vuote.

Sopra quelle soglie conta soprattutto la nitidezza: controlliamo il mosso su una copia ridotta di ogni caricamento. Guarda un bordo al 100%: se venatura o trama non sono visibili nella foto, non possono essere ricavate dal modello.

Prima di caricare, verifica:

- Oggetto intero, margine su tutti i lati, piedi non tagliati.
- Fotocamera circa a metà altezza del pezzo, senza inquadrare dall'alto.
- Bordi nitidi anche a piena risoluzione.
- Luce uniforme, senza ombre dure sull'oggetto.
- Fondo semplice: muro, carta o pavimento pulito.
- Un solo oggetto, senza stanza arredata.

## Passaggio 2: elimina ciò che non è l'oggetto

Uno sfondo pieno di elementi rende più difficile distinguere l'oggetto nella foto. Il disegno di un tappeto può sembrare parte del basamento, una tenda può confondersi con una lampada.

Se hai solo una foto ambientata, ritaglia attorno al pezzo lasciando un piccolo margine. La foto di una credenza lunga può avere una larghezza fino a quattro volte l'altezza; oltre questo rapporto, il controllo chiede una foto dell'intero prodotto.

Lo scontorno aiuta, ma può lasciare aloni chiari lungo i bordi. Controllali alla risoluzione originale prima di caricare, perché sembrano parte dell'oggetto.

Anche le ombre appartengono al fondo. Un'ombra dura sotto un tavolino può essere letta come una lastra scura unita alle gambe: aspetta la luce morbida di una giornata coperta.

## Passaggio 3: controlla l'anteprima da ogni angolo

Prima di creare il modello finale, controlla la tavola di viste. Osserva soprattutto retro e lati che la foto non mostrava.

Conta gambe, ante e cassetti in ogni riquadro, non solo nella vista frontale. Confronta viste opposte, come quella anteriore destra e quella posteriore sinistra: se i braccioli cambiano forma, la ricostruzione va rivista.

La vista dall'alto rivela ciò che le altre nascondono. È lì che noti un paralume rotondo diventato ovale o un piano più largo a un'estremità.

![Nove viste della stessa poltrona bouclé, fronte, lati, retro e vista dall'alto, generate dalla singola foto precedente](/showcase/armchair-angles.jpg "La tavola di viste gratuita creata da easyrender a partire da quella foto, senza ritocchi. Il retro e la vista dall'alto sono ricavati dalla foto, che non mostrava quelle parti.")

I controlli automatici rifiutano le tavole sotto 768 pixel, quelle in cui l'oggetto manca da più di due riquadri e quelle con più di tre viste quasi identiche tra le otto intorno al pezzo.

Confrontando copie ridotte in scala di grigi, due viste diverse si discostano di almeno il 3%, mentre due ripetizioni differiscono di meno dell'1%. Ripetere la stessa foto in ogni riquadro non aggiunge riferimenti per costruire il modello.

Il conteggio va fatto a mano: confronta ogni riquadro con il pezzo prima di creare il modello. Se qualcosa non torna, cambia foto o aggiungi una nota, invece di riprovare con gli stessi dati.

easyrender accetta note su ciò che manca nella foto: «quattro ante», «retro aperto», «maniglie in ottone». La tavola qui sopra è stata creata dalla foto del passaggio 1; hai due anteprime gratuite al giorno senza crediti e spendi soltanto quando costruisci il modello.

L'anteprima gratuita porta la filigrana «easyrender.ai preview», assente dalla tavola mostrata. [Carica una foto](/it)

## Passaggio 4: costruisci e scarica i file

Quando la forma è corretta, avvia la creazione del modello con texture. GLB è il formato comune per web e Android; USDZ serve ad AR Quick Look su iPhone e iPad.

Per creare il modello chiediamo una texture da 2048 pixel e otteniamo una mesh con un solo materiale, il cui colore proviene da un'immagine. È la configurazione più semplice per i visualizzatori, ben sotto il limite consigliato di 10 materiali di Scene Viewer.

I sei modelli della galleria vanno dai 14.590 triangoli del vaso in argilla ai 69.910 del comodino. Sono sotto i 100.000 consigliati da [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer).

![La poltrona bouclé come modello 3D con texture ricavato dalla foto del passaggio 1, in un visualizzatore](/showcase/armchair.glb "Il modello creato da easyrender da foto e tavola di viste, con texture compresse per questa pagina: 25.879 triangoli, 538 KB. Ruotalo, controlla il retro e guarda il tessuto sotto luce neutra prima di pubblicare.")

Apri il GLB in Blender con File, Import, glTF 2.0 oppure nel [Babylon.js Sandbox](https://sandbox.babylonjs.com/). In Blender attiva Statistics negli overlay per leggere i triangoli; apri sempre il file e ruotalo lentamente prima di usarlo.

easyrender fornisce entrambi i file per ogni modello completato. Il file USDZ viene ricavato dal GLB nel browser quando lo scarichi, quindi i due modelli corrispondono; la realtà aumentata (AR) è in arrivo e userà le dimensioni salvate nel file, perciò riporta le misure nell'annuncio.

Le guide ai [file GLB](/it/guide/file-glb) e ai [file USDZ](/it/guide/file-usdz) spiegano cosa contengono.

## Cosa può andare storto e come lo correggi?

Molti errori risalgono alla foto. Parti dal sintomo e correggi la foto o l'impostazione indicata.

| Sintomo                                 | Causa                                                                                                                    | Rimedio                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Foto rifiutata perché piccola           | Lato corto sotto 400 pixel, spesso una miniatura                                                                         | Usa l'originale sotto 4 MB                                              |
| Foto rifiutata perché stretta           | Larghezza oltre quattro volte l'altezza                                                                                  | Ritaglia attorno all'oggetto con margine                                |
| Due gambe diventano una                 | Le posteriori sono nascoste dietro le anteriori                                                                          | Usa una foto di tre quarti con le quattro gambe ben distinte            |
| Quattro ante diventano tre              | Giunzioni tra le ante poco visibili                                                                                      | Luce radente o nota «quattro ante»                                      |
| Retro uguale al fronte                  | La foto mostra solo il fronte                                                                                            | Nota «retro aperto» o «retro liscio», oppure foto con angolo posteriore |
| Intreccio simile a un disegno stampato  | Una foto non mostra cosa c'è dietro gli spazi                                                                            | Valuta se basta in un visualizzatore piccolo o usa la fotogrammetria    |
| Tessuto più giallo o scuro              | Luce diversa o Metallic omesso, quindi metallico per impostazione predefinita                                            | Controlla con luce neutra e imposta Metallic a 0                        |
| Superfici sfaccettate con luce laterale | Normali assenti, calcolate piatte secondo la [specifica glTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) | Usa Shade Smooth in Blender e riesporta                                 |

## Come capisci se il modello è pronto da pubblicare?

Stabilisci prima i criteri. Ognuno deve avere una risposta sì o no.

1. Numero di gambe, ante, cassetti e maniglie corretto.
2. Retro e fondo coerenti con il pezzo secondo chi lo possiede.
3. Texture leggibile a schermo intero.
4. Apertura nel browser, su iPhone e su Android.
5. File entro i limiti della piattaforma: [Shopify](https://help.shopify.com/en/manual/products/product-media/product-media-types) arriva a 500 MB, Scene Viewer consiglia 10 MB e 100.000 triangoli.

Se il modello non supera il controllo 1 o 2, cambia foto o nota. Se supera i limiti del punto 5, comprimi il file seguendo la guida GLB.

## Cosa non puoi ricavare da una sola foto?

La foto non fornisce le dimensioni fisiche. Scrivile nell'annuncio quando servono all'acquirente.

Un logo piccolo, una maniglia sottile o un testo lontano possono non essere leggibili nella foto. Per rattan e intrecci, una foto non mostra cosa si trova dietro ciascuno spazio: documenta quei dettagli con fotografie aggiuntive.

Vetro, specchi e cromo riflettono l'ambiente anziché mostrare la superficie, complicando anche la fotogrammetria. Questi strumenti lavorano su un oggetto alla volta, non su stanze arredate.

## FAQ

### Quante foto servono per un modello 3D?

Per image-to-3D basta una foto: i lati fuori campo vengono ricavati da quella. La fotogrammetria richiede almeno 20 scatti sovrapposti, spesso 100 o più per oggetti dettagliati; altre foto aiutano a ricostruire le superfici, ma devi avere il pezzo davanti a te e spazio per girargli intorno.

### Quale risoluzione deve avere la foto?

Punta ad almeno 800 pixel sul lato corto, anche di più se hai un originale più grande. easyrender rifiuta le foto sotto 400 pixel, avvisa sotto 800 e controlla il mosso; poi conta la nitidezza: ingrandisci un bordo al 100% e verifica che venatura o trama siano ben visibili nella foto.

### Image-to-3D e fotogrammetria sono la stessa cosa?

No: la fotogrammetria ricostruisce l'oggetto da molte foto reali, quindi ogni superficie è stata ripresa. Con image-to-3D parti da un'immagine e ne ricavi i lati fuori campo; per la fotogrammetria devi avere il pezzo a disposizione, mentre per image-to-3D basta anche una foto di catalogo di un oggetto che non hai mai visto dal vivo.

### È gratuito trasformare una foto in un modello 3D?

Spesso la prova è gratuita e il file finale è a pagamento, per modello o abbonamento. Su easyrender hai due anteprime al giorno senza crediti; un modello completato costa {{renderCredits}} crediti, cioè {{renderPrice}} a {{creditPrice}} per credito, come indicato nella pagina dei prezzi prima di avviare la costruzione.

### Puoi stampare in 3D un modello ricavato da una foto?

Consideralo un modello da vedere su uno schermo: la foto non mostra ogni lato e non fornisce misure per fabbricare il pezzo. easyrender esporta GLB e USDZ per web e AR, non STL o file per la stampa; per produrre una parte fisica usa un modello CAD costruito da misure reali.
