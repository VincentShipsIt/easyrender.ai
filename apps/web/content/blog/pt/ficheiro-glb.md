---

group: glb-file
title: "Ficheiro GLB: o que é, como abrir e como usar"
description: "Um ficheiro GLB guarda um modelo 3D em glTF 2.0 binário: vê o conteúdo, abre-o, verifica materiais e reduz o tamanho para web e Android."
date: 2026-11-15
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: ficheiro glb
cta: Com uma fotografia nítida de um candeeiro ou de uma cadeira, podes verificar todos os ângulos antes de criar o GLB.
---

Um ficheiro GLB é um modelo 3D guardado na versão binária do glTF 2.0, um formato aberto do Khronos Group. Reúne forma, materiais, texturas e eventuais animações num só ficheiro, sem recursos adicionais para carregar. É o formato habitual para modelos em páginas de produto e para realidade aumentada no Android.

![Ilustração de um bule celadon, metade vidrada e metade em argila cinzenta com malha branca e painéis UV a separar-se do corpo, sobre fundo escuro](/blog/illustrations/glb-file/hero.webp "Ilustração, não um resultado do easyrender: um bule metade vidrado e metade em malha, com os painéis UV abertos.")

## O que contém um ficheiro GLB?

Um modelo glTF pode chegar como texto .gltf, imagens de textura separadas e um .bin para geometria. GLB reúne tudo num binário, mais fácil de carregar, enviar e alojar; a [especificação glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) define as duas formas.

O cabeçalho de 12 bytes contém a palavra glTF, a versão 2 e o comprimento total. Seguem-se um bloco JSON que descreve a cena e um bloco binário com geometria e imagens.

Verificamos estes três campos em cada modelo entregue. Rejeitamos antes da descarga ficheiros sem glTF no início, fora da versão 2, com comprimento declarado diferente do efetivo ou com menos de 20.000 bytes.

![GLB do vaso de barro dividido pelos bytes: JSON de 1,4 KB, índices de 85 KB, posições e coordenadas de textura de 164 KB e WebP de 50 KB, com glTF separado por baixo](diagram:glb-anatomy "Conteúdo lido do GLB do vaso mostrado abaixo: 301 KB no total. Com uma textura WebP de 1024 píxeis, a geometria ocupa a maioria dos bytes.")

As contas são verificáveis: o vaso tem 14.590 triângulos, cada um com três índices de 2 bytes, num total de 87.540 bytes. Os 8.406 vértices guardam posição e coordenadas de textura em 20 bytes cada, somando 168.120 bytes.

## Quanto ocupam os GLB e para onde vão os bytes?

Lemos os seis modelos da nossa galeria da mesma forma. Cada um tem uma malha, um material e uma textura WebP de 1024 píxeis, preparados para a web com glTF Transform.

| Modelo                 | Tamanho (bytes) | Triângulos | Textura (bytes) | Parte de geometria |
| ---------------------- | --------------- | ---------- | --------------- | ------------------ |
| Vaso de barro          | 308.448         | 14.590     | 51.354          | 83%                |
| Vaso de grés           | 312.816         | 16.708     | 28.466          | 90%                |
| Mesa de centro redonda | 322.876         | 16.228     | 34.266          | 89%                |
| Poltrona giratória     | 519.988         | 24.268     | 57.680          | 89%                |
| Poltrona em bouclé     | 551.068         | 25.879     | 70.690          | 87%                |
| Mesa de cabeceira      | 1.287.432       | 69.910     | 40.628          | 97%                |

É comum dizer que as texturas ocupam mais espaço, e isso vale para PNG de 4096 píxeis. Com WebP de 1024, como aqui, a geometria sem compressão ocupa 83% a 97% do ficheiro e o número de triângulos determina o tamanho.

## O que descrevem os materiais de um GLB?

Os materiais seguem o modelo PBR metallic-roughness. PBR, representação baseada na física, descreve cor base, metalicidade e rugosidade, permitindo um aspeto semelhante nos visualizadores que respeitam o padrão.

![Textura do vaso extraída do GLB, com a superfície dividida em partes planas, anéis de barro claro, bordo e base](/blog/figures/glb-file/clay-vase-texture.webp "Textura de cor base extraída sem alterações do GLB, 1024 por 1024 píxeis. As coordenadas de textura indicam onde aplicar cada parte no vaso.")

Os valores omitidos recebem os predefinidos da especificação. Metallic sem valor equivale a 1, totalmente metálico: um material só com cor base é desenhado como metal rugoso, podendo escurecer ou tingir barro, madeira e tecido.

No Blender, define Metallic como 0 e volta a exportar. Faz este controlo em qualquer GLB para uma página de produto, independentemente de quem o criou.

## Porque pode um GLB parecer facetado?

As normais dos vértices indicam as direções usadas para iluminar suavemente uma superfície curva. São opcionais em glTF: o ficheiro pode guardar apenas posições e coordenadas de textura.

Nesse caso, a especificação manda calcular normais planas. Numa malha densa as facetas são pequenas, mas uma luz lateral baixa pode torná-las visíveis.

As normais ocupam 12 bytes por vértice, três números de 4 bytes: cerca de 96.000 bytes para 8.000 vértices. Usa Shade Smooth e exporta com Normals ativo no Blender; `gltf-transform inspect` mostra se existe o atributo NORMAL.

## Como abres um ficheiro GLB?

Precisas de um visualizador, sem conversão:

- No navegador, arrasta para o [Babylon.js Sandbox](https://sandbox.babylonjs.com/) ou o [editor model-viewer](https://modelviewer.dev/editor/).
- No Blender, escolhe [File, Import, glTF 2.0](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) (.glb/.gltf).
- Em código, three.js e Babylon.js carregam GLB diretamente; Unity usa o [pacote glTFast](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html).
- No Android, o [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) abre GLB ligado a uma página em 3D ou RA.

O AR Quick Look do iPhone e iPad usa USDZ e não abre GLB. Para oferecer RA nos dois sistemas, guarda ambos os ficheiros.

![Vaso de barro envelhecido como ficheiro GLB aberto no model-viewer da Google, pronto a rodar](/showcase/clay-vase.glb "GLB real do easyrender no model-viewer: vaso de barro envelhecido, 301 KB, uma malha de 14.590 triângulos e uma textura WebP de 1024 píxeis, preparado com glTF Transform.")

Roda-o devagar. Observa a parte inferior, as costas e detalhes como puxadores e costuras.

Para inspecionar sem visualizador, executa `gltf-transform inspect` do [glTF Transform](https://gltf-transform.dev/cli). Lista malhas, texturas e extensões, com vértices e tamanhos, permitindo comparar o ficheiro com a tabela.

## Para que serve um ficheiro GLB?

A Shopify aceita GLB como conteúdo de produto. Num site teu, o componente aberto [model-viewer](https://modelviewer.dev/), da Google, mostra-o com pouco código e inclui rotação e zoom.

GLB também é usado em 3D na web, jogos e aplicações RA: é compacto, aberto e lido por muitos programas. O Blender e a maioria das ferramentas de digitalização e IA exportam-no.

Para RA no Android, Scene Viewer recomenda no máximo 10 MB, 100.000 triângulos e texturas de 2048 píxeis. Todos os ficheiros da tabela respeitam esses valores.

## Como reduzes o tamanho de um GLB?

Testámos os comandos numa cópia da mesa de cabeceira, o modelo com mais triângulos, usando glTF Transform 4.5. O número de triângulos só muda com a simplificação.

| Versão da mesa de cabeceira                                   | Tamanho (bytes) | Triângulos |
| ------------------------------------------------------------- | --------------- | ---------- |
| Como aparece no site                                          | 1.287.432       | 69.910     |
| Geometria comprimida com Meshopt (`gltf-transform meshopt`)   | 422.480         | 69.910     |
| Geometria comprimida com Draco (`gltf-transform draco`)       | 235.776         | 69.910     |
| Metade dos triângulos (`gltf-transform simplify --ratio 0.5`) | 710.072         | 34.954     |

Draco produziu o menor ficheiro, com menos 82%. Meshopt retirou 67% e reduziu o vaso de barro de 308.448 para 135.740 bytes; simplificar sem comprimir poupou menos, porque a geometria restante continuou sem compressão.

O visualizador tem de suportar a compressão. model-viewer e three.js descodificam ambas, mas a documentação do Scene Viewer não lista essas extensões: verifica o ficheiro em todos os destinos antes de publicar.

Escolhe consoante o destino:

- Site teu com model-viewer: Meshopt ou Draco e WebP, verificando se os contornos ficam arredondados.
- RA Android por Scene Viewer: GLB simples com PNG ou JPEG até 2048 píxeis, simplificado apenas acima de 100.000 triângulos.
- Shopify: carrega sem compressão, pois a plataforma otimiza ficheiros acima de 15 MB.

## Como obténs GLB de Blender, digitalização ou fotografia?

No Blender, escolhe File, Export, glTF 2.0 e glTF Binary (.glb), mantendo as texturas dentro do ficheiro. Ativa Normals e UVs em Mesh e escolhe JPEG salvo transparência; aplicações de digitalização e ferramentas IA costumam fornecer GLB para descarga.

O guia de [como criar um modelo 3D](/pt/guias/como-criar-um-modelo-3d) compara os métodos. Para um catálogo, consulta [modelos 3D para ecommerce](/pt/guias/modelos-3d-para-ecommerce).

O easyrender fornece GLB e USDZ para cada modelo concluído a partir de uma foto, seguindo o guia para [criar um modelo 3D a partir de fotografias](/pt/guias/criar-um-modelo-3d-a-partir-de-fotografias). O modelo representa forma e materiais, não medidas.

## GLB para USDZ: precisas dos dois?

Para RA no iPhone e iPad, sim. O Reality Converter da Apple, gratuito no Mac, converte GLB em USDZ, e versões recentes do Blender exportam USDZ diretamente; o [guia do ficheiro USDZ](/pt/guias/ficheiro-usdz) explica também porque pode ficar maior do que o GLB original.

| Ficheiro | Conteúdo                                     | Onde abre                                  | Utilização                          |
| -------- | -------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| GLB      | Binário com geometria, materiais e texturas  | Navegadores, Blender, Scene Viewer Android | Páginas produto, web 3D, RA Android |
| glTF     | JSON .gltf, .bin e imagens separadas         | Mesmos visualizadores, mantendo tudo junto | Edição e inspeção do JSON legível   |
| USDZ     | Zip sem compressão com camadas USD e imagens | Quick Look no iPhone, iPad e Mac           | RA em dispositivos Apple            |

## O que pode correr mal com um GLB e como corriges?

Os problemas mais comuns têm poucas causas. Parte do que vês para encontrar a definição a alterar.

| Sintoma                              | Causa                                            | Correção                                         |
| ------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| Modelo cinzento                      | .gltf sem texturas ou exportação sem imagens     | Exporta novamente como .glb binário com texturas |
| Dezenas de megabytes                 | Texturas de 4096 píxeis ou muitas texturas       | Reduz para 2048 ou 1024 e comprime a geometria   |
| Curvas facetadas                     | Sem normais, calculadas planas pelo visualizador | Shade Smooth no Blender e exportação com normais |
| Barro ou tecido escuro ou tingido    | Metallic omisso, logo totalmente metálico        | Define Metallic como 0 e volta a exportar        |
| Manchas negras ou interior visível   | Faces viradas ao contrário                       | Recalcula as normais para fora no Blender        |
| Só abre num visualizador             | Extensão não suportada, como Draco ou WebP       | Exporta uma versão simples para o outro          |
| Carregamento rejeitado como inválido | Descarga interrompida e comprimento incorreto    | Descarrega novamente e compara o tamanho         |

## O que não te diz um GLB?

glTF usa metros, mas as dimensões dependem de quem construiu o modelo. Uma fotografia não fornece medidas, por isso mantém-nas no texto do produto.

O formato também não garante qualidade. Um ficheiro pode passar no [glTF Validator](https://github.khronos.org/glTF-Validator/) e conter uma perna deformada ou textura desfocada: só a observação num visualizador revela isso.

## FAQ

### GLB e glTF são a mesma coisa?

São duas formas de guardar o mesmo formato. glTF pode ser texto .gltf acompanhado por geometria e texturas separadas; GLB é a versão binária que reúne tudo num ficheiro, segundo o padrão glTF 2.0 do Khronos Group, e a maioria das ferramentas lê as duas versões.

### Podes abrir um GLB no iPhone?

Não diretamente no AR Quick Look, que usa USDZ. Podes vê-lo no navegador do iPhone com um visualizador web como Babylon.js Sandbox; para RA nos dispositivos Apple, converte para USDZ com Reality Converter num Mac ou pede ambos os ficheiros à ferramenta com que criaste o modelo.

### Como convertes um GLB para outro formato?

Abre-o no Blender, que importa GLB e exporta FBX, OBJ, USD e USDZ, entre outros. Cada conversão pode perder informação: OBJ não descreve materiais metallic-roughness, pelo que um puxador de latão pode ficar plano; verifica o resultado num visualizador antes de o mostrares aos clientes.

### Porque é o teu GLB tão grande?

Normalmente por texturas grandes ou geometria sem compressão. Nos nossos testes, Draco reduziu um modelo de 69.910 triângulos de 1.287.432 para 235.776 bytes: reduz texturas para 2048 ou 1024 píxeis, comprime a geometria com glTF Transform e verifica se as superfícies mantêm o aspeto pretendido.

### Porque aparece o GLB cinzento ou sem textura?

Muitas vezes as texturas nunca foram exportadas: um .gltf reunido sem imagens ou uma exportação só de geometria produz uma forma cinzenta. Exporta novamente como .glb binário com texturas incluídas; se parece correto no Babylon.js Sandbox mas não numa aplicação, o problema está nessa aplicação.
