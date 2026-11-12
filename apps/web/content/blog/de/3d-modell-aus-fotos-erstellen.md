---

group: how-to-make-a-3d-model-from-photos
title: "3D-Modell aus Fotos erstellen: So gehst du vor"
description: "So erstellst du ein 3D-Modell aus Fotos: Wähle ein geeignetes Bild, prüfe die nicht fotografierten Seiten und lade GLB und USDZ herunter."
date: 2026-11-11
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: 3d modell aus fotos erstellen
cta: Wähle ein scharfes Katalogfoto, das einen Sessel oder ein Sideboard schräg von vorne zeigt, und prüfe alle Seiten, bevor du einen Credit ausgibst.
---

Um ein 3D-Modell aus Fotos zu erstellen, lädst du ein scharfes, gleichmäßig beleuchtetes Foto eines einzelnen Gegenstands in ein KI-Tool hoch, das daraus auch die nicht fotografierten Seiten ableitet. Alternativ nutzt du Fotogrammetrie mit mindestens 20 überlappenden Aufnahmen rund um das Objekt. Bei beiden Methoden hängt das Ergebnis vor allem von den Fotos ab.

![Illustration einer verzinkten Gießkanne, zur Hälfte aus Metall und zur Hälfte aus mattgrauem Ton mit weißem Drahtgitter, vor dunklem Hintergrund](/blog/illustrations/how-to-make-a-3d-model-from-photos/hero.webp "Illustration, kein easyrender-Ergebnis: eine Gießkanne, halb als verzinktes Metall, halb als Tonmodell mit Drahtgitter gezeichnet.")

## 3D-Modell aus Fotos erstellen: ein Foto oder viele?

Die Zahl der Fotos hängt von einer Frage ab: Steht der Gegenstand vor dir? Fotogrammetrie und LiDAR brauchen ihn vor Ort. Für ein 3D-Modell mit KI reicht ein Foto, etwa das Lieferantenbild eines Sideboards, das du selbst noch nie gesehen hast.

Fotogrammetrie setzt überlappende Fotos zu einem Modell zusammen. [Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) verlangt mindestens 20 mit etwa 70% Überlappung, bei detailreichen Objekten 100 oder mehr. [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) beginnt nach 20 Bildern mit der Analyse, nimmt bis zu 300 an und empfiehlt Kreise und Bögen auf verschiedenen Höhen.

LiDAR auf einem iPhone Pro oder iPad Pro misst die Tiefe, während du um das Möbelstück gehst. Das geht bei großen, einfachen Formen schnell, erfasst aber feine Details wie gedrechselte Stäbe weniger gut.

![Zwei Wege im Vergleich: Fotogrammetrie nutzt 20 bis 100 oder mehr überlappende Fotos eines vorhandenen Objekts; KI leitet aus einem Foto auch die nicht fotografierten Seiten ab](diagram:photo-vs-photogrammetry "Fotogrammetrie vermisst, was die Kamera gesehen hat. Bei einem 3D-Modell aus nur einem Foto werden auch die nicht gezeigten Seiten aus diesem Bild abgeleitet. Fotozahlen nach Polycams Anleitung zum Objektmodus.")

So würden wir im Einzelfall entscheiden:

- Nur ein Lieferantenfoto, das Möbelstück im Ausland: 3D aus einem Foto mit KI, denn für die anderen Wege muss das Objekt vor Ort sein.
- Das Stück im Lager, eine strukturierte Oberfläche wie Eiche oder Leinen, eine Stunde Zeit: Fotogrammetrie. Sie erfasst die vorhandene Oberfläche.
- Ein großes, schlichtes Stück wie ein Dreisitzer und ein iPhone Pro zur Hand: LiDAR. Hier zählt die Form mehr als die Stoffstruktur.
- Glas, Spiegel oder poliertes Chrom: Keine Methode funktioniert gut, weil Reflexionen als Oberfläche gelesen werden.

Die Unterschiede zwischen vielen Aufnahmen und einem Foto erklärt [Fotogrammetrie oder 3D aus einem Foto](/compare/photogrammetry-software).

## Wie entsteht aus einem Foto ein 3D-Modell?

Die Programme arbeiten auf zwei Arten. Manche erzeugen das Modell direkt aus dem Foto. Andere zeichnen den Gegenstand zuerst aus mehreren Blickwinkeln und bauen daraus das Modell, sodass für die verdeckten Seiten mehr Ansichten vorliegen.

easyrender nutzt den zweiten Weg, den wir nach einem A/B-Vergleich mit echten Verkaufsanzeigen gewählt haben. Damals zeichnete ein größeres Bildmodell das Ansichtenraster. Heute übernimmt das ein günstigeres Modell, das wir noch nicht auf dieselbe Weise verglichen haben.

Zuerst entsteht ein Ansichtenraster: ein quadratisches Bild mit 3 mal 3 Feldern, die den Gegenstand aus verschiedenen Blickwinkeln zeigen.

Acht Felder zeigen das Objekt ringsum in 45-Grad-Schritten, von vorne bis vorne links; das neunte zeigt die Draufsicht. In jedem Feld steht es vollständig und mittig vor weißem Hintergrund bei weichem Licht. Im zweiten Schritt entsteht aus deinem Foto und diesen neun Ansichten ein zusammenhängendes Mesh mit Textur, also ein Netz aus Dreiecken, das die Oberfläche bildet.

![Fünf Schritte in zwei Phasen: Foto, Ansichtenraster, Prüfung von Rückseite und Seiten, Modellberechnung und GLB sowie USDZ; bei falscher Vorschau geht es zurück zum Foto](diagram:image-to-3d-pipeline "Der zweistufige Weg dieser Anleitung. Bei easyrender ist das Ansichtenraster kostenlos; Credits werden erst in Schritt 4 eingesetzt, wenn du das Modell erstellen lässt.")

Gesamtform und Farbe lassen sich aus einem Foto gut ableiten, verdeckte Stellen wie der Raum hinter einem offenen Geflecht dagegen nicht ablesen. Symmetrie dient dabei als Anhaltspunkt. Unsere Standardanweisung verlangt, verdeckte Seiten vorsichtig aus der sichtbaren Konstruktion abzuleiten und keine Logos, Texte oder Verzierungen hinzuzuerfinden.

Für Möbel ergänzen wir Regeln aus unseren Tests: Die Anzahl der Beine, Armlehnen, Kissen und Schubladen muss stimmen; Holzmaserung und Nähte müssen ihre Richtung behalten. Andere Wege zum Modell vergleicht die Anleitung [ein 3D-Modell erstellen](/de/ratgeber/3d-modell-erstellen).

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

Gute KI-Tools zeigen den Gegenstand zunächst aus mehreren Blickwinkeln, bevor sie daraus das fertige 3D-Modell berechnen. Prüfe besonders Rückseite und Seiten, die auf deinem Foto nicht zu sehen waren.

Gehe das Ansichtenraster Feld für Feld durch. Zähle Beine, Türen und Schubladen in jedem Feld, nicht nur vorne. Vergleiche dann gegenüberliegende Ansichten wie vorne rechts und hinten links: Wechseln die Armlehnen ihre Form, wird der Sessel schief.

Die Draufsicht zeigt, was andere Ansichten verbergen. Ein von oben ovaler statt runder Lampenschirm oder eine an einem Ende breitere Tischplatte fallen dort zuerst auf.

![Neun Ansichten desselben Bouclé-Sessels, vorne, seitlich, hinten und von oben, aus dem einzelnen Foto darüber erzeugt](/showcase/armchair-angles.jpg "Das kostenlose, unbearbeitete Ansichtenraster von easyrender aus diesem einen Foto. Rückseite und Draufsicht sind aus dem Foto abgeleitet.")

Einige Fehler erkennen unsere Prüfungen vorab: ein Ansichtenraster unter 768 Pixeln, ein in mehr als zwei Feldern fehlendes Objekt oder mehr als drei der acht Rundumansichten, die nahezu gleich aussehen.

Die letzte Prüfung haben wir aus unseren Tests abgeleitet. Auf kleinen Graustufenkopien unterscheiden sich zwei tatsächlich verschiedene Ansichten um mindestens 3%, Wiederholungen um weniger als 1%. Steht in jedem Feld dasselbe Foto, fehlen zusätzliche Ansichten für die Berechnung des Modells.

Beine, Türen und Schubladen musst du selbst nachzählen. Vergleiche die Anzahl in jedem Feld mit dem echten Stück, bevor du das Modell erstellen lässt. Stimmt die Vorschau nicht, ändere das Foto oder ergänze einen Hinweis, statt denselben Ausgangspunkt erneut zu verwenden.

Bei easyrender kannst du zum Foto einen kurzen Hinweis auf Details ergänzen, die darauf nicht zu sehen sind: „vier Türen“, „offene Rückseite“, „Messinggriffe“. Das Ansichtenraster oben ist ein echtes Ergebnis aus dem Foto in Schritt 1. Du kannst zweimal täglich kostenlos und ohne Credits eine Vorschau erstellen; Credits brauchst du erst für das Modell.

Die kostenlose Vorschau trägt ein Wasserzeichen „easyrender.ai preview“, das im Ansichtenraster oben fehlt. [Lade ein Foto hoch](/de)

## Schritt 4: Erstelle das Modell und lade die Dateien herunter

Stimmt die Form, berechnet das Werkzeug ein 3D-Modell mit Textur. Die meisten liefern GLB, das Standardformat für Web und Android. Viele liefern zusätzlich USDZ, das iPhone und iPad in AR Quick Look öffnen.

Für die Berechnung geben wir eine Textur mit 2048 Pixeln vor. Das Ergebnis besteht aus einem Mesh und einem Material, dessen Farbe aus einer Grundfarbtextur stammt; diesen einfachen Aufbau kann jeder 3D-Betrachter gut verarbeiten. Damit liegen wir deutlich unter den höchstens 10 Materialien, die Scene Viewer empfiehlt.

Die sechs Modelle unserer Beispielgalerie reichen von 14.590 Dreiecken bei einer Tonvase bis 69.910 bei einem Nachttisch mit Schubladen. Alle bleiben unter den 100.000 Dreiecken, die [Googles Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) als Obergrenze empfiehlt.

![Bouclé-Sessel als texturiertes 3D-Modell aus dem Foto in Schritt 1 in einem 3D-Betrachter](/showcase/armchair.glb "Das Modell, das easyrender aus dem Foto und dem Ansichtenraster erstellt hat, mit für diese Seite komprimierten Texturen: 25.879 Dreiecke, 538 KB. Ziehe zum Drehen, prüfe die Rückseite und betrachte den Stoff vor der Veröffentlichung bei neutralem Licht.")

Eine GLB öffnest du in Blender über File, Import, glTF 2.0 oder in kostenlosen Browser-Betrachtern wie der [Babylon.js Sandbox](https://sandbox.babylonjs.com/). Aktiviere in Blender Statistics in den Viewport Overlays, um die Dreieckszahl abzulesen. Öffne die Datei vor dem Einsatz einmal und drehe sie langsam.

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
| Die Rückseite ähnelt der Vorderseite                      | Das Foto zeigt nur die Vorderseite; daraus wird auch die Rückseite abgeleitet                                                                                           | Ergänze „offene Rückseite“ oder „schlichte Rückseite“, oder fotografiere eine hintere Ecke |
| Rattan oder Wiener Geflecht wird zum aufgedruckten Muster | Ein Foto zeigt nicht, was hinter den Lücken liegt                                                                                                                   | Für eine kleine Modellansicht kann das genügen; sonst nutze Fotogrammetrie                       |
| Stoff wirkt gelber oder dunkler als auf dem Foto          | Das Licht im Betrachter unterscheidet sich, oder Metallic fehlt und glTF verwendet vollständig metallisch als Standard                                              | Prüfe bei neutralem Licht und setze Metallic vor der Veröffentlichung in Blender auf 0     |
| Oberflächen wirken bei Seitenlicht kantig                 | Der Datei fehlen Vertex-Normalen, sodass Betrachter gemäß [glTF-Spezifikation](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) flache Normalen berechnen | Nutze Shade Smooth in Blender und exportiere erneut                                        |

## Woran erkennst du, dass das Modell bereit ist?

Lege vorher fest, was das Modell erfüllen muss, damit du es gezielt prüfen kannst. Jede unserer Prüfungen lässt sich mit Ja oder Nein beantworten.

1. Die Anzahl von Beinen, Türen, Schubladen und Griffen stimmt mit dem Produkt überein.
2. Wer das Stück besitzt, erkennt Rückseite und Unterseite wieder.
3. Die Textur überzeugt in voller Bildschirmgröße, nicht nur im Vorschaubild.
4. Die Datei öffnet sich im Browser, auf einem iPhone und auf einem Android-Handy.
5. Die Datei erfüllt die Vorgaben der Plattform: [Shopify](https://help.shopify.com/en/manual/products/product-media/product-media-types) nimmt 3D-Modelle bis 500 MB an, Scene Viewer empfiehlt 10 MB und 100.000 Dreiecke.

Scheitert das Modell an Prüfung 1 oder 2, geh mit einem neuen Foto oder Hinweis zu Schritt 1 zurück. Bei Prüfung 5 reicht Komprimieren; das erklärt der GLB-Ratgeber.

## Was ein Modell aus einem Foto nicht leisten kann

Ein Foto liefert keine gemessenen Abmessungen. Braucht ein Käufer Maße, schreibe sie in die Anzeige.

Feine Details sind auf einem einzelnen Foto oft nicht ausreichend erkennbar: ein kleines Logo an der Lehne, dünne Messinggriffe oder Text auf einer Schachtel. Offenes Rattan erscheint häufig als Muster auf einer geschlossenen Fläche, weil das Foto nicht zeigt, was hinter jeder Lücke liegt.

Glas, Spiegel und poliertes Chrom erschweren jede Methode einschließlich Fotogrammetrie, weil ihre Oberfläche die Umgebung zeigt statt sich selbst. Diese Werkzeuge erfassen außerdem jeweils einen Gegenstand, kein eingerichtetes Zimmer.

## FAQ

### Wie viele Fotos brauchst du für ein 3D-Modell?

Für ein 3D-Modell mit KI reicht ein Foto, aus dem die nicht gezeigten Seiten abgeleitet werden. Fotogrammetrie erfasst dagegen jede Seite und braucht mindestens 20 überlappende Aufnahmen, bei detailreichen Stücken oft 100 oder mehr. Das bringt genauere Oberflächen, setzt aber voraus, dass du das Objekt vor dir und Platz zum Umrunden hast.

### Welche Auflösung sollte dein Foto haben?

Mindestens 800 Pixel an der kürzesten Seite, gern mehr. easyrender lehnt Fotos unter 400 Pixeln ab, warnt unter 800 und prüft jeden Upload auf Unschärfe. Darüber zählt Schärfe mehr als Größe: Vergrößere eine Kante auf 100%; ist dort keine Maserung oder kein Gewebe sichtbar, fehlt diese Information auch für das Modell.

### Ist 3D aus einem Foto dasselbe wie Fotogrammetrie?

Nein, Fotogrammetrie vermisst das Objekt anhand vieler echter Aufnahmen, sodass jede dargestellte Oberfläche von der Kamera gesehen wurde. KI beginnt mit einem Foto und leitet daraus die nicht gezeigten Seiten ab. Für Fotogrammetrie brauchst du das Stück vor Ort; für die KI reicht ein Katalogfoto.

### Ist es kostenlos, aus einem Foto ein 3D-Modell zu erstellen?

Das Ausprobieren meist schon, die fertige Datei meist nicht: Viele Tools bieten einen kostenlosen Tarif oder eine Vorschau und berechnen Modelle einzeln oder im Abo. Bei easyrender kannst du zweimal täglich kostenlos und ohne Credits ein Ansichtenraster erstellen; ein fertiges Modell kostet {{renderCredits}} Credits, also {{renderPrice}} bei {{creditPrice}} pro Credit laut Preisseite.

### Kannst du ein Modell aus einem Foto in 3D drucken?

Nutze es zur Darstellung am Bildschirm: Das Foto zeigt nicht jede Seite und liefert keine gemessenen Abmessungen, deshalb entspräche ein Druck nicht dem echten Stück. easyrender exportiert GLB und USDZ für Web und AR, nicht STL oder Druckdateien. Für ein gedrucktes Bauteil erstellst du stattdessen ein CAD-Modell anhand tatsächlich gemessener Maße.
