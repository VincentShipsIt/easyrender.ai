---

group: how-to-make-a-3d-model-from-photos
title: "3D-Modell aus Fotos erstellen: So gehst du vor"
description: "Ein 3D-Modell aus Fotos erstellen: das passende Bild wählen, verdeckte Seiten prüfen und GLB sowie USDZ herunterladen. Mit Schritten und Fehlerhilfe."
date: 2026-11-11
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: 3d modell aus fotos erstellen
cta: Wähle ein scharfes Katalogfoto, etwa einen Sessel oder ein Sideboard aus Dreiviertelansicht, und prüfe alle Seiten, bevor du einen Credit ausgibst.
---

Um ein 3D-Modell aus Fotos zu erstellen, gibst du einem Bild-zu-3D-Werkzeug ein scharfes, gleichmäßig beleuchtetes Foto eines einzelnen Gegenstands, aus dem es die nicht fotografierten Seiten ableitet. Alternativ nutzt du Fotogrammetrie mit mindestens 20 überlappenden Aufnahmen rund um das Objekt. Bei beiden Methoden bestimmt das Foto einen großen Teil des Ergebnisses.

![Illustration einer verzinkten Gießkanne, zur Hälfte aus Metall und zur Hälfte aus mattgrauem Ton mit weißem Drahtgitter, vor dunklem Hintergrund](/blog/illustrations/how-to-make-a-3d-model-from-photos/hero.webp "Illustration, kein easyrender-Ergebnis: eine Gießkanne, halb als verzinktes Metall, halb als Tonmodell mit Drahtgitter gezeichnet.")

## 3D-Modell aus Fotos erstellen: ein Foto oder viele?

Die Zahl der Fotos hängt von einer Frage ab: Steht der Gegenstand vor dir? Fotogrammetrie und LiDAR brauchen ihn vor Ort. Bild-zu-3D braucht nur ein Foto und eignet sich deshalb für das Lieferantenbild eines Sideboards, das du nie in der Hand hattest.

Fotogrammetrie setzt überlappende Fotos zu einem Modell zusammen. [Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) verlangt mindestens 20 mit etwa 70% Überlappung, bei detailreichen Objekten 100 oder mehr. [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) beginnt nach 20 Bildern mit der Analyse, nimmt bis zu 300 an und empfiehlt Kreise und Bögen auf verschiedenen Höhen.

LiDAR auf einem iPhone Pro oder iPad Pro misst die Tiefe, während du um das Möbelstück gehst. Das geht bei großen, einfachen Formen schnell, erfasst aber feine Details wie gedrechselte Stäbe weniger gut.

![Zwei Wege im Vergleich: Fotogrammetrie nutzt 20 bis 100 oder mehr überlappende Fotos eines vorhandenen Objekts; Bild-zu-3D leitet aus einem Foto auch die nicht fotografierten Seiten ab](diagram:photo-vs-photogrammetry "Fotogrammetrie vermisst, was die Kamera gesehen hat. Bild-zu-3D nutzt ein Foto, aus dem auch die nicht gezeigten Seiten entstehen. Fotozahlen nach Polycams Anleitung zum Objektmodus.")

So würden wir im Einzelfall entscheiden:

- Nur ein Lieferantenfoto, das Möbelstück im Ausland: Bild-zu-3D, denn die anderen Wege brauchen das Objekt vor Ort.
- Das Stück im Lager, eine strukturierte Oberfläche wie Eiche oder Leinen, eine Stunde Zeit: Fotogrammetrie. Sie erfasst die vorhandene Oberfläche.
- Ein großes, schlichtes Stück wie ein Dreisitzer und ein iPhone Pro zur Hand: LiDAR. Die Form zählt hier mehr als das Gewebe.
- Glas, Spiegel oder poliertes Chrom: Keine Methode funktioniert gut, weil Reflexionen als Oberfläche gelesen werden.

Die Unterschiede zwischen vielen Aufnahmen und einem Foto erklärt [Fotogrammetrie-Software oder Ein-Foto-KI](/compare/photogrammetry-software).

## Wie funktioniert Bild-zu-3D?

Die Werkzeuge gehen auf zwei Arten vor. Manche erzeugen das Modell direkt aus dem Foto. Andere zeichnen den Gegenstand zuerst aus mehreren Blickwinkeln und bauen daraus das Modell, sodass für die verdeckten Seiten mehr Ansichten vorliegen.

easyrender nutzt den zweiten Weg, den wir nach einem A/B-Vergleich mit echten Verkaufsanzeigen gewählt haben. Damals zeichnete ein größeres Bildmodell die Ansichtenübersicht. Heute übernimmt das ein günstigeres Modell, das wir noch nicht auf dieselbe Weise verglichen haben.

Der erste Schritt ist die Ansichtenübersicht: ein quadratisches Bild mit einem Raster aus 3 mal 3 Feldern.

Acht Felder umrunden das Objekt in 45-Grad-Schritten, von vorne bis vorne links, das neunte zeigt es von oben. In jedem Feld steht es vollständig und mittig vor weißem Hintergrund bei weichem Licht. Im zweiten Schritt entsteht aus deinem Foto und diesen neun Ansichten ein zusammenhängendes Oberflächennetz mit Textur.

![Fünf Schritte in zwei Phasen: Foto, Ansichtenübersicht, Prüfung von Rückseite und Seiten, Modellberechnung und GLB sowie USDZ; bei falscher Vorschau geht es zurück zum Foto](diagram:image-to-3d-pipeline "Der zweistufige Weg dieser Anleitung. Bei easyrender ist die Ansichtenübersicht kostenlos; Credits werden erst in Schritt 4 eingesetzt, wenn du das Modell erstellen lässt.")

Gesamtform und Farbe lassen sich aus einem Foto gut ableiten, verdeckte Stellen wie der Raum hinter einem offenen Geflecht dagegen nicht ablesen. Symmetrie dient dabei als Anhaltspunkt. Unsere Standardanweisung verlangt, verdeckte Seiten vorsichtig aus der sichtbaren Konstruktion abzuleiten und keine Logos, Texte oder Verzierungen hinzuzuerfinden.

Für Möbel ergänzen wir Regeln aus unseren Tests: Die Anzahl von Beinen, Armlehnen, Kissen und Schubladen sowie Holzmaserung und Nähte müssen erhalten bleiben. Andere Wege zum Modell vergleicht die Anleitung [ein 3D-Modell erstellen](/de/ratgeber/3d-modell-erstellen).

## Schritt 1: Wähle das richtige Foto

Das beste Foto zeigt den ganzen Gegenstand scharf vor schlichtem Hintergrund bei weichem, gleichmäßigem Licht. Nichts verdeckt ihn: kein Kissen auf der Armlehne, keine Pflanze vor einem Bein.

Bei Möbeln eignet sich die Dreiviertelansicht besser als ein reines Frontalfoto. Von vorne bleibt die Sitztiefe eines Sessels verborgen. Aus Dreiviertelansicht zeigt das Foto Vorderseite und eine Seite zugleich, sodass weniger von der Form fehlt.

![Bouclé-Sessel mit Stahlrohrgestell, aus Dreiviertelansicht vor weißem Hintergrund fotografiert](/showcase/armchair.jpg "Ein geeignetes Ausgangsfoto: der ganze Sessel, Dreiviertelansicht, schlichter Hintergrund.")

Die Datei muss ein JPEG, PNG oder WebP unter 4 MB sein.

Auch für die Auflösung gibt es Untergrenzen. Unsere Upload-Prüfung lehnt Fotos mit weniger als 400 Pixeln an der kürzesten Seite ab und warnt unter 800. Sie lehnt außerdem Bilder ab, die mehr als viermal so breit wie hoch oder so kontrastarm sind, dass sie vermutlich leer sind.

Oberhalb dieser Grenzen zählt Schärfe mehr als Pixelzahl; deshalb prüfen wir auch eine verkleinerte Kopie jedes Uploads auf Unschärfe. Prüfe dein Foto selbst bei 100% Vergrößerung an einer Beinkante. Ist dort kein Gewebe oder keine Maserung erkennbar, fehlt diese Information auch für das Modell.

Prüfe vor dem Hochladen:

- Das ganze Stück ist mit etwas Rand zu sehen, auch die Füße sind nicht abgeschnitten.
- Die Kamera war ungefähr auf halber Objekthöhe, statt aus dem Stand nach unten zu zeigen.
- Die Kanten sind in voller Größe scharf, nicht nur auf dem Handydisplay.
- Das Licht ist gleichmäßig, ohne harten Schatten quer über dem Objekt.
- Der Hintergrund ist schlicht: eine Wand, ein Papierhintergrund oder ein sauberer Boden.
- Das Foto zeigt einen Gegenstand, kein eingerichtetes Zimmer.

## Schritt 2: Entferne alles, was nicht zum Gegenstand gehört

Ein unruhiger Hintergrund führt leicht zu falschen Formen. Ein Teppichmuster kann als Teil eines Tischfußes gelesen werden, ein Vorhang mit einer davorstehenden Stehlampe verschmelzen.

Hast du nur ein Foto im eingerichteten Raum, schneide es mit etwas Rand um das Möbelstück zu. Ein langes Sideboard darf bis zu viermal so breit wie hoch sein. Darüber verlangt unsere Prüfung ein Foto, das das ganze Produkt zeigt.

Freistellen hilft, hat aber einen Haken: Werkzeuge zur Hintergrundentfernung können einen hellen Saum an den Kanten lassen. Dieser Saum kann als Teil des Gegenstands gelesen werden. Prüfe die Kante vor dem Upload in voller Größe.

Schatten gehören ebenfalls zum Hintergrund. Ein harter Schatten unter einem Couchtisch kann zu einer dunklen Platte an den Beinen werden. Weiches Licht bei bedecktem Himmel ist deshalb das Warten wert.

## Schritt 3: Prüfe die Vorschau von allen Seiten

Gute Bild-zu-3D-Werkzeuge zeigen den Gegenstand aus mehreren Blickwinkeln, bevor sie das fertige Modell berechnen. Prüfe besonders Rückseite und Seiten, die auf deinem Foto nicht zu sehen waren.

Lies die Übersicht wie einen Kontaktbogen. Zähle Beine, Türen und Schubladen in jedem Feld, nicht nur vorne. Vergleiche dann gegenüberliegende Ansichten wie vorne rechts und hinten links: Wechseln die Armlehnen ihre Form, wird der Sessel schief.

Die Draufsicht zeigt, was andere Ansichten verbergen. Ein von oben ovaler statt runder Lampenschirm oder eine an einem Ende breitere Tischplatte fallen dort zuerst auf.

![Neun Ansichten desselben Bouclé-Sessels, vorne, seitlich, hinten und von oben, aus dem einzelnen Foto darüber erzeugt](/showcase/armchair-angles.jpg "Die kostenlose, unbearbeitete Ansichtenübersicht von easyrender aus diesem einen Foto. Rückseite und Draufsicht sind aus dem Foto abgeleitet.")

Einige Fehler erkennen unsere Prüfungen vorab: eine Übersicht unter 768 Pixeln, ein in mehr als zwei Feldern fehlendes Objekt oder mehr als drei der acht Rundumansichten, die nahezu gleich aussehen.

Die letzte Prüfung stammt aus Tests. Auf kleinen Graustufenkopien unterscheiden sich zwei tatsächlich verschiedene Ansichten um mindestens 3%, Wiederholungen um weniger als 1%. Eine Übersicht, die in jedes Feld dasselbe Foto setzt, liefert keine zusätzlichen Ansichten für den Modellbau.

Das Zählen braucht einen Menschen. Vergleiche Türen, Schubladen und Beine in jedem Feld mit dem echten Stück, bevor du das Modell erstellen lässt. Stimmt die Vorschau nicht, ändere das Foto oder ergänze einen Hinweis, statt denselben Ausgangspunkt erneut zu verwenden.

easyrender nimmt zu jedem Foto einen kurzen Hinweis für unsichtbare Details an: „vier Türen“, „offene Rückseite“, „Messinggriffe“. Die Übersicht oben ist ein echtes Ergebnis aus dem Foto in Schritt 1. Die Vorschau ist zweimal täglich ohne Credits kostenlos; Credits brauchst du erst für das Modell.

Die kostenlose Vorschau trägt ein Wasserzeichen „easyrender.ai preview“, das in der Übersicht oben fehlt. [Lade ein Foto hoch](/de)

## Schritt 4: Erstelle das Modell und lade die Dateien herunter

Stimmt die Form, berechnet das Werkzeug ein 3D-Modell mit Textur. Die meisten liefern GLB, das Standardformat für Web und Android. Viele liefern zusätzlich USDZ, das iPhone und iPad in AR Quick Look öffnen.

Unsere Berechnung fordert eine 2048-Pixel-Textur an und liefert ein Oberflächennetz mit einem Material, dessen Farbe aus einem Basisfarbbild stammt. Ein Netz und ein Material sind für jeden Betrachter der einfachste Fall. Damit liegen wir deutlich unter den höchstens 10 Materialien, die Scene Viewer empfiehlt.

Die sechs Modelle unserer Beispielgalerie reichen von 14.590 Dreiecken bei einer Tonvase bis 69.910 bei einem Nachttisch mit Schubladen. Alle bleiben unter den 100.000 Dreiecken, die [Googles Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) als Obergrenze empfiehlt.

![Bouclé-Sessel als texturiertes 3D-Modell aus dem Foto in Schritt 1 in einem 3D-Betrachter](/showcase/armchair.glb "Das Modell, das easyrender aus dem Foto und der Ansichtenübersicht erstellt hat, mit für diese Seite komprimierten Texturen: 25.879 Dreiecke, 538 KB. Ziehe zum Drehen, prüfe die Rückseite und betrachte den Stoff vor der Veröffentlichung bei neutralem Licht.")

Eine GLB öffnest du in Blender über File, Import, glTF 2.0 oder in kostenlosen Browser-Betrachtern wie der [Babylon.js Sandbox](https://sandbox.babylonjs.com/). Aktiviere in Blender Statistics in den Viewport Overlays, um die Dreieckszahl zu lesen. Öffne die Datei vor dem Einsatz einmal und drehe sie langsam.

easyrender liefert beide Dateien zu jedem fertigen Modell. Die USDZ entsteht beim Herunterladen in deinem Browser aus der GLB, sodass beide übereinstimmen. AR kommt bald; AR-Betrachter verwenden die in der Datei gespeicherte Größe, deshalb gehören die gemessenen Abmessungen in deine Anzeige.

Was in den Dateien steckt, erklären [die GLB-Datei](/de/ratgeber/glb-datei) und [die USDZ-Datei](/de/ratgeber/usdz-datei).

## Was geht schief, und wie behebst du es?

Die meisten falschen Formen lassen sich auf das Foto zurückführen. Diese Liste gehen wir vom sichtbaren Fehler bis zur Lösung durch.

| Symptom                                                   | Ursache                                                                                                                                                             | Lösung                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Upload als zu klein abgelehnt                             | Die kürzeste Seite hat unter 400 Pixel, meist bei Vorschaubildern oder Screenshots                                                                                  | Nutze die Originaldatei der Kamera oder des Lieferanten, sofern sie unter 4 MB bleibt      |
| Upload als zu schmal abgelehnt                            | Das Bild ist mehr als viermal so breit wie hoch, etwa nach einem Bannerzuschnitt                                                                                    | Schneide auf das Objekt zu, mit Rand an jeder Seite                                        |
| Zwei Stuhlbeine verschmelzen                              | Auf dem Frontalfoto liegen die hinteren Beine hinter den vorderen                                                                                                   | Nutze eine Dreiviertelaufnahme mit vier getrennt sichtbaren Beinen                         |
| Aus vier Türen werden drei                                | Die Fugen zwischen den Türen haben zu wenig Kontrast                                                                                                                | Fotografiere mit seitlich über die Front fallendem Licht oder ergänze „vier Türen“         |
| Die Rückseite ähnelt der Vorderseite                      | Das Foto zeigt nur vorne, deshalb folgt auch die Rückseite dieser Ansicht                                                                                           | Ergänze „offene Rückseite“ oder „schlichte Rückseite“, oder fotografiere eine hintere Ecke |
| Rattan oder Wiener Geflecht wird zum aufgedruckten Muster | Ein Foto zeigt nicht, was hinter den Lücken liegt                                                                                                                   | Akzeptiere es für einen kleinen Betrachter oder nutze Fotogrammetrie                       |
| Stoff wirkt gelber oder dunkler als auf dem Foto          | Das Licht im Betrachter unterscheidet sich, oder Metallic fehlt und glTF verwendet vollständig metallisch als Standard                                              | Prüfe bei neutralem Licht und setze Metallic vor der Veröffentlichung in Blender auf 0     |
| Oberflächen wirken bei Seitenlicht kantig                 | Der Datei fehlen Vertex-Normalen, sodass Betrachter gemäß [glTF-Spezifikation](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) flache Normalen berechnen | Nutze Shade Smooth in Blender und exportiere erneut                                        |

## Woran erkennst du, dass das Modell bereit ist?

Lege deine Anforderungen vorher fest, sonst erscheint jedes Modell ausreichend. Jede unserer Prüfungen lässt sich mit Ja oder Nein beantworten.

1. Die Anzahl von Beinen, Türen, Schubladen und Griffen stimmt mit dem Produkt überein.
2. Wer das Stück besitzt, erkennt Rückseite und Unterseite wieder.
3. Die Textur überzeugt in voller Bildschirmgröße, nicht nur im Vorschaubild.
4. Die Datei öffnet sich im Browser, auf einem iPhone und auf einem Android-Handy.
5. Die Datei erfüllt die Vorgaben am Einsatzort: [Shopify](https://help.shopify.com/en/manual/products/product-media/product-media-types) nimmt 3D-Modelle bis 500 MB an, Scene Viewer empfiehlt 10 MB und 100.000 Dreiecke.

Scheitert das Modell an Prüfung 1 oder 2, geh mit einem neuen Foto oder Hinweis zu Schritt 1 zurück. Bei Prüfung 5 reicht Komprimieren; das erklärt der GLB-Ratgeber.

## Was ein Modell aus einem Foto nicht leisten kann

Ein Foto liefert keine gemessenen Abmessungen. Braucht ein Käufer Maße, schreibe sie in die Anzeige.

Feine Details sind auf einem einzelnen Foto oft nicht ausreichend erkennbar: ein kleines Logo an der Lehne, dünne Messinggriffe oder Text auf einer Schachtel. Offenes Rattan erscheint häufig als Muster auf einer geschlossenen Fläche, weil das Foto nicht zeigt, was hinter jeder Lücke liegt.

Glas, Spiegel und poliertes Chrom erschweren jede Methode einschließlich Fotogrammetrie, weil ihre Oberfläche die Umgebung zeigt statt sich selbst. Diese Werkzeuge erfassen außerdem jeweils einen Gegenstand, kein eingerichtetes Zimmer.

## FAQ

### Wie viele Fotos brauchst du für ein 3D-Modell?

Für KI-Bild-zu-3D reicht ein Foto, aus dem die nicht gezeigten Seiten abgeleitet werden. Fotogrammetrie erfasst dagegen jede Seite und braucht mindestens 20 überlappende Aufnahmen, bei detailreichen Stücken oft 100 oder mehr. Das bringt genauere Oberflächen, setzt aber voraus, dass du das Objekt vor dir und Platz zum Umrunden hast.

### Welche Auflösung sollte dein Foto haben?

Mindestens 800 Pixel an der kürzesten Seite, gern mehr. easyrender lehnt Fotos unter 400 Pixeln ab, warnt unter 800 und prüft jeden Upload auf Unschärfe. Darüber zählt Schärfe mehr als Größe: Vergrößere eine Kante auf 100%; ist dort keine Maserung oder Webstruktur sichtbar, fehlt diese Information auch für das Modell.

### Ist Bild-zu-3D dasselbe wie Fotogrammetrie?

Nein, Fotogrammetrie vermisst das Objekt anhand vieler echter Aufnahmen, sodass jede dargestellte Oberfläche von der Kamera gesehen wurde. Bild-zu-3D beginnt mit einem Foto und leitet daraus die nicht gezeigten Seiten ab. Fotogrammetrie braucht das Stück vor Ort; für Bild-zu-3D reicht ein Katalogfoto eines Möbelstücks, das du nie angefasst hast.

### Ist es kostenlos, aus einem Foto ein 3D-Modell zu erstellen?

Das Ausprobieren meist schon, die fertige Datei meist nicht: Viele Werkzeuge bieten eine kostenlose Stufe oder Vorschau und berechnen Modelle einzeln oder im Abo. Bei easyrender ist die Ansichtenübersicht zweimal täglich ohne Credits kostenlos; ein fertiges Modell kostet {{renderCredits}} Credits, also {{renderPrice}} bei {{creditPrice}} pro Credit laut Preisseite.

### Kannst du ein Modell aus einem Foto in 3D drucken?

Betrachte es als Bildschirmmodell: Das Foto zeigt nicht jede Seite und liefert keine gemessenen Abmessungen, deshalb entspräche ein Druck nicht dem echten Stück. easyrender exportiert GLB und USDZ für Web und AR, nicht STL oder Druckdateien. Für ein gedrucktes Bauteil erstellst du stattdessen ein CAD-Modell anhand tatsächlich gemessener Maße.
