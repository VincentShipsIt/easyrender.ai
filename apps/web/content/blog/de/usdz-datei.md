---

group: usdz-file
title: "USDZ-Datei: 3D und AR Quick Look auf dem iPhone"
description: "Eine USDZ-Datei öffnet 3D-Modelle in AR auf iPhone und iPad. So prüfst, öffnest und erstellst du sie und erkennst Ursachen für falsche Größen."
date: 2026-11-17
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: usdz datei
cta: Wähle ein scharfes Foto eines einzelnen Stücks, etwa eines Eichen-Beistelltischs oder einer Stehlampe, und prüfe alle Seiten, bevor du Credits ausgibst.
---

Eine USDZ-Datei enthält ein 3D-Modell in Pixars Universal Scene Description, kurz USD, in einem unkomprimierten ZIP-Archiv. Apple nutzt das Format für AR Quick Look: iPhone und iPad öffnen es aus Safari, Dateien, Mail oder Nachrichten und zeigen das Objekt durch die Kamera im Raum. Android öffnet USDZ nicht direkt.

![Illustration einer leuchtenden Pilz-Tischlampe neben einem liegenden Handy, links warm beleuchtet und rechts mattgrauer Ton mit weißem Drahtgitter, vor dunklem Hintergrund](/blog/illustrations/usdz-file/hero.webp "Illustration, kein easyrender-Ergebnis: eine Lampe, halb leuchtend und halb als Tonmodell mit Drahtgitter gezeichnet, neben einem Handy.")

## Was steckt in einer USDZ-Datei?

USD ist Pixars Szenenformat für die Filmproduktion. Die [USDZ-Spezifikation](https://openusd.org/release/spec_usdz.html) beschreibt ein ZIP-Archiv ohne Kompression, das USD-Ebenen und ihre Bilder enthält. Jede enthaltene Datei beginnt an einem Vielfachen von 64 Bytes, damit Geräte sie direkt lesen können, ohne das Archiv zu entpacken.

![USDZ als unkomprimiertes ZIP-Archiv mit einer USD-Ebene für Netz und Materialien sowie den referenzierten Texturbildern](diagram:usdz-anatomy "Der Aufbau laut USDZ-Spezifikation. Weil nichts komprimiert ist, liest ein iPhone jeden Bestandteil direkt aus dem Archiv.")

USD-Ebenen gibt es in zwei Kodierungen: .usda ist lesbarer Text, .usdc binär. Texturen sind meist PNG oder JPEG. Welche davon die USDZ enthält, hängt vom erzeugenden Werkzeug ab und bestimmt einen großen Teil der Dateigröße.

Apple [stellte USDZ mit ARKit 2 vor](https://www.apple.com/newsroom/2018/06/apple-unveils-arkit-2/), auf der WWDC im Juni 2018 für iOS 12, zusammen mit AR Quick Look. Seitdem erwarten Apple-Geräte dieses Format für AR aus Webseiten oder Nachrichten.

## Was bestimmt die Größe einer USDZ-Datei?

Zwei Entscheidungen des Exportwerkzeugs: Geometrie als Text in .usda braucht ein Mehrfaches der Bytes desselben Netzes in binärer .usdc, weil jede Zahl ausgeschrieben gespeichert wird. Dazu kommen Texturen: Eine verlustfreie PNG mit fotoähnlichem Inhalt ist meist mehrfach größer als eine JPEG desselben Bilds.

Die Spezifikation listet PNG und JPEG als Bildtypen, aber kein WebP. Beim Umwandeln einer GLB mit WebP-Texturen in USDZ werden die Bilder deshalb konvertiert. Das vom Konverter gewählte Format bestimmt, wie stark sie wachsen.

| Exportentscheidung | Kleinere Datei                      | Größere Datei                     |
| ------------------ | ----------------------------------- | --------------------------------- |
| Geometrie          | Binäre .usdc                        | Text in .usda                     |
| Texturformat       | JPEG, außer bei nötiger Transparenz | PNG                               |
| Texturgröße        | 1024 oder 2048 Pixel                | 4096 Pixel                        |
| Oberflächennetz    | Für das Handydisplay vereinfacht    | Jedes Dreieck eines dichten Scans |

Keine dieser Varianten ist ein Fehler: Quick Look liest beide Kodierungen und Bildformate. Die Größe zählt trotzdem. Mehrere Megabyte dauern beim Versenden in Nachrichten und beim Laden über mobile Daten länger.

## Wie prüfst du den Inhalt einer USDZ?

USDZ ist ein ZIP, deshalb listet `unzip -l side-table.usdz` alle enthaltenen Dateien mit Größe auf. Du erkennst sofort, ob die Geometrie .usda oder .usdc und die Texturen PNG oder JPEG sind. Da die Spezifikation keine Kompression erlaubt, entsprechen die angezeigten Größen den tatsächlichen.

Entpacke danach eine Kopie und öffne die Hauptdatei .usda im Texteditor. `metersPerUnit` und `upAxis` bestimmen Darstellungsgröße und Ausrichtung. Eine Verankerungsangabe bestimmt, ob Quick Look das Objekt auf eine horizontale Fläche wie den Boden oder eine vertikale wie eine Wand setzt.

Verlange vom Exportwerkzeug binäre .usdc-Geometrie, JPEG-Texturen außer bei nötiger Transparenz und Texturen bis 2048 Pixel. Vergleiche die Größe mit der GLB. Öffne die Datei vor dem Veröffentlichen in Quick Look auf einem Mac.

## USDZ-Betrachter: Wie öffnest du die Datei?

Das hängt vom Gerät ab:

- iPhone und iPad: Tippe die Datei in Safari, Dateien, Mail oder Nachrichten an. Quick Look zeigt eine Objektansicht und eine AR-Ansicht.
- Mac: Wähle sie im Finder und drücke die Leertaste für die Quick-Look-Vorschau.
- Windows und Android: Es gibt keinen eingebauten Betrachter. [Blender ab Version 3.5](https://developer.blender.org/docs/release_notes/3.5/pipeline_assets_io/) importiert USDZ.

[Apples Quick-Look-Seite](https://developer.apple.com/augmented-reality/quick-look/) nennt Safari, Nachrichten, Mail, News und Notizen für USDZ ab iOS 12 beziehungsweise iPadOS 12. Für dasselbe Modell unter Android oder im Browser nutzt du GLB. Das erklärt der Ratgeber zur [GLB-Datei](/de/ratgeber/glb-datei).

<!-- IMAGE PENDING: echter unbearbeiteter iPhone-Screenshot einer easyrender-USDZ, etwa des Bouclé-Sessels, in der Objektansicht von Quick Look. AR-Ansicht erst nach Gerätetest (REQ-00). -->

## Wie funktioniert AR Quick Look auf einer Webseite?

Die Seite verlinkt die USDZ mit `rel="ar"` um ein Vorschaubild. Safari ergänzt ein kleines AR-Symbol am Bild; den Code zeigt [WebKits Anleitung](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/). Ein Tippen öffnet das Modell im Raum, ohne zusätzliche App.

Vier Details müssen stimmen:

1. Stelle die USDZ über HTTPS mit dem von Safari erwarteten Inhaltstyp `model/vnd.usdz+zip` bereit.
2. Verlinke die Datei um ein Vorschaubild: `<a rel="ar" href="side-table.usdz"><img src="side-table.jpg"></a>`.
3. Der Link enthält genau ein Kindelement, `img` oder `picture`, und sonst nichts.
4. Prüfe die Unterstützung im Skript mit `a.relList.supports("ar")` und zeige andernfalls einen gewöhnlichen Downloadlink.

Googles quelloffenes [model-viewer](https://modelviewer.dev/) übernimmt beide Systeme mit einem Codeabschnitt: Es zeigt GLB auf der Seite und gibt iPhones eine USDZ für Quick Look.

![Zwei Wege zu AR Quick Look am iPhone: Vorschaubild mit AR-Symbol in Safari oder USDZ in Nachrichten, Mail oder Dateien; beide öffnen Objekt- und AR-Ansicht](diagram:quick-look-path "Beide Wege führen zu denselben Ansichten. Das Modell verwendet die in seiner Datei gespeicherte Größe, die bei einem Modell aus einem Foto nicht auf einer Messung beruht.")

AR Quick Look verwendet die gespeicherte Größe. Wurde diese nie gemessen, kann das Objekt größer oder kleiner als das echte Stück erscheinen. Käufer können es ohnehin mit zwei Fingern vergrößern oder verkleinern.

## Wie erstellst du eine USDZ-Datei?

Vier verbreitete Wege unterscheiden sich nach Plattform und Einsatzzweck.

| Werkzeug                   | Läuft auf           | Geeignet für                                            | Darauf achten                                    |
| -------------------------- | ------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| Apples Reality Converter   | Mac                 | Materialien vor dem Export prüfen                       | Nur Mac                                          |
| Blender ab 3.5             | Mac, Windows, Linux | Modell vor dem Export bearbeiten                        | Manche Blender-Materialien wirken in USD flacher |
| USDZ-Exporter von three.js | Jedem Browser       | Ohne Server, USDZ entspricht immer ihrer GLB            | Größe und Materialien in Quick Look prüfen       |
| Shopify                    | Shop-Verwaltung     | Jedes hochgeladene Modell in GLB und USDZ bereitstellen | Shopify bestimmt das Ergebnis                    |

Reality Converter [wandelt unter anderem OBJ, glTF, FBX und USD um](https://developer.apple.com/videos/play/wwdc2022/10141/). In Blender wählst du File, Export, Universal Scene Description und die Dateiendung .usdz.

Unsere Empfehlung: Bearbeitest du Modelle, exportiere aus Blender und prüfe in Quick Look am Mac. Verkaufst du auf Shopify, lade GLB hoch und lass die USDZ erzeugen. Für eigene Websites hält ein Browser-Export eine gemeinsame Quelldatei; vergleiche danach ihre Größe mit der GLB.

Startest du mit einem Foto, liefern manche Bild-zu-3D-Werkzeuge USDZ neben GLB, sodass die Umwandlung entfällt. Die Schritte stehen in [ein 3D-Modell aus Fotos erstellen](/de/ratgeber/3d-modell-aus-fotos-erstellen).

easyrender liefert beide Dateien zu jedem fertigen Modell. AR kommt bald, damit du das Stück am Handy in deinem Raum ansehen kannst. Die gemessenen Maße gehören weiterhin in den Produkttext, denn AR verwendet die in der Datei gespeicherte Größe.

## Beispiel: ein Eichen-Beistelltisch auf dem iPhone

Schicke dir die USDZ eines Eichen-Beistelltischs in Nachrichten und tippe sie an. Quick Look öffnet zuerst die Objektansicht, in der du das Modell mit einem Finger drehen kannst. Wechsle zu AR, richte die Kamera auf den Boden und tippe die Stelle an, an der der Tisch erscheinen soll.

Geh darum herum und prüfe, wo die Beine den Boden berühren. Liegt die Modellbasis etwas daneben, scheint der Tisch zu schweben.

![Runder Massivholztisch als drehbares 3D-Modell, dessen Beine sich von allen Seiten prüfen lassen](/showcase/coffee-table.glb "Ein von easyrender aus einem Foto erstellter Massivholztisch, hier als GLB: 16.228 Dreiecke. Seine USDZ entsteht aus derselben GLB, deshalb stimmen beide überein. Drehe ihn und prüfe den Bodenkontakt der Beine.")

Prüfe danach die Maserung unter deiner eigenen Lampe. Ihr Licht ist wärmer als das Studiolicht des Ausgangsfotos.

## Was geht bei USDZ schief, und wie behebst du es?

Die meisten USDZ-Probleme entstehen beim Bereitstellen oder Konvertieren. Diese Liste führt vom sichtbaren Fehler zur Änderung.

| Symptom                                 | Ursache                                                 | Lösung                                                                |
| --------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Tippen lädt herunter statt AR zu öffnen | `rel="ar"` fehlt oder falscher Inhaltstyp               | `rel="ar"` ergänzen, als `model/vnd.usdz+zip` bereitstellen           |
| Kein AR-Symbol am Vorschaubild          | Mehr als ein Kindelement oder iOS älter als 12          | Genau ein `img` oder `picture` verwenden, auf aktuellem iPhone testen |
| Stück erscheint riesig oder winzig      | Quick Look nutzt hinterlegte, nie gemessene Abmessungen | Maße in den Text schreiben; Käufer können per Fingergeste umskalieren |
| Stück schwebt über dem Boden            | Modellbasis liegt über dem Ursprung                     | Ursprung in Blender an die Basis verschieben, erneut exportieren      |
| Farben flacher als in Blender           | Materialaufbau lässt sich nicht nach USD übertragen     | In Quick Look am Mac prüfen, Material vereinfachen                    |
| Rundungen wirken kantig                 | Ausgangs-GLB hatte keine Normalen                       | Vor der Umwandlung weiche Normalen ergänzen                           |
| Datei lässt sich schlecht versenden     | Textgeometrie und PNG-Texturen                          | Binäre Geometrie und JPEG exportieren, Größen vergleichen             |

## GLB zu USDZ: Solltest du beide behalten?

Ja, wenn das Modell auf eine Produktseite soll. GLB deckt Web und Android ab, USDZ AR auf Apple-Geräten. Shopify akzeptiert beispielsweise beide als Produktmedien und erstellt die fehlende Variante selbst.

Die Anleitung [ein 3D-Modell erstellen](/de/ratgeber/3d-modell-erstellen) erklärt die Herkunft beider Dateien unabhängig von der Methode. Für Shops zeigt [3D-Modelle für Onlineshops](/de/ratgeber/3d-modelle-fuer-onlineshops), welche Produkte davon profitieren.

## FAQ

### Kannst du eine USDZ-Datei unter Android öffnen?

Nicht direkt, denn Android-AR nutzt Googles Scene Viewer für glTF und GLB statt USDZ. Verwende eine GLB-Version, um dasselbe Modell unter Android zu zeigen. Hast du nur die Apple-Datei, kannst du sie mit Blender ab 3.5 importieren und als GLB exportieren; prüfe danach die Materialien in einem Betrachter erneut.

### Kannst du USDZ in GLB umwandeln?

Ja, importiere die USDZ in Blender ab Version 3.5 und exportiere sie als glTF 2.0 im binären GLB-Format. Prüfe das Ergebnis in einem Betrachter: USD und glTF beschreiben Oberflächen unterschiedlich. Manche Materialeinstellungen, etwa Klarlack auf lackiertem Holz, lassen sich deshalb zwischen den beiden Formaten nicht vollständig unverändert übertragen.

### Warum erscheint ein USDZ-Modell in AR in falscher Größe?

AR Quick Look verwendet die in der Datei gespeicherte Größe. Wurde das Modell ohne gemessene Abmessungen erstellt, etwa aus einem Foto oder einem Scan ohne Referenz, kann es größer oder kleiner als das echte Stück erscheinen. Nutze AR, um den Eindruck im Raum anzusehen; Abmessungen prüfst du anhand der Produktangaben.

### Warum ist eine USDZ größer als ihre ursprüngliche GLB?

Meist liegt es am Konverter: Geometrie als Text braucht mehrfach mehr Bytes als Binärdaten, und USDZ listet WebP nicht als Bildtyp. Eine kleine WebP-Textur wird deshalb umgewandelt, häufig in eine deutlich größere PNG. Ein Export mit binärer .usdc-Geometrie und JPEG-Texturen senkt die Größe wieder, ohne dass du das Oberflächennetz vereinfachen musst.

### Sind USDZ und USD dasselbe?

USDZ ist ein Paket aus USD. Eine USD-Szene kann aus Text (.usda), Binärdaten (.usdc) oder mehreren aufeinander verweisenden Dateien bestehen. USDZ bündelt diese Ebenen und Texturen in einer unkomprimierten Datei; dadurch lässt sich das Modell als einzelne Datei per Nachricht versenden und auf dem iPhone ohne getrennte Begleitdateien öffnen.
