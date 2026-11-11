---

group: 3d-models-for-ecommerce
title: "Modello 3D per ecommerce: metodi, file e costi"
description: "Come ottenere un modello 3D per ecommerce: quattro metodi, file GLB e USDZ, controlli sul telefono e una prova su pochi prodotti."
date: 2026-11-13
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: modello 3d per ecommerce
cta: Scegli un pezzo con profondità, come una poltrona o una credenza, e controlla ogni angolo prima di decidere se il 3D serve al tuo negozio.
---

Un modello 3D per ecommerce è di solito un file GLB o USDZ che l'acquirente può ruotare sullo schermo e vedere nella stanza dal telefono con l'AR. Puoi ottenerlo in quattro modi: da un professionista 3D, dai file CAD del produttore, scansionando il prodotto oppure generandolo con l'IA da una foto.

![Illustrazione di un mocassino marrone accanto alla scatola, punta in pelle e tallone in argilla grigia opaca con reticolo bianco, su fondo scuro](/blog/illustrations/3d-models-for-ecommerce/hero.webp "Illustrazione, non un risultato di easyrender: un mocassino metà in pelle e metà in argilla con reticolo, accanto alla scatola.")

## Cosa aggiunge un modello 3D alla pagina prodotto?

La foto mostra l'angolo che hai scelto tu. Il modello lascia scegliere all'acquirente: retro della libreria, fondo del tavolino, spessore del cuscino della poltrona.

![Poltrona girevole grigia imbottita nella foto di catalogo, ripresa da dietro di tre quarti](/showcase/swivel-chair.jpg "La foto di catalogo: un solo angolo, da dietro, scelto dal fotografo.")
![La stessa poltrona girevole in un visualizzatore 3D, ruotabile per osservare fronte e seduta](/showcase/swivel-chair.glb "Il modello creato da easyrender da quella foto: l'acquirente sceglie la vista. Il fronte è ricavato dall'immagine, che mostra soltanto il retro.")

Su iPhone e iPad il USDZ apre [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) e mostra l'oggetto nella stanza attraverso la fotocamera. Su Android [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) fa lo stesso con GLB.

L'AR mostra l'aspetto nella stanza. Le dimensioni vengono dal file: Scene Viewer interpreta un'unità come un metro, ma una foto non fornisce misure, quindi riportale nella descrizione del prodotto.

## Come misuri se il 3D conviene?

Decidi prima cosa vuoi migliorare: meno domande su retro e profondità, più aggiunte al carrello nelle pagine con modello, meno resi motivati dall'aspetto. Per un negozio di mobili sono tre obiettivi verificabili.

Non pubblichiamo dati di conversione o resi attribuiti al 3D perché non ne abbiamo misurati di difendibili. Tratta le cifre altrui come ipotesi da verificare sul tuo catalogo.

Scegli da cinque a dieci prodotti con modello e un gruppo simile senza. Mantieni invariati prezzi, foto e testi per quattro–sei settimane, poi confronta aggiunte al carrello per visualizzazione e motivi dei resi.

Su un sito tuo, [model-viewer](https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/features/ar.ts) emette eventi per le statistiche. `camera-change` con origine `user-interaction` indica una rotazione manuale; `ar-status` segnala avvio o errore AR e `quick-look-button-tapped` il passaggio a Quick Look su iPhone.

## Quali file servono al negozio?

GLB per web e Android, USDZ per AR sui dispositivi Apple. Le piattaforme compatibili accettano uno o entrambi.

![Un modello prodotto in due file: GLB per browser e Scene Viewer su Android, USDZ per AR Quick Look su iPhone e iPad](diagram:store-files "Un modello, due file, tre punti di accesso. Su un sito tuo puoi gestirli entrambi con model-viewer.")

### Modelli 3D su Shopify

[Shopify accetta modelli GLB e USDZ](https://help.shopify.com/en/manual/products/product-media/product-media-types) fino a 500 MB tra i contenuti prodotto. Oltre 15 MB ottimizza geometria e texture; converte inoltre ogni modello per rendere disponibili entrambe le versioni.

### WooCommerce e siti personalizzati

WooCommerce aggiunge il 3D tramite estensioni come [Arty 3D Viewer](https://woocommerce.com/products/arty-3d-viewer/). Su un sito tuo, [model-viewer](https://modelviewer.dev/) mostra GLB e con `ar-modes="webxr scene-viewer quick-look"` passa al visualizzatore AR adatto al telefono.

### Quali limiti di peso e complessità scegli?

Shopify accetta file grandi, ma il telefono del cliente beneficia di file leggeri. Confrontiamo i nostri esempi con i valori pubblicati da Scene Viewer.

| Voce      | Consiglio Scene Viewer                   | Sei modelli della nostra galleria |
| --------- | ---------------------------------------- | --------------------------------- |
| Triangoli | Fino a 100.000, idealmente 30.000–50.000 | 14.590–69.910                     |
| Texture   | Massimo 2048 x 2048                      | Una texture 1024 x 1024 ciascuno  |
| Materiali | Fino a 10                                | Uno ciascuno                      |
| Peso      | 10 MB; oltre può peggiorare l'esperienza | 308.448–1.287.432 byte            |

Scene Viewer elenca anche le estensioni glTF supportate. Un'estensione assente, come le texture WebP, può impedirne l'apertura: per AR Android preferisci PNG o JPEG e prova il file su un telefono prima di collegarlo alla pagina.

## Come crei modelli 3D dei prodotti?

Confrontiamo quattro metodi per accesso al prodotto, tempo personale, fedeltà dei lati nascosti e difficoltà tipiche.

### Incarica un professionista 3D

Il professionista costruisce da foto, disegni e misure, senza avere fisicamente il prodotto. Preparazione e attesa richiedono più tempo, ma le istruzioni documentate permettono un risultato esatto; i preventivi su Fiverr e Upwork variano con la complessità.

Lo scegliamo per un divano venduto in tre larghezze o per il prodotto principale di una campagna, quando serve precisione.

### Usa i file CAD del produttore

Se vendi progetti tuoi, la fabbrica potrebbe avere file CAD o SketchUp. La geometria è precisa, ma per il web servono spesso texture realistiche e molti meno triangoli.

Chiedili prima di commissionare un modello nuovo. Prevedi comunque la pulizia: un file di fabbrica può superare ampiamente i 100.000 triangoli consigliati da Scene Viewer.

### Scansiona il prodotto

Polycam e [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) usano molte foto sovrapposte. RealityScan avvia l'elaborazione dopo 20 immagini e ne accetta fino a 300; serve il pezzo disponibile e spazio per girargli intorno.

È la nostra scelta per superfici dettagliate in magazzino, come rattan o rovere. Vetro, specchi e metallo lucido ostacolano la ricostruzione.

### Genera il modello con l'IA da una foto

Meshy, Tripo ed easyrender partono da un'immagine. È il percorso disponibile quando hai solo la foto del fornitore: poiché mostra un lato, controlla nell'anteprima il retro che manca nell'input.

![Nove viste di un vaso in gres opaco, generate da una sola foto prodotto](/showcase/vase-angles.jpg "Viste generate da easyrender da una foto di un vaso in gres, senza ritocchi. Forme rotonde e opache sono un caso semplice.")

Lo scegliamo per cataloghi basati su foto dei fornitori. Loghi fini, intrecci aperti e lati fuori campo sono informazioni difficili da leggere in una sola foto; la guida su [come creare un modello 3D](/it/guide/come-creare-un-modello-3d) confronta tutti i percorsi.

Il confronto [professionista 3D o IA](/compare/3d-modeler-vs-ai) tratta la scelta tra incarico e foto. Per due strumenti specifici leggi [Meshy](/compare/meshy) e [Tripo](/compare/tripo).

## Modelli 3D per negozi di mobili: da dove inizi?

Valuta ogni prodotto con quattro domande: retro e profondità contano, il prezzo fa esitare, i clienti chiedono altri angoli, i resi citano l'aspetto? Ordina il catalogo prima di creare modelli.

Parti dai cinque con più risposte positive: spesso poltrone, credenze o lampade con paralumi sagomati. Stampe incorniciate e tappeti guadagnano poco dalla rotazione.

Prova due metodi sullo stesso prodotto, per esempio scansione telefonica e IA sulla stessa lampada. Confrontali sul telefono: il risultato conta più dell'elenco delle funzioni.

Per cataloghi grandi valuta caricamenti multipli e costo per modello. easyrender permette di caricare un gruppo di foto, verificare l'anteprima gratuita di ciascuna e costruire solo i modelli approvati.

## Come aggiungi il 3D al negozio?

Per il primo gruppo segui questo ordine:

1. Scegli cinque prodotti con le quattro domande precedenti.
2. Crea ciascun modello con il metodo adatto.
3. Controlla numero di gambe e ante, retro e texture a schermo intero.
4. Riduci texture a 2048 pixel o meno e comprimi geometria se il visualizzatore lo permette.
5. Carica con gli strumenti della piattaforma, come i contenuti prodotto di Shopify.
6. Apri ogni pagina su iPhone e Android con rete mobile e prova entrambe le modalità AR.
7. Misura per quattro–sei settimane e decidi il gruppo successivo.

## Un esempio: una credenza in noce

Hai tre foto del fornitore: fronte, tre quarti e dettaglio delle maniglie in ottone. Per image-to-3D scegli i tre quarti, perché mostrano profondità e pannello laterale.

![Tre foto disegnate di una credenza: fronte senza profondità, tre quarti con pannello laterale segnato come scelta e dettaglio di una maniglia](diagram:sideboard-photo-pick "Solo i tre quarti mostrano il fianco, lasciando meno profondità fuori dalla foto. Disegno per questo esempio, non un annuncio reale.")

Controlla ante, gambe e venatura. Confronta le maniglie con il dettaglio ravvicinato, perché la minuteria richiede informazione visiva sufficiente, e osserva il retro che la foto non mostrava.

Carica poi il GLB con gli strumenti della piattaforma e apri la pagina su iPhone e Android. Shopify crea il USDZ per iPhone dallo stesso caricamento.

## Cosa può andare storto quando aggiungi il 3D?

Molti problemi emergono soltanto sul telefono. Ecco perché la verifica su dispositivo fa parte della procedura.

| Sintomo                           | Causa                                                         | Rimedio                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nessun pulsante AR su Android     | Scene Viewer richiede HTTPS o telefono compatibile            | Servi il GLB su HTTPS e prova un secondo telefono                                                                                                |
| Nessuna AR su iPhone dal tuo sito | USDZ assente o tipo di contenuto errato                       | Aggiungi USDZ come `model/vnd.usdz+zip`, richiesto da [Safari](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) |
| Mobile enorme o minuscolo in AR   | Dimensioni nel file non ricavate da misure                    | Scrivi le misure nella descrizione; l'acquirente può ridimensionare                                                                              |
| Mobile sospeso                    | Base sopra l'origine                                          | Porta l'origine alla base in Blender                                                                                                             |
| Pagina lenta su rete mobile       | Texture da 4096 pixel o geometria non compressa               | Usa 2048 o 1024 e Draco o Meshopt dove supportati                                                                                                |
| Modello scuro o sporco in AR      | Ombre incorporate nella texture, sconsigliate da Scene Viewer | Usa texture senza ombre e Metallic a 0 se non impostato                                                                                          |
| GLB non apribile in Scene Viewer  | Estensione non elencata, come WebP                            | Esporta una versione semplice con PNG o JPEG                                                                                                     |

## Quali confini ha il 3D per ecommerce?

Una foto permette di rappresentare forma e materiali, ma non fornisce misure. Mantieni le dimensioni nella descrizione e usa l'AR per osservare l'aspetto del pezzo.

Vetro e cromature mostrano riflessi invece della superficie, ostacolando diversi metodi. Testi e loghi piccoli richiedono fotografie ravvicinate che ne documentino il dettaglio.

Il 3D non sostituisce le foto usate in ricerca, annunci e griglie. Restano quindi valide le basi della [fotografia prodotto](/it/guide/fotografia-prodotto-ecommerce).

## FAQ

### Servono modelli 3D per tutto il negozio?

No: aiutano soprattutto dove chi compra vuole vedere profondità e retro, come sedie, divani, credenze e lampade. Per oggetti piatti o semplici bastano buone foto; comincia da pochi prodotti per cui ricevi richieste di altre viste e valuta i risultati prima di convertire tutto il catalogo.

### Quali formati 3D servono a un negozio online?

Di solito due: GLB per web e AR Android, USDZ per AR Quick Look su iPhone e iPad. Shopify accetta entrambi e crea le due versioni; se il tuo strumento ne fornisce una sola, puoi convertirla con Reality Converter di Apple su Mac oppure con Blender.

### Quanto dovrebbe pesare un modello prodotto 3D?

Deve caricarsi bene su un telefono con rete mobile. Scene Viewer consiglia massimo 10 MB, 100.000 triangoli e texture da 2048 pixel, idealmente 30.000–50.000 triangoli; Shopify accetta fino a 500 MB e ottimizza oltre 15 MB, ma un file leggero si carica comunque prima per il cliente.

### Quanto costa un modello 3D per ecommerce?

Dipende dal metodo: professionisti a preventivo, scansioni spesso in abbonamento, IA per modello o mese. Su easyrender l'anteprima è gratuita e un modello completato costa {{renderCredits}} crediti ({{renderPrice}}); puoi comprare crediti a consumo oppure riceverne {{proCredits}} al mese con Pro a {{proPrice}}, secondo il piano scelto.

### Quali dimensioni mostra un prodotto in realtà aumentata?

Sui telefoni compatibili puoi vederlo con USDZ in AR Quick Look o GLB in Scene Viewer. Le dimensioni dipendono dai valori salvati nel file: una foto non contiene misure del pezzo, quindi l'AR ne mostra l'aspetto e la descrizione prodotto resta il riferimento per larghezza, profondità e altezza.
