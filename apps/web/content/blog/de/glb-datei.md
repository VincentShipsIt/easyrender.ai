---

group: glb-file
title: "GLB-Datei: öffnen, prüfen und verwenden"
description: "Eine GLB-Datei enthält ein 3D-Modell im binären glTF-2.0-Format. So öffnest, prüfst und verkleinerst du sie für Web und Android-AR."
date: 2026-11-15
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: glb datei
cta: Mit einem scharfen Foto einer Lampe oder eines Stuhls kannst du alle Seiten prüfen, bevor eine GLB entsteht.
---

Eine GLB-Datei speichert ein 3D-Modell in der binären Variante von glTF 2.0, einem offenen Format der Khronos Group. Eine einzige .glb enthält Form, Materialien, Texturen und mögliche Animationen, sodass sie im Web ohne Zusatzdateien lädt. Sie ist das übliche Format für 3D auf Produktseiten und AR unter Android.

![Illustration einer seladongrünen Teekanne, links glasiert und rechts aus mattgrauem Ton mit weißem Drahtgitter und abgelösten UV-Flächen, vor dunklem Hintergrund](/blog/illustrations/glb-file/hero.webp "Illustration, kein easyrender-Ergebnis: eine Teekanne, halb glasiert und halb als Drahtgitter mit abgelösten UV-Flächen gezeichnet.")

## Was steckt in einer GLB-Datei?

Ein glTF-Modell kann aus einer .gltf-Textdatei, separaten Texturbildern und einer .bin-Datei für die Geometrie bestehen. Eine GLB packt alles in eine Binärdatei, die sich leichter hochladen, per E-Mail versenden und bereitstellen lässt. Die [glTF-2.0-Spezifikation](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) definiert beide Varianten.

Der Aufbau ist übersichtlich: Ein 12-Byte-Dateikopf enthält das Wort glTF, die Versionsnummer 2 und die gesamte Dateilänge. Danach folgen zwei Blöcke: ein JSON-Block mit der Szenenbeschreibung und ein Binärblock mit Geometrie und Bildern.

Diese drei Kopfwerte prüfen wir bei jedem ausgelieferten Modell. Beginnt eine Datei nicht mit glTF, hat sie nicht Version 2 oder stimmt ihre angegebene Länge nicht mit der tatsächlichen überein, lehnen wir sie vor dem Download als beschädigt ab. Dasselbe gilt für Dateien unter 20.000 Bytes.

![Die GLB der Tonvase nach Byte-Anteilen: 1,4 KB JSON, 85 KB Dreiecksindizes, 164 KB Positionen und Texturkoordinaten sowie 50 KB WebP-Textur; darunter dasselbe Modell als getrennte glTF-Dateien](diagram:glb-anatomy "Aus der GLB der Tonvase weiter unten ausgelesen: insgesamt 301 KB. Bei einer WebP-Textur mit 1024 Pixeln entfällt der größte Teil auf Geometrie.")

Die Zahlen im Diagramm gehen genau auf. Die Vase hat 14.590 Dreiecke mit je drei Eckindizes zu jeweils 2 Bytes: 87.540 Bytes für Indizes. Ihre 8.406 Eckpunkte speichern jeweils Position und Texturkoordinate in 20 Bytes, insgesamt 168.120 Bytes.

## Wie groß sind echte GLB-Dateien, und wohin gehen die Bytes?

Wir haben alle Modelle unserer Beispielgalerie auf dieselbe Weise ausgelesen. Alle sechs bestehen aus einem Oberflächennetz, einem Material und einer WebP-Textur mit 1024 Pixeln, für das Web mit glTF Transform verpackt.

| Modell            | Dateigröße (Bytes) | Dreiecke | Textur (Bytes) | Geometrieanteil |
| ----------------- | ------------------ | -------- | -------------- | --------------- |
| Tonvase           | 308.448            | 14.590   | 51.354         | 83%             |
| Steinzeugvase     | 312.816            | 16.708   | 28.466         | 90%             |
| Runder Couchtisch | 322.876            | 16.228   | 34.266         | 89%             |
| Drehsessel        | 519.988            | 24.268   | 57.680         | 89%             |
| Bouclé-Sessel     | 551.068            | 25.879   | 70.690         | 87%             |
| Nachttisch        | 1.287.432          | 69.910   | 40.628         | 97%             |

Texturen gelten oft als größter Bestandteil einer GLB, und bei PNGs mit 4096 Pixeln stimmt das. Mit einer WebP-Textur von 1024 Pixeln wie hier macht die unkomprimierte Geometrie dagegen 83% bis 97% jeder Datei aus. Dann bestimmt die Dreieckszahl die Größe.

## Was beschreiben die Materialien einer GLB?

Die Materialien folgen dem PBR-Modell Metallic-Roughness. PBR steht für physikalisch basierte Darstellung und beschreibt eine Oberfläche über Grundfarbe, Metallanteil und Rauheit. Deshalb sieht dieselbe GLB in Betrachtern, die den Standard einhalten, weitgehend gleich aus.

![Die einzelne Textur aus der Tonvasen-GLB: flach ausgelegte Oberflächenstücke mit hellen Tonringen, Rand und Boden](/blog/figures/glb-file/clay-vase-texture.webp "Die unverändert aus der GLB kopierte Grundfarbtextur, 1024 mal 1024 Pixel. Texturkoordinaten ordnen jedes Bildstück der passenden Stelle auf der Vase zu.")

Fehlende Materialwerte bekommen den Standardwert aus der Spezifikation. Ein häufiger Stolperstein: Ein nicht gesetzter Metallic-Wert bedeutet 1, also vollständig metallisch; ein Material nur mit Grundfarbe wird daher als raues Metall dargestellt. Ton, Holz und Stoff können so dunkler oder verfärbt wirken.

Prüfe in Blender eine Einstellung: Metallic am Material auf 0 setzen und erneut exportieren. Das würden wir vor dem Einsatz auf einer Produktseite bei jeder GLB prüfen, unabhängig davon, wer sie erstellt hat.

## Warum kann eine GLB kantig aussehen?

Vertex-Normalen geben für jeden Eckpunkt die Richtung an, mit der ein Betrachter eine gekrümmte Oberfläche weich schattiert. Sie sind in glTF optional. Eine Datei darf also nur Positionen und Texturkoordinaten enthalten.

Für diesen Fall schreibt die Spezifikation flache Normalen vor. Bei einem dichten Netz sind die einzelnen Flächen klein. Unter flachem Seitenlicht können auf einer Rundung trotzdem feine Facetten sichtbar werden.

Normalen kosten 12 Bytes pro Eckpunkt, drei Zahlen zu je 4 Bytes; bei 8.000 Eckpunkten sind das etwa 96.000 Bytes. Shade Smooth und ein Export mit aktiviertem Normals schreiben in Blender weiche Normalen. `gltf-transform inspect` zeigt, ob das Attribut NORMAL vorhanden ist.

## Wie öffnest du eine GLB-Datei?

Du brauchst einen Betrachter, keinen Konverter. Diese Möglichkeiten öffnen GLB ohne zusätzliche Einrichtung:

- Im Browser: Ziehe die Datei in die [Babylon.js Sandbox](https://sandbox.babylonjs.com/) oder den [model-viewer editor](https://modelviewer.dev/editor/).
- In Blender: [File, Import, glTF 2.0](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) (.glb/.gltf).
- Im Code: three.js und Babylon.js laden GLB direkt, Unity über das [glTFast-Paket](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html).
- Unter Android: Googles [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) öffnet eine auf einer Webseite verlinkte GLB in 3D oder AR.

iPhone und iPad öffnen GLB nicht in AR Quick Look. Apples AR verwendet USDZ. Shops, die beide Systeme bedienen wollen, behalten deshalb beide Dateien.

![Eine gealterte Tonvase als GLB, in Googles model-viewer geöffnet und drehbar](/showcase/clay-vase.glb "Eine echte easyrender-GLB einer gealterten Tonvase im oben verlinkten model-viewer. Die Datei hat 301 KB: ein Netz mit 14.590 Dreiecken und eine WebP-Textur mit 1024 Pixeln, mit glTF Transform verpackt.")

Drehe das geöffnete Modell langsam. Schaue darunter, dahinter und nah an feine Details wie Griffe und Nähte heran.

Ohne Betrachter zeigt `gltf-transform inspect` aus [glTF Transform](https://gltf-transform.dev/cli) den Inhalt. Der Befehl listet Netze, Texturen und Erweiterungen samt Eckpunktzahlen und Größen auf. So kannst du die Datei mit der Tabelle oben vergleichen.

## Wofür wird eine GLB-Datei verwendet?

Shopify nimmt GLB als Produktmedium an. Auf einer selbst gebauten Website zeigt Googles quelloffenes [model-viewer](https://modelviewer.dev/) eine GLB mit einem kurzen Codeabschnitt an. Drehen und Zoomen sind bereits enthalten.

Außerhalb des Onlinehandels ist GLB in Web-3D, Spielen und AR-Anwendungen verbreitet, weil es kompakt, offen und mit den meisten 3D-Programmen lesbar ist. Blender exportiert es ebenso wie die meisten Scan- und KI-Werkzeuge.

Für Android-AR muss die Datei in Scene Viewers Vorgaben bleiben: empfohlen sind höchstens 10 MB, 100.000 Dreiecke und Texturen mit 2048 Pixeln. Jede Datei in der Tabelle oben erfüllt diese Werte.

## Wie verkleinerst du eine GLB-Datei?

Wir haben die Befehle mit glTF Transform 4.5 an einer Kopie des Nachttischs ausprobiert, dem Modell mit den meisten Dreiecken in der Tabelle. Die Dreieckszahl bleibt gleich, solange du das Netz nicht vereinfachst.

| Variante des Nachttischs                                                       | Größe (Bytes) | Dreiecke |
| ------------------------------------------------------------------------------ | ------------- | -------- |
| Wie auf dieser Website                                                         | 1.287.432     | 69.910   |
| Geometrie mit Meshopt komprimiert (`gltf-transform meshopt`)                   | 422.480       | 69.910   |
| Geometrie mit Draco komprimiert (`gltf-transform draco`)                       | 235.776       | 69.910   |
| Auf die halbe Dreieckszahl vereinfacht (`gltf-transform simplify --ratio 0.5`) | 710.072       | 34.954   |

Draco lieferte die kleinste Datei, 82% kleiner. Meshopt sparte 67%; bei der Tonvase reduzierte es 308.448 auf 135.740 Bytes. Reines Vereinfachen sparte weniger als beide Verfahren, weil die übrigen Dreiecke unkomprimiert blieben.

Komprimierung setzt Unterstützung im Betrachter voraus. model-viewer und three.js dekodieren beide Kompressionsverfahren, Scene Viewers Dokumentation listet dagegen keine der beiden Erweiterungen. Prüfe eine komprimierte Datei vor der Veröffentlichung in jedem vorgesehenen Betrachter.

Unsere Empfehlung nach Einsatzort:

- Eigene Website mit model-viewer: Meshopt oder Draco für die Geometrie und WebP-Texturen, danach Kanten auf Rundungen prüfen.
- Android-AR mit Scene Viewer: eine einfache GLB mit JPEG- oder PNG-Texturen bis 2048 Pixel, erst über 100.000 Dreiecken vereinfachen.
- Shopify: die unkomprimierte Datei hochladen, weil Shopify Dateien über 15 MB selbst optimiert.

## Wie bekommst du eine GLB aus Blender, einem Scan oder Foto?

Wähle in Blender File, Export, glTF 2.0 und als Format glTF Binary (.glb), damit die Texturen in der Datei bleiben. Aktiviere unter Mesh Normals und UVs und wähle JPEG, sofern das Modell keine Transparenz braucht. Scan- und KI-Werkzeuge bieten GLB meist zum Herunterladen an.

Die Wege zum Modell, vom manuellen Modellieren bis zum einzelnen Foto, vergleicht [ein 3D-Modell erstellen](/de/ratgeber/3d-modell-erstellen). Für dein Sortiment erklärt [3D-Modelle für Onlineshops](/de/ratgeber/3d-modelle-fuer-onlineshops), welcher Weg zu welchem Produkt passt.

easyrender liefert beispielsweise GLB und USDZ zu jedem fertigen Modell aus einem Foto, nach den Schritten in [ein 3D-Modell aus Fotos erstellen](/de/ratgeber/3d-modell-aus-fotos-erstellen). Das Modell gibt Form und Materialien wieder, keine gemessenen Abmessungen.

## GLB zu USDZ: Brauchst du beide?

Für AR auf iPhone und iPad ja. Apples kostenlose Mac-App Reality Converter wandelt GLB in USDZ um, neuere Blender-Versionen exportieren USDZ direkt. Der Ratgeber zur [USDZ-Datei](/de/ratgeber/usdz-datei) erklärt Apples Format und warum die USDZ größer ausfallen kann als ihre GLB.

| Datei | Inhalt                                                  | Öffnet sich in                                          | Geeignet für                             |
| ----- | ------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| GLB   | Eine Binärdatei mit Geometrie, Materialien und Texturen | Browsern, Blender, Android Scene Viewer                 | Produktseiten, Web-3D, Android-AR        |
| glTF  | JSON-Datei .gltf, .bin-Datei und getrennte Texturbilder | Denselben Betrachtern, wenn die Dateien zusammenbleiben | Bearbeiten und Prüfen dank lesbarem JSON |
| USDZ  | Unkomprimiertes ZIP aus USD-Ebenen und Bildern          | Quick Look auf iPhone, iPad und Mac                     | AR auf Apple-Geräten                     |

## Was geht bei einer GLB schief, und wie behebst du es?

Die meisten GLB-Probleme haben wenige typische Ursachen. Diese Liste führt vom sichtbaren Fehler zur nötigen Änderung.

| Symptom                                            | Ursache                                                          | Lösung                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| Das Modell ist grau                                | .gltf ohne Texturdateien oder Export mit ausgeschalteten Bildern | Erneut als binäre .glb exportieren, damit Texturen enthalten sind |
| Die Datei hat mehrere Dutzend Megabyte             | Texturen mit 4096 Pixeln oder sehr viele Texturen                | Auf 2048 oder 1024 verkleinern und Geometrie komprimieren         |
| Rundungen wirken kantig                            | Fehlende Vertex-Normalen führen zu flacher Schattierung          | Shade Smooth in Blender und Export mit Normalen                   |
| Ton oder Stoff wirkt dunkel oder verfärbt          | Metallic fehlt, der Standard ist vollständig metallisch          | Metallic auf 0 setzen und erneut exportieren                      |
| Schwarze Stellen oder von innen sichtbare Teile    | Flächen zeigen in die falsche Richtung                           | Normalen in Blender nach außen neu berechnen                      |
| Ein Betrachter öffnet die Datei, ein anderer nicht | Nicht unterstützte glTF-Erweiterung wie Draco oder WebP-Texturen | Eine einfache Variante für diesen Betrachter exportieren          |
| Ein Upload meldet eine ungültige Datei             | Abgebrochener Download, angegebene Länge stimmt nicht            | Erneut herunterladen und Dateigröße vergleichen                   |

## Was verrät dir eine GLB-Datei nicht?

glTF verwendet Meter, aber korrekte Abmessungen entstehen nur, wenn sie beim Erstellen richtig gesetzt wurden. Ein aus einem Foto erzeugtes Modell hat keine gemessenen Abmessungen. Schreibe Maße deshalb in den Produkttext.

GLB sagt außerdem nichts über die Qualität des Modells. Eine Datei kann den [glTF Validator](https://github.khronos.org/glTF-Validator/) bestehen und trotzdem ein verformtes Stuhlbein oder eine unscharfe Textur enthalten. Das erkennst du nur im Betrachter.

## FAQ

### Sind GLB und glTF dasselbe?

Es ist dasselbe Format in zwei Verpackungen: glTF kann eine .gltf-Textdatei mit getrennten Textur- und Geometriedateien sein, GLB verpackt alles binär in einer Datei. Beide folgen dem glTF-2.0-Standard der Khronos Group. Die meisten Werkzeuge, die eine Variante lesen, öffnen auch die andere, solange bei glTF alle zugehörigen Dateien zusammenbleiben.

### Kannst du eine GLB-Datei auf dem iPhone öffnen?

Nicht direkt in AR Quick Look, das USDZ verwendet. Im iPhone-Browser kannst du eine GLB mit einem Web-Betrachter wie der Babylon.js Sandbox ansehen. Für AR auf Apple-Geräten wandelst du die GLB mit Apples Reality Converter auf einem Mac in USDZ um oder lässt dir beide Dateien von deinem Werkzeug geben.

### Wie wandelst du eine GLB in ein anderes Format um?

Öffne sie in Blender, das GLB importiert und unter anderem FBX, OBJ, USD und USDZ exportiert. Dabei können Informationen verloren gehen: OBJ kennt beispielsweise keine Metallic-Roughness-Materialien, sodass ein Messinggriff danach flach wirken kann. Prüfe die umgewandelte Datei deshalb in einem Betrachter, bevor du sie an einer für Kunden sichtbaren Stelle verwendest.

### Warum ist deine GLB-Datei so groß?

Meist wegen großer Texturen oder unkomprimierter Geometrie, sobald die Texturen klein sind. In unseren Tests verkleinerte Draco ein Modell mit 69.910 Dreiecken von 1.287.432 auf 235.776 Bytes. Reduziere Texturen auf 2048 oder 1024 Pixel und komprimiere die Geometrie mit glTF Transform; prüfe danach die Oberflächen in einem Betrachter.

### Warum ist deine GLB grau oder ohne Textur?

Meist wurden die Texturen nicht exportiert: Eine .gltf ohne ihre Texturdateien oder ein reiner Geometrieexport liefert eine graue Form. Exportiere erneut als binäre .glb, damit die Bilder enthalten sind. Sieht das Modell in der Babylon.js Sandbox richtig aus, aber in einer einzelnen App nicht, liegt es an dieser App.
