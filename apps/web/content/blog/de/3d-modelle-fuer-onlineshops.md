---

group: 3d-models-for-ecommerce
title: "3D-Modell für deinen Onlineshop: Vier Wege im Vergleich"
description: "So bekommst du ein 3D-Modell für deinen Onlineshop: vier Methoden, die Formate GLB und USDZ und Tipps, wie du den Nutzen für deinen Shop prüfst."
date: 2026-11-13
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: 3d modell für onlineshop
cta: Wähle ein Möbelstück, bei dem die Tiefe wichtig ist, etwa einen Sessel oder ein Sideboard, und prüfe alle Ansichten, bevor du entscheidest, ob sich 3D lohnt.
---

Ein 3D-Modell für deinen Onlineshop ist meist eine GLB- oder USDZ-Datei, die Käufer am Bildschirm drehen und am Handy mit Augmented Reality (AR) im Raum ansehen können. Shops bekommen solche Modelle auf vier Wegen: von einem 3D-Profi, aus CAD-Dateien des Herstellers, durch einen Scan des Produkts oder mit KI aus einem einzelnen Foto.

![Illustration eines braunen Leder-Loafers neben seinem Karton, vorne echtes Leder und an der Ferse mattgrauer Ton mit weißem Drahtgitter, vor dunklem Hintergrund](/blog/illustrations/3d-models-for-ecommerce/hero.webp "Illustration, kein easyrender-Ergebnis: ein Loafer neben seinem Karton, halb aus Leder und halb als Tonmodell mit Drahtgitter gezeichnet.")

## Was bringt ein 3D-Modell auf einer Produktseite?

Ein Foto zeigt den von dir gewählten Blickwinkel. Mit einem 3D-Modell wählt der Käufer selbst, ob er die Rückseite eines Regals, die Unterseite eines Couchtischs oder die Dicke eines Sitzkissens genauer betrachten möchte.

![Grauer gepolsterter Drehsessel auf seinem Katalogfoto, von hinten aus Dreiviertelansicht](/showcase/swivel-chair.jpg "Das Katalogfoto: eine vom Fotografen gewählte Ansicht von hinten.")
![Derselbe graue Drehsessel als drehbares 3D-Modell, um Vorderseite und Sitz anzusehen](/showcase/swivel-chair.glb "Das von easyrender aus dem Foto erstellte Modell: Der Käufer wählt die Ansicht. Die Vorderseite ist abgeleitet, weil das Foto nur die Rückseite zeigt.")

Auf iPhone und iPad öffnest du eine USDZ in [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) und siehst das Objekt im Kamerabild deines Raums. Auf Android macht Googles [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) dasselbe mit einer GLB.

AR zeigt, wie ein Stück im Raum wirkt. Die Größe stammt aus der Datei, nicht aus einer Messung: Scene Viewer liest eine Dateieinheit als einen Meter. Ein Modell aus einem Foto erscheint in der Größe, die in seiner Datei hinterlegt ist; Maße gehören deshalb in deinen Produkttext.

## Wie misst du, ob sich 3D lohnt?

Lege vor dem Kauf eines Modells fest, was du mit 3D erreichen willst. Möbelshops haben meist drei Ziele: weniger Fragen zu Rückseite und Tiefe, mehr Produkte im Warenkorb und weniger Rücksendungen, weil das Stück anders aussieht als erwartet.

Wir veröffentlichen keine Conversion- oder Retourenzahlen zu 3D, weil uns dazu keine belastbaren eigenen Messungen vorliegen. Behandle jede gelesene Zahl als Behauptung, die du im eigenen Katalog überprüfen musst, etwa mit dieser Methode.

Wähle fünf bis zehn Produkte mit Modell und eine vergleichbare Gruppe ohne. Lass Preise, Fotos und Texte beider Gruppen vier bis sechs Wochen unverändert. Vergleiche danach, wie oft ein Produkt pro Seitenaufruf im Warenkorb landet, und lies die Rücksendegründe.

Auf deiner eigenen Website liefert [model-viewer](https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/features/ar.ts) Ereignisse für deine Analyse. `camera-change` mit Quelle `user-interaction` bedeutet, dass jemand das Modell gedreht hat. `ar-status` meldet den Start oder Fehler einer AR-Sitzung, `quick-look-button-tapped` die Übergabe vom iPhone an Quick Look.

## Welche 3D-Dateien braucht ein Shop?

GLB für Web und Android, USDZ für AR auf Apple-Geräten. Die meisten 3D-fähigen Plattformen nehmen eines oder beide Formate an.

![Ein Produktmodell als zwei Dateien: GLB für Produktseite im Browser und Android-AR mit Scene Viewer, USDZ für AR Quick Look auf iPhone und iPad](diagram:store-files "Ein Modell, zwei Dateien, drei Einsatzorte für Käufer. Eine selbst gebaute Website kann beide über model-viewer bereitstellen.")

### 3D-Modelle auf Shopify

[Shopify akzeptiert 3D-Modelle als Produktmedien](https://help.shopify.com/en/manual/products/product-media/product-media-types) in GLB oder USDZ bis 500 MB, dort, wo du auch Fotos hochlädst. Über 15 MB optimiert Shopify Geometrie und Texturen beim Upload. Es wandelt jedes Modell um, sodass GLB und USDZ vorliegen.

### WooCommerce und eigene Websites

WooCommerce-Shops ergänzen 3D über Erweiterungen wie [Arty 3D Viewer](https://woocommerce.com/products/arty-3d-viewer/) aus dem WooCommerce-Marktplatz. Auf einer eigenen Website zeigt die quelloffene Komponente [model-viewer](https://modelviewer.dev/) von Google eine GLB an. Mit `ar-modes="webxr scene-viewer quick-look"` öffnet sich auf jedem Handy der passende AR-Betrachter.

### Welche Dateivorgaben sollte ein Produktmodell erfüllen?

Shopify akzeptiert große Dateien, doch auf dem Handy laden kleine Dateien schneller. Scene Viewer veröffentlicht die klarsten uns bekannten Vorgaben. Daran messen wir auch unsere Dateien.

| Vorgabe     | Scene Viewer empfiehlt                               | Die sechs Modelle unserer Beispielgalerie |
| ----------- | ---------------------------------------------------- | ----------------------------------------- |
| Dreiecke    | Bis 100.000, ideal 30.000 bis 50.000                 | 14.590 bis 69.910                         |
| Textur      | Höchstens 2048 x 2048                                | Je eine Textur mit 1024 x 1024            |
| Materialien | Bis 10                                               | Je eines                                  |
| Dateigröße  | 10 MB; größere Modelle können die Nutzung erschweren | 308.448 bis 1.287.432 Bytes               |

Scene Viewer listet auch unterstützte glTF-Erweiterungen. Eine Datei mit anderen Erweiterungen wie WebP-Texturen öffnet sich möglicherweise nicht. Nutze für Android-AR deshalb am besten PNG oder JPEG und öffne die GLB auf einem echten Android-Handy, bevor du sie von einer Produktseite verlinkst.

## Wege zum 3D-Produktmodell

Es gibt vier Wege. Wir beurteilen sie danach, ob du das Produkt vor Ort brauchst, wie viel eigene Arbeitszeit nötig ist, wie genau verdeckte Seiten sind und wo die Methode scheitert.

### Einen 3D-Profi beauftragen

Ein Profi erstellt das Modell aus Fotos, Zeichnungen und Maßen. Das Objekt muss nicht vor Ort sein; Abstimmung und Wartezeit sind am längsten. Dafür ist das Ergebnis am genauesten, weil die Angaben nicht geraten werden müssen; Angebote auf Fiverr oder Upwork hängen von der Komplexität ab.

Unsere Empfehlung: wenn das Modell exakt sein muss, etwa für ein Sofa in drei Breiten oder als Hauptprodukt einer Kampagne.

### CAD-Dateien des Herstellers nutzen

Verkaufst du eigene Entwürfe, besitzt die Fabrik vielleicht schon CAD- oder SketchUp-Dateien. Die Form stimmt, doch für den Einsatz im Web musst du sie meist noch bearbeiten. Meist fehlen realistische Texturen und die Dreieckszahl muss sinken, damit sie am Handy schnell laden.

Unsere Empfehlung: Bei eigenen Entwürfen zuerst danach fragen. Plane Zeit für die Aufbereitung ein, denn eine Datei aus der Fertigung kann weit mehr Details als Scene Viewers 100.000 Dreiecke enthalten.

### Das Produkt scannen

Fotogrammetrie-Apps wie Polycam und [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) bauen Modelle aus vielen überlappenden Fotos. RealityScan beginnt nach 20 Bildern und nimmt bis zu 300 an. Du brauchst das Stück vor Ort und Platz zum Umrunden.

Unsere Empfehlung: für Stücke mit gut erkennbarer Oberflächenstruktur im eigenen Lager, etwa einen Rattanstuhl oder ein Eichen-Sideboard. Glas, Spiegel und poliertes Metall funktionieren schlecht.

### Aus einem Foto mit KI erzeugen

KI-Tools wie Meshy, Tripo und easyrender erstellen 3D-Modelle aus einem Foto. Ohne Zugang zum Produkt ist das der einzige Weg, mit einem Lieferantenfoto zu arbeiten. Weil das Bild nur eine Seite zeigt, prüfst du die Rückseite in der Vorschau, bevor du das Modell behältst.

![Neun Ansichten einer matten Steinzeugvase, aus einem Produktfoto erzeugt](/showcase/vase-angles.jpg "Ein unbearbeitetes Ansichtenraster, das easyrender aus einem Foto einer Steinzeugvase erzeugt hat. Runde Gegenstände mit matter Oberfläche eignen sich dafür besonders gut.")

Unsere Empfehlung: für einen Katalog aus Lieferantenfotos. Kleine Logos, offenes Geflecht und nicht fotografierte Seiten lassen sich aus einem einzelnen Bild schwerer ablesen. Alle Wege mit Voraussetzungen und Fehlerquellen erklärt [ein 3D-Modell erstellen](/de/ratgeber/3d-modell-erstellen).

Wann sich ein Auftrag lohnt und wann ein Foto genügt, erklärt [3D-Profi oder KI](/compare/3d-modeler-vs-ai). Einzelne Tools vergleichen die Artikel zu [Meshy](/compare/meshy) und [Tripo](/compare/tripo).

## 3D-Modelle für Möbelshops: Wo fängst du an?

Bewerte deine Produkte vor dem ersten Modell nach vier Fragen: Sind Rückseite oder Tiefe wichtig, zögern Käufer wegen des Preises, fragen sie nach weiteren Ansichten und wird bei Rücksendungen das Aussehen als Grund genannt?

Starte mit den fünf am höchsten bewerteten Stücken. Meist sind das Sessel, Sideboards oder Stehlampen mit geformtem Schirm. Flache Artikel wie gerahmte Drucke oder Teppiche gewinnen durch 3D wenig.

Teste danach die Wege, bevor du dich festlegst. Erstelle zwei Modelle desselben Produkts, etwa einer Tischlampe: eines per Handyscan und eines mit KI aus einem Foto; vergleiche beide am Handy. Das sagt mehr aus als eine Funktionsliste.

Bei großen Katalogen zählen Stapelverarbeitung und Preis pro Modell. Bei easyrender legst du mehrere Katalogfotos in einer Bibliothek ab, prüfst jeweils die kostenlose Vorschau und erstellst nur Modelle, deren Form dich überzeugt.

## Wie ergänzt du 3D im Shop Schritt für Schritt?

So würden wir bei einer ersten Serie vorgehen:

1. Fünf Produkte mit den vier Fragen oben auswählen.
2. Jedes Modell mit der passenden Methode erstellen.
3. Beine und Türen zählen, Rückseite prüfen, Textur in voller Bildschirmgröße betrachten.
4. Dateien an die Vorgaben anpassen: Texturen höchstens 2048 Pixel, Geometrie komprimieren, sofern der Betrachter das unterstützt.
5. Mit den Plattformwerkzeugen hochladen, etwa Shopifys Produktmedien.
6. Jede Seite auf einem iPhone und einem Android-Handy über mobile Daten öffnen und auf beiden AR ausprobieren.
7. Vier bis sechs Wochen wie oben messen, danach über die nächste Serie entscheiden.

## Beispiel: ein Sideboard aus Nussbaum

Ein Shop hat drei Lieferantenfotos eines Nussbaum-Sideboards: vorne, Dreiviertelansicht und eine Nahaufnahme der Messinggriffe. Für ein 3D-Modell aus einem Foto eignet sich die Dreiviertelansicht. Sie zeigt Tiefe und eine Seitenwand.

![Drei gezeichnete Lieferantenfotos eines Sideboards: Front ohne Tiefe, empfohlene Dreiviertelansicht mit Seitenwand und Nahaufnahme eines Stangengriffs](diagram:sideboard-photo-pick "Nur die Dreiviertelaufnahme zeigt die Seitenwand und liefert damit mehr Informationen zur Tiefe. Zeichnung für dieses Beispiel, keine echte Anzeige.")

Türen, Beine und Maserung sollten gut erkennbar sein. Vergleiche die Messinggriffe mit der Nahaufnahme, weil feine Details kleiner Beschläge auf den Fotos oft schwer erkennbar sind. Prüfe auch die Rückseite genau, die auf dem Foto fehlt.

Lade die GLB mit deinen Plattformwerkzeugen hoch und öffne die Seite vor der Veröffentlichung auf einem iPhone und einem Android-Handy. Shopify erstellt die USDZ fürs iPhone aus demselben Upload.

## Was geht schief, wenn ein Shop 3D ergänzt?

Viele Probleme fallen erst am echten Handy auf, deshalb gibt es Schritt 6. Achte auf diese Fehler und die passende Lösung.

| Symptom                                  | Ursache                                                              | Lösung                                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kein AR-Button auf Android               | Scene Viewer lädt nur über HTTPS oder das Handy unterstützt es nicht | GLB über HTTPS bereitstellen und auf zweitem Handy testen                                                                                                         |
| Kein AR auf iPhone bei eigener Website   | USDZ fehlt oder falscher Inhaltstyp                                  | USDZ ergänzen und als `model/vnd.usdz+zip` ausliefern, wie [Safari es erwartet](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) |
| Stück erscheint riesig oder winzig in AR | AR nutzt gespeicherte, nie gemessene Abmessungen                     | Maße in den Text schreiben; Käufer können das Modell mit zwei Fingern vergrößern oder verkleinern                                                                 |
| Stück schwebt über dem Boden             | Modellbasis liegt über dem Ursprung                                  | Ursprung vor dem Export in Blender an die Basis verschieben                                                                                                       |
| Seite lädt langsam über mobile Daten     | Texturen mit 4096 Pixeln oder unkomprimierte Geometrie               | Texturen auf 2048 oder 1024 reduzieren, Draco oder Meshopt nur bei Unterstützung                                                                                  |
| Modell wirkt in AR dunkel oder schmutzig | Schatten in der Textur, wovon Scene Viewer abrät                     | Textur ohne eingerechnete Schatten nutzen, fehlenden Metallic-Wert auf 0 setzen                                                                                   |
| GLB öffnet sich nicht in Scene Viewer    | Nicht gelistete glTF-Erweiterung wie WebP-Texturen                   | Einfache Variante mit PNG oder JPEG exportieren                                                                                                                   |

## Wo liegen die Grenzen von 3D im Onlinehandel?

Ein Foto liefert Form und Materialien, keine Messwerte. Schreibe Abmessungen in den Produkttext. Nutze AR für den optischen Eindruck und die Maßangaben für die Raumplanung.

Durchsichtige oder spiegelnde Produkte wie Glasvasen und Chromlampen sind für alle Methoden schwierig. Kleine Schrift und Logos sind auf einem einzelnen Foto oft nicht deutlich genug erkennbar.

3D ersetzt keine Fotos. Suchergebnisse, Anzeigen und Kategorieraster brauchen weiterhin Standbilder. Die Grundlagen der [Produktfotografie](/de/ratgeber/produktfotografie-onlineshop) gelten also unverändert.

## FAQ

### Braucht dein Onlineshop 3D-Modelle?

Nicht für jedes Produkt: 3D hilft vor allem, Tiefe und Rückseite zu beurteilen, etwa bei Stühlen, Sofas, Sideboards und Lampen. Für flache oder einfache Artikel reichen gute Fotos. Beginne mit wenigen Produkten, zu denen Käufer nach weiteren Ansichten fragen, und bewerte das Ergebnis, bevor du den ganzen Katalog auf einmal umstellst.

### Welches 3D-Dateiformat braucht ein Onlineshop?

Meist zwei: GLB für Web und Android-AR sowie USDZ für AR Quick Look auf iPhone und iPad. Shopify akzeptiert beide und erzeugt jeweils die andere Variante. Liefert dein Tool nur eines der Formate, kannst du das andere mit Apples Reality Converter auf einem Mac oder mit Blender selbst erstellen und danach prüfen.

### Wie groß sollte die Datei eines 3D-Produktmodells sein?

Klein genug für ein Handy über mobile Daten. Googles Scene Viewer empfiehlt höchstens 10 MB, 100.000 Dreiecke und 2048-Pixel-Texturen, ideal sind 30.000 bis 50.000 Dreiecke. Shopify nimmt Dateien bis 500 MB und optimiert über 15 MB; eine kleinere Datei lädt für deine Käufer trotzdem schneller und braucht weniger Daten unterwegs.

### Was kostet ein 3D-Modell für den Onlinehandel?

Das hängt von der Methode ab: Profis kalkulieren nach Komplexität, Scan-Apps meist im Abo, KI-Tools pro Modell oder monatlich. Bei easyrender ist die Vorschau kostenlos, ein fertiges Modell kostet {{renderCredits}} Credits ({{renderPrice}}); Credits kaufst du nach Bedarf oder erhältst {{proCredits}} monatlich mit Pro für {{proPrice}}. Entscheide nach Vorschau und Einsatzzweck.

### Welche Größe zeigt ein 3D-Produkt in AR?

Neuere Handys zeigen das Modell in AR: iPhone und iPad mit USDZ in AR Quick Look, Android mit GLB in Scene Viewer. Die dargestellte Größe stammt aus der Datei und entspricht nur bei korrekt eingetragenen Messwerten dem Produkt. Ein Foto liefert diese Messwerte nicht; deshalb gehören die Abmessungen immer in deinen Produkttext.
