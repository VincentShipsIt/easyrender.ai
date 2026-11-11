---

group: how-to-make-a-3d-model
title: "3D-Modell erstellen: fünf Wege im Vergleich"
description: "Ein 3D-Modell erstellen mit Blender, Fotogrammetrie, LiDAR, KI oder einem Profi: Voraussetzungen, Zeitaufwand, typische Fehler und Auswahlhilfe."
date: 2026-11-16
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: 3d modell erstellen
cta: Mit einem scharfen Foto eines Stuhls, einer Lampe oder eines Sideboards kannst du alle Seiten prüfen, bevor du dich für ein Modell entscheidest.
---

Du kannst ein 3D-Modell auf fünf Wegen erstellen: in Software wie Blender modellieren, das Objekt mit Fotogrammetrie oder dem LiDAR-Sensor eines Handys scannen, aus einem Foto mit KI erzeugen oder einen 3D-Profi beauftragen. Die Wahl hängt davon ab, ob das Objekt schon existiert, ob es vor dir steht und wie viel Zeit du hast.

![Illustration eines Schachspringers aus Nussbaum, vorne geschnitztes Holz und hinten mattgrauer Ton mit weißem Drahtgitter, vor dunklem Hintergrund](/blog/illustrations/how-to-make-a-3d-model/hero.webp "Illustration, kein easyrender-Ergebnis: ein Schachspringer, halb aus Nussbaum und halb als Tonmodell mit Drahtgitter gezeichnet.")

## Welche Methode passt zu dir?

Existiert das Objekt noch nicht, modelliere es selbst oder beauftrage einen Profi. Existiert es und steht vor dir, kannst du es scannen. Hast du nur ein Foto, nutze Bild-zu-3D.

![Entscheidungsbaum: noch nicht vorhandene Objekte selbst modellieren oder beauftragen; bei nur einem Foto Bild-zu-3D; bei vorhandenem Objekt LiDAR für große einfache Formen oder Fotogrammetrie für Details](diagram:method-decision-tree "Die drei Fragen hinter der Tabelle. Ein 3D-Profi ist auch dann die richtige Wahl, wenn das Modell exakt sein muss.")

Genauigkeit folgt ungefähr dem Aufwand. Ein Profi, der nach Maßen arbeitet, liefert das genaueste Modell. Ein Modell aus einem Foto ist am schnellsten verfügbar; die nicht gezeigten Seiten werden aus diesem Bild abgeleitet.

| Methode              | Voraussetzung                              | Deine Arbeitszeit                               | Geeignet für                                      | Darauf achten                                                          |
| -------------------- | ------------------------------------------ | ----------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Selbst modellieren   | Wochenlange Übung, Referenzfotos, Maße     | Nach dem Lernen ein Tag oder mehr pro Stück     | Noch nicht vorhandene Objekte                     | Proportionen, Texturen und UV-Zuordnung                                |
| Fotogrammetrie       | Objekt vor Ort, 20 bis 100 oder mehr Fotos | Ein bis zwei Stunden Aufnahme plus Verarbeitung | Echte Oberflächendetails                          | Weiß ohne Struktur, Glas, poliertes Metall                             |
| LiDAR am Handy       | iPhone Pro oder iPad Pro, Objekt vor Ort   | Einige Minuten um das Objekt gehen              | Große einfache Formen wie Sofas                   | Weniger Details bei gedrechselten Beinen und Flechtsitzen              |
| KI aus einem Foto    | Ein scharfes Foto                          | Vorschau und Modell prüfen                      | Lieferantenfotos ohne Zugriff auf das Stück       | Das Foto zeigt nur eine Seite und liefert keine gemessenen Abmessungen |
| 3D-Profi beauftragen | Fotos, Maße und Budget                     | Auftrag beschreiben und Entwürfe prüfen         | Exakte Modelle oder ein Modell in mehreren Größen | Zeit für Abstimmung und Beauftragung                                   |

3D-Druck ist kein Thema dieser Anleitung. Hier geht es um Bildschirmmodelle, Produktseiten und AR. Ein druckbares Bauteil braucht ein CAD-Modell aus echten Messwerten, also eine andere Arbeitsweise.

Das Ziel ist bei allen Methoden gleich: Für Produktseiten und Handy-AR empfiehlt Googles [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) höchstens 100.000, idealerweise 30.000 bis 50.000 Dreiecke, Texturen bis 2048 Pixel und Dateien bis 10 MB.

## Methode 1: Selbst in Software modellieren

Blender ist kostenlos, quelloffen und exportiert GLB, FBX, OBJ und USD. SketchUp erleichtert Möbel und Gebäude, weil du [flache Formen zu Körpern ziehen und drücken](https://help.sketchup.com/en/sketchup/pushing-and-pulling-shapes-3d) kannst. Die kostenlose Browser-App [Tinkercad](https://www.tinkercad.com/help-center/what-is-tinkercad) ist ein einfacher Einstieg in Grundformen.

Rechne mit Wochen an Übung, bevor ein selbst modellierter Stuhl richtig aussieht. Anfängern fallen Proportionen und Texturen besonders schwer. Bei der UV-Zuordnung wird eine Oberfläche flach aufgefaltet, um ein Bild daraufzulegen; daran bleiben viele hängen.

Bei einem einfachen Beistelltisch sieht der Ablauf so aus:

1. Referenzen sammeln: Vorderansicht, Seitenansicht und gemessene Abmessungen.
2. Hauptformen aus Quadern und Zylindern bauen: Platte, Beine, Zarge.
3. Kanten leicht abschrägen, damit sie wie echtes Holz Licht fangen.
4. UVs abwickeln und Materialien zuweisen: Holztextur auf der Platte, Metall auf Griffen.
5. Skalierung und Drehung anwenden, damit die exportierte Datei die modellierten Abmessungen behält.
6. Alle Seiten einschließlich Unterseite prüfen und als GLB exportieren.

![Beistelltisch in drei Modellierschritten: grobe Quader und Zylinder, abgeschrägte Kanten und zuletzt Holztextur vor dem Export](diagram:blockout-side-table "Schritte 2 bis 6 an einem einfachen Tisch. Zeichnung für diese Anleitung.")

Zwei Einstellungen retten viele Anfängermodelle. In Blender verhindert Object, Apply, All Transforms vor dem Export, dass ein Tisch im Betrachter verdreht oder mit falschen Abmessungen erscheint. Eine Schachbretttextur vor der eigentlichen Textur zeigt sofort, wo die UV-Abwicklung verzerrt.

## Methode 2: Fotogrammetrie

Fotogrammetrie erstellt ein Modell aus vielen überlappenden Fotos. [Polycams Anleitung](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) verlangt mindestens 20 mit ungefähr 70% Überlappung, in Ringen auf mehreren Höhen bei weichem, gleichmäßigem Licht. Detailreiche Objekte brauchen 100 oder mehr.

![Stehlampe mit Kamerapositionen in drei Höhen, niedrig, mittig und von oben, sowie zwei benachbarten überlappenden Aufnahmen](diagram:photogrammetry-rings "Fotogrammetrie-Aufnahme in Ringen auf mehreren Höhen. Jedes Foto teilt ungefähr 70% seiner Ansicht mit dem nächsten, wie in Polycams Anleitung beschrieben.")

Für brauchbare Aufnahmen gelten immer dieselben Regeln:

1. Weiches, gleichmäßiges Licht nutzen: draußen bei bedecktem Himmel oder drinnen ohne direkte Sonne.
2. Belichtung am Handy sperren, damit die Helligkeit gleich bleibt.
3. Einen niedrigen, einen mittleren und einen hohen, nach unten gerichteten Ring aufnehmen, jeweils schrittweise weitergehen.
4. Das Objekt groß im Bild halten: [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) verlangt mindestens die Hälfte jeder Aufnahme.
5. Während einer Serie nur dich bewegen, nie den Gegenstand.

RealityScan beginnt nach 20 Bildern mit der Verarbeitung und nimmt bis zu 300 an. Die Anleitung benennt die Grenze klar: Was nicht in mehreren Bildern sichtbar ist, erscheint auch nicht im Modell.

RealityScan und Polycam laufen am Handy, das quelloffene [Meshroom](https://alicevision.org/) am Computer. Fotogrammetrie erfasst echte Oberflächendetails gut. Schlichte weiße Flächen, Glas und poliertes Metall sind schwierig, weil sichtbare Strukturen zum Abgleichen der Fotos fehlen.

[Fotogrammetrie-Software oder Ein-Foto-KI](/compare/photogrammetry-software) erklärt, wann sich dieser Aufbau lohnt.

## Methode 3: LiDAR-Scan am Handy

iPhones ab dem iPhone 12 Pro und neuere iPad-Pro-Modelle besitzen einen [LiDAR-Sensor](https://www.apple.com/newsroom/2020/03/apple-unveils-new-ipad-pro-with-lidar-scanner-and-trackpad-support-in-ipados/), der Tiefe direkt misst. Apps wie Polycam erstellen daraus ein Modell, während du um den Gegenstand gehst.

LiDAR arbeitet schnell und erfasst große, einfache Formen wie Sofas gut. Es liefert weniger Details als Fotogrammetrie. Gedrechselte Beine und geflochtene Sitze können deshalb ungleichmäßig aussehen.

Geh langsam mit gleichmäßigem Abstand und sorge für gutes Licht: Die Tiefe kommt vom Sensor, die Farbe von der Kamera. Ziehe ein Sofa zuerst von der Wand weg. Sonst fehlt seine Rückseite.

## Methode 4: Mit KI erzeugen

KI-Werkzeuge erzeugen Modelle aus einem Foto, genannt Bild-zu-3D, oder aus einer Beschreibung, genannt Text-zu-3D. Bild-zu-3D erhält das Aussehen eines echten Produkts. Text-zu-3D erfindet eines, passend für Entwürfe, aber nicht für ein konkretes Verkaufsstück.

Die Methode ist überall gleich: ein scharfes Foto des ganzen Objekts vor schlichtem Hintergrund, danach die verdeckten Seiten prüfen. Alle Schritte erklärt [ein 3D-Modell aus Fotos erstellen](/de/ratgeber/3d-modell-aus-fotos-erstellen).

![Matte Steinzeugvase auf ihrem Katalogfoto, frontal vor weißem Hintergrund](/showcase/vase.jpg "Das einzelne Ausgangsfoto.")
![Helle Steinzeugvase als drehbares 3D-Modell, von easyrender aus diesem Foto erstellt](/showcase/vase.glb "Das von easyrender über eine kostenlose Ansichtenübersicht erstellte Modell, mit für diese Seite komprimierten Texturen: 16.708 Dreiecke. Drehe es und prüfe die Rückseite, die das Foto nicht gezeigt hat.")

easyrender gehört zu diesen Werkzeugen: Zuerst entsteht kostenlos eine Übersicht mit neun Ansichten, acht in 45-Grad-Schritten rundherum und eine von oben, dann daraus das Modell. Ein fertiges Modell kostet {{renderCredits}} Credits ({{renderPrice}}). [Lade ein Foto hoch](/de)

Es verarbeitet jeweils einen Gegenstand, etwa Möbel, Dekoration oder Gebäudeaußenansichten. Meshy und Tripo bieten ebenfalls Bild-zu-3D sowie Text-zu-3D mit eigenen Preisen. Mehr dazu in [Meshy-Alternative für Produktfotos](/compare/meshy) und [Tripo-Alternative für Produktfotos](/compare/tripo).

Vergleiche Werkzeuge mit demselben Foto und bewerte fünf Punkte nebeneinander:

1. Rückseite und Unterseite: nachvollziehbar oder offensichtlich erfunden?
2. Anzahl der Beine, Türen, Schubladen und Griffe.
3. Textur in voller Bildschirmgröße.
4. Dreieckszahl und Dateigröße im Vergleich zu den Vorgaben oben.
5. Preis pro fertigem Modell und Vorschau vor dem Bezahlen.

## Methode 5: Einen 3D-Profi beauftragen

Ein Profi modelliert anhand deiner Fotos und Maße. Das passt, wenn das Modell exakt sein muss, etwa für ein Sofa in drei Breiten. Auch für ein sorgfältig ausgearbeitetes Hauptprodukt einer Werbekampagne ist es die richtige Wahl.

Eine klare Auftragsbeschreibung spart Rückfragen. Sie enthält:

- Fotos aller Seiten und Nahaufnahmen jedes Materials und jeder Oberfläche.
- Mit dem Maßband ermittelte Abmessungen.
- Dateiformate: GLB und USDZ für Produktseiten.
- Vorgaben: 30.000 bis 50.000 Dreiecke, Texturen bis 2048 Pixel und möglichst wenige Materialien.
- Quelldatei wie .blend, damit spätere Änderungen möglich bleiben.

Auf Fiverr und Upwork findest du Fachleute für Produktmodelle. Bitte vor einem ganzen Katalog um ein Beispielmodell derselben Kategorie. Kosten, Zeit und die Entscheidung zwischen Auftrag und Foto erklärt [3D-Profi oder KI](/compare/3d-modeler-vs-ai).

## Was kostet ein 3D-Modell?

Kostenlose Software kostet Zeit. Ein Profi kalkuliert nach Komplexität pro Modell. Scan-Apps und KI-Werkzeuge berechnen Modelle einzeln oder im Abo, oft nach einer kostenlosen Stufe oder Vorschau.

Bei easyrender kosten Credits jeweils {{creditPrice}}, einzeln nach Bedarf ab {{paygMinCredits}} Credits. Pro kostet {{proPrice}} monatlich für {{proCredits}} Credits. Credits verfallen nicht.

## Wie prüfst du ein fertiges Modell?

Öffne es unabhängig von der Methode in einem Betrachter und schaue darunter und dahinter, wo sich Fehler verstecken. Nutze dann immer dieselbe kurze Liste:

1. Langsam in voller Bildschirmgröße drehen, bei Rückseite und Unterseite stoppen.
2. Bauteile mit dem echten Stück abgleichen und zählen.
3. Texturen vergrößern: Stoff kann im Vorschaubild gut und aus der Nähe unscharf aussehen.
4. Dreieckszahl und Dateigröße mit den Vorgaben oben vergleichen.
5. Am Handy über mobile Daten öffnen, AR auf einem iPhone und einem Android-Handy ausprobieren.

Für Produktseiten brauchst du meist GLB für Web und Android sowie USDZ für AR auf Apple-Geräten. Die [GLB-Datei](/de/ratgeber/glb-datei) behandelt Öffnen, Prüfen und Komprimieren, die [USDZ-Datei](/de/ratgeber/usdz-datei) Apples Format.

## Beispiel: eine Stehlampe, drei Wege

Nimm eine Stehlampe mit Leinenschirm und Messingstange. In Blender kann ein Anfänger Stange und Schirm an einem Nachmittag grob bauen. Bis Leinen wie Leinen aussieht, dauert es deutlich länger.

Fotogrammetrie hat Probleme mit poliertem Messing, das den Raum spiegelt und den Bildabgleich stört. Professionelle Scanner mattieren glänzende Stellen vorübergehend mit Spray. Bei Verkaufsware würdest du das eher nicht machen.

Aus einem klaren Katalogfoto lassen sich Gesamtform und Schirmfarbe mit Bild-zu-3D ableiten. Prüfe besonders die dünne Stange. Dünne Teile sind auf dem Foto schwer erkennbar und können im Modell gebogen oder dicker erscheinen.

Unsere Wahl für diese Lampe: Bild-zu-3D bei nur einem Lieferantenfoto, Fotogrammetrie mit abgedecktem Messing im eigenen Lager und ein Profi, wenn die ganze Kampagne auf dieser Lampe aufbaut.

## Was geht bei den einzelnen Methoden schief?

Jede Methode hat typische Fehler mit üblichen Ursachen. Vergleiche ein misslungenes Ergebnis mit dieser Liste.

| Methode        | Symptom                                     | Ursache                                  | Lösung                                                               |
| -------------- | ------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| Software       | Verdrehte oder falsch große Darstellung     | Skalierung und Drehung nicht angewendet  | Alle Transformationen anwenden und erneut exportieren                |
| Software       | Holzmaserung auf einer Fläche verzerrt      | Fehlerhafte UV-Abwicklung                | Mit Schachbretttextur prüfen, Fläche neu abwickeln                   |
| Fotogrammetrie | Löcher in weißer Tischplatte                | Keine Merkmale zum Bildabgleich          | Bei bedecktem Himmel aufnehmen oder andere Methode wählen            |
| Fotogrammetrie | Unterseite fehlt oder verschmilzt mit Boden | Unterseite nie fotografiert              | Akzeptieren oder zweite Serie mit seitlich liegendem Stück aufnehmen |
| LiDAR          | Dünne Beine ungleichmäßig oder fehlend      | Feiner als die Sensorauflösung           | Fotogrammetrie nutzen                                                |
| KI aus Foto    | Rückseite entspricht nicht dem Stück        | Das Foto zeigte diese Seite nicht        | Dreiviertelaufnahme oder Hinweis zur Rückseite verwenden             |
| KI aus Foto    | Logo oder Etikett unscharf                  | Feine Details in nur einem Foto          | Logo in Produktfotos zeigen statt im Modell                          |
| Profi          | Modell verspätet oder falsch                | Auftrag ohne Maße, Formate oder Vorgaben | Fotos, Maße, Formate und Dreieckszahl vorab angeben                  |

## Wo liegen die Grenzen der Methoden?

Ein einzelnes Foto liefert keine gemessenen Abmessungen. Scans erfassen nichts, was die Kamera nicht sieht, etwa die Unterseite eines flach aufliegenden Sofas. Selbstmodellieren braucht Lernzeit, ein Auftrag an einen Profi Zeit für Abstimmung und Bearbeitung.

Alle fünf Wege behandeln einzelne Objekte. Ein eingerichtetes Zimmer ist eine andere Aufgabe als ein einzelner Stuhl. Für Möbel und Dekoration vergleicht [3D-Modelle für Onlineshops](/de/ratgeber/3d-modelle-fuer-onlineshops) die Katalogwege; [Vintage-Möbel online verkaufen](/de/ratgeber/vintage-moebel-verkaufen) behandelt Einzelstücke.

## FAQ

### Musst du Blender lernen, um ein 3D-Modell zu erstellen?

Nein, Scan-Apps und Bild-zu-3D liefern Modelle ohne eigenes Modellieren. Du brauchst trotzdem einen prüfenden Blick: Rückseite, Texturen und dünne Teile entscheiden darüber, ob das Modell brauchbar ist. Blender lohnt sich, wenn du regelmäßig exakte, nachträglich bearbeitbare Modelle von Dingen brauchst, die noch nicht existieren oder sich oft im Entwurf ändern.

### Wie lange dauert es, ein 3D-Modell zu erstellen?

Die Methode macht mehr aus als das Objekt: Bild-zu-3D und Handy-Scans brauchen am wenigsten eigene Arbeitszeit, Fotogrammetrie ein bis zwei Stunden Aufnahme plus Verarbeitung. Einen Stuhl in Blender zu modellieren kann nach wochenlangem Lernen einen Tag dauern. Bei beauftragten Profis erfährst du den Liefertermin jeweils im Angebot für dein konkretes Stück.

### Kannst du aus einem Foto ein 3D-Modell erstellen?

Ja, mit Bild-zu-3D: Das Werkzeug beginnt mit einem Foto und leitet daraus auch die von der Kamera nicht gezeigten Seiten ab. Prüfe Rückseite und feine Details in der Vorschau, besonders dort, wo das Foto nichts zeigt. Am besten eignet sich eine scharfe Dreiviertelaufnahme eines einzelnen Gegenstands vor schlichtem Hintergrund.

### Ist das dasselbe wie ein Modell für 3D-Druck?

Nein, Bildschirm- und AR-Modelle müssen richtig aussehen, Druckmodelle brauchen exakte Maße und eine geschlossene, druckbare Form. Bild-zu-3D und die meisten Scans liefern die erste Art. easyrender exportiert beispielsweise GLB und USDZ für Web und AR, nicht STL; für ein gedrucktes Bauteil verwendest du CAD-Software und tatsächlich am Objekt gemessene Abmessungen.

### Wie viele Dreiecke sollte ein 3D-Modell haben?

Für Produktseiten oder Handy-AR sind 30.000 bis 50.000 sinnvoll, der von Googles Scene Viewer empfohlene Idealbereich; bleibe unter dessen empfohlener Obergrenze von 100.000. Unsere Beispielmodelle reichen von 14.590 Dreiecken bei einer Vase bis 69.910 beim Nachttisch mit Schubladen. Scans liefern meist dichtere Netze, die du vor der Nutzung vereinfachen solltest.
