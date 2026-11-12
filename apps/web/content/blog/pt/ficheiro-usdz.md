---

group: usdz-file
title: "Ficheiro USDZ: como usas o AR Quick Look no iPhone"
description: "Ficheiro USDZ: o que contém, como o abres e crias para iPhone e iPad e porque pode mostrar o modelo demasiado grande em realidade aumentada."
date: 2026-11-17
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: ficheiro usdz
cta: Escolhe uma fotografia nítida de uma peça, como uma mesa de apoio em carvalho ou um candeeiro de pé, e verifica todos os ângulos antes de gastares um crédito.
---

Um ficheiro USDZ contém um modelo 3D no formato Universal Scene Description da Pixar, USD, dentro de um pacote zip sem compressão. A Apple usa-o no AR Quick Look: podes abri-lo no iPhone ou iPad através do Safari, Ficheiros, Mail ou Mensagens e ver o objeto na divisão pela câmara. O Android não abre USDZ.

![Ilustração de um candeeiro de mesa em forma de cogumelo junto a um telemóvel, metade iluminada e metade em argila cinzenta mate com malha branca, sobre fundo escuro](/blog/illustrations/usdz-file/hero.webp "Ilustração, não um resultado do easyrender: um candeeiro metade iluminado e metade em argila com malha, junto a um telemóvel.")

## O que contém um ficheiro USDZ?

USD é o formato de cena criado pela Pixar para cinema. A [especificação USDZ](https://openusd.org/release/spec_usdz.html) descreve um zip sem compressão com camadas USD e imagens; cada ficheiro começa num múltiplo de 64 bytes, permitindo a leitura direta sem extrair o conteúdo.

![Um USDZ representado como pacote zip sem compressão, com uma camada USD que contém malha e materiais e as imagens das texturas referenciadas](diagram:usdz-anatomy "A estrutura descrita pela especificação USDZ. Sem compressão, o iPhone lê cada parte diretamente do pacote.")

As camadas USD usam duas codificações: .usda é texto legível e .usdc é binário. As texturas são normalmente PNG ou JPEG; a escolha do exportador determina grande parte do tamanho do ficheiro.

A Apple [apresentou o USDZ com o ARKit 2](https://www.apple.com/newsroom/2018/06/apple-unveils-arkit-2/) na WWDC de junho de 2018, para iOS 12, juntamente com o AR Quick Look. Desde então é o formato usado pelos dispositivos Apple para realidade aumentada (RA) a partir de páginas e mensagens.

## O que determina o tamanho de um USDZ?

Duas escolhas do exportador. A geometria em texto .usda ocupa várias vezes os bytes da mesma malha em binário .usdc, porque guarda cada número como uma sequência de algarismos; uma textura fotográfica PNG sem perdas costuma também ocupar várias vezes o espaço da mesma imagem em JPEG.

A especificação inclui PNG e JPEG, mas não WebP. Ao converter um GLB com texturas WebP para USDZ, as imagens também são convertidas, e o formato escolhido determina quanto crescem.

| Escolha na exportação | Ficheiro menor                           | Ficheiro maior                                 |
| --------------------- | ---------------------------------------- | ---------------------------------------------- |
| Geometria             | Binário .usdc                            | Texto .usda                                    |
| Formato das texturas  | JPEG, salvo necessidade de transparência | PNG                                            |
| Dimensão das texturas | 1024 ou 2048 píxeis                      | 4096 píxeis                                    |
| Malha                 | Simplificada para o ecrã do telemóvel    | Todos os triângulos de uma digitalização densa |

Nenhuma opção é um erro: o Quick Look lê as duas codificações e os dois formatos de imagem. O tamanho continua a contar, porque vários megabytes demoram mais a enviar por Mensagens e a carregar com dados móveis.

## Como verificas o conteúdo de um USDZ?

Como USDZ é um zip, `unzip -l side-table.usdz` lista os ficheiros internos e respetivos tamanhos. Vês logo se a geometria é .usda ou .usdc e se as texturas são PNG ou JPEG; sem compressão, os tamanhos listados são os efetivos.

Extrai uma cópia e abre a camada .usda principal num editor de texto. `metersPerUnit` e `upAxis` indicam a dimensão apresentada e a orientação vertical; uma linha de ancoragem diz se o Quick Look coloca o modelo numa superfície horizontal, como o chão, ou vertical, como uma parede.

Escolhe geometria binária .usdc e texturas até 2048 píxeis em JPEG, a menos que precises de transparência. Compara o tamanho com o GLB e abre o resultado no Quick Look de um Mac antes de o colocares numa página.

## Como abres um ficheiro USDZ?

Depende do dispositivo:

- iPhone e iPad: toca no ficheiro no Safari, Ficheiros, Mail ou Mensagens. O Quick Look oferece as vistas Objeto e RA.
- Mac: seleciona-o no Finder e carrega na barra de espaços para a pré-visualização.
- Windows e Android: não têm visualizador integrado. O [Blender 3.5 ou posterior](https://developer.blender.org/docs/release_notes/3.5/pipeline_assets_io/) importa USDZ, pelo que podes abri-lo num computador com Blender.

A [página da Apple sobre Quick Look](https://developer.apple.com/augmented-reality/quick-look/) inclui Safari, Mensagens, Mail, News e Notas, a partir de iOS 12 ou iPadOS 12. Para Android ou navegador usa GLB, explicado no [guia do ficheiro GLB](/pt/guias/ficheiro-glb).

<!-- IMAGE PENDING: captura real e sem retoques de um USDZ easyrender na vista Objeto do Quick Look num iPhone. Não usar a vista RA antes do teste no dispositivo (REQ-00). -->

## Como funciona o AR Quick Look numa página web?

A página inclui uma ligação ao USDZ com `rel="ar"` que envolve uma imagem de pré-visualização, e o Safari acrescenta um pequeno símbolo RA. O [guia WebKit](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) mostra o código: ao tocar na imagem, abres o modelo na divisão sem instalar uma aplicação.

Há quatro detalhes a respeitar:

1. Aloja o USDZ por HTTPS com o tipo de conteúdo `model/vnd.usdz+zip`, esperado pelo Safari.
2. Coloca a imagem dentro de uma ligação ao ficheiro: `<a rel="ar" href="side-table.usdz"><img src="side-table.jpg"></a>`.
3. Mantém um único elemento filho, `img` ou `picture`, sem mais conteúdo.
4. Verifica o suporte com `a.relList.supports("ar")` e apresenta uma ligação normal para descarregar o ficheiro quando devolver false.

O componente de código aberto [model-viewer](https://modelviewer.dev/), da Google, trata dos dois sistemas: mostra GLB na página e entrega USDZ aos iPhones para o Quick Look.

![Duas entradas para AR Quick Look no iPhone: imagem com símbolo RA no Safari ou ficheiro aberto em Mensagens, Mail ou Ficheiros, ambas com vistas Objeto e RA](diagram:quick-look-path "Os dois percursos terminam nas mesmas vistas. O modelo usa as dimensões guardadas no ficheiro, que não resultam de medições quando parte de uma fotografia.")

O AR Quick Look usa as dimensões guardadas no ficheiro. Sem medições, o modelo pode parecer maior ou menor do que a peça que representa; quem o vê pode ainda redimensioná-lo com dois dedos.

## Como crias um ficheiro USDZ?

Os quatro métodos mais comuns diferem nos sistemas onde funcionam e nas tarefas que permitem fazer.

| Ferramenta                  | Onde funciona         | Vantagem                                  | O que verificar                           |
| --------------------------- | --------------------- | ----------------------------------------- | ----------------------------------------- |
| Reality Converter da Apple  | Mac                   | Verificar materiais antes de exportar     | Só Mac                                    |
| Blender 3.5 ou posterior    | Mac, Windows, Linux   | Editar o modelo antes de exportar         | Alguns materiais perdem detalhe visual em USD |
| Exportador USDZ do three.js | Qualquer navegador    | Sem servidor e USDZ correspondente ao GLB | Tamanho e materiais no Quick Look         |
| Shopify                     | Administração da loja | Criar GLB e USDZ de cada modelo carregado | A plataforma decide o resultado           |

O Reality Converter [converte OBJ, glTF, FBX e USD](https://developer.apple.com/videos/play/wwdc2022/10141/) para USDZ. No Blender escolhe File, Export, Universal Scene Description e dá ao ficheiro a extensão .usdz.

Se editas modelos, exporta do Blender e verifica no Quick Look do Mac. Na Shopify, carrega o GLB e deixa a plataforma criar USDZ; num site teu, a exportação no navegador mantém um só ficheiro de origem, mas compara o tamanho com o GLB.

Se partes de uma foto, algumas ferramentas fornecem logo os dois formatos. O guia para [criar um modelo 3D a partir de fotografias](/pt/guias/criar-um-modelo-3d-a-partir-de-fotografias) explica os passos.

O easyrender fornece ambos os ficheiros para cada modelo concluído. A RA está a chegar e permitirá ver a peça na tua divisão pelo telemóvel; mantém as medidas no texto do produto, porque a RA usa as dimensões guardadas no ficheiro.

## Um exemplo: uma mesa de apoio em carvalho no iPhone

Envia para ti o USDZ através da aplicação Mensagens e toca no ficheiro. O Quick Look abre a vista Objeto, onde o rodas com um dedo; passa para RA, aponta a câmara ao chão e toca no local pretendido.

Anda à volta e observa onde as pernas tocam no chão. Uma base deslocada pode fazer o modelo parecer suspenso.

![Mesa redonda em madeira maciça como modelo 3D que podes rodar para verificar as pernas de todos os lados](/showcase/coffee-table.glb "Mesa modelada pelo easyrender a partir de uma foto, aqui apresentada em GLB: 16.228 triângulos. O USDZ é criado a partir deste GLB, por isso os dois mostram o mesmo modelo. Roda-a e observa o apoio das pernas.")

Depois verifica o veio sob a tua luz, mais quente do que a iluminação de estúdio da fotografia original.

## O que pode correr mal com um USDZ e como corriges?

O problema costuma estar na forma de servir o ficheiro ou no conteúdo escrito pelo conversor. Parte do sintoma para encontrar a alteração necessária.

| Sintoma                                 | Causa                                              | Correção                                                          |
| --------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| A ligação descarrega em vez de abrir RA | Falta `rel="ar"` ou o tipo de conteúdo está errado | Acrescenta `rel="ar"` e serve como `model/vnd.usdz+zip`           |
| Sem símbolo RA na imagem                | Mais de um filho na ligação ou iOS anterior a 12   | Usa um único filho `img` ou `picture` e testa num iPhone recente  |
| Peça enorme ou minúscula                | Quick Look usa dimensões guardadas sem medição     | Escreve as medidas; o comprador pode redimensionar com dois dedos |
| Peça suspensa                           | Base acima da origem                               | Move a origem para a base no Blender e exporta novamente          |
| Cores menos vivas do que no Blender     | Material sem correspondência direta em USD         | Verifica no Quick Look do Mac e simplifica o material             |
| Curvas facetadas                        | GLB de origem sem normais                          | Acrescenta normais suaves antes da conversão                      |
| Ficheiro demasiado grande para enviar   | Geometria em texto e texturas PNG                  | Exporta geometria binária e JPEG e compara tamanhos               |

## GLB para USDZ: deves guardar os dois?

Sim, para uma página de produto. O GLB serve a web e o Android, e o USDZ serve a RA nos dispositivos Apple; a Shopify aceita ambos e cria a versão em falta.

O guia de [como criar um modelo 3D](/pt/guias/como-criar-um-modelo-3d) explica a origem dos ficheiros em cada método. Para escolher produtos, consulta [modelos 3D para ecommerce](/pt/guias/modelos-3d-para-ecommerce).

## FAQ

### Podes abrir um ficheiro USDZ no Android?

Não diretamente: a RA do Android usa o Scene Viewer da Google, que lê glTF e GLB. Usa a versão GLB do mesmo modelo; se só tens o ficheiro Apple, o Blender 3.5 ou posterior importa USDZ e exporta GLB, mas verifica os materiais depois da conversão.

### Podes converter USDZ para GLB?

Sim: importa o USDZ no Blender 3.5 ou posterior e exporta como glTF 2.0 no formato binário GLB. Verifica num visualizador, porque USD e glTF descrevem superfícies de forma diferente: algumas definições, como a camada transparente de uma madeira lacada, podem não passar exatamente para o outro formato.

### Porque aparece um USDZ demasiado grande ou pequeno em RA?

O AR Quick Look usa as dimensões guardadas no ficheiro. Se o modelo parte de uma fotografia ou digitalização sem referência medida, pode aparecer maior ou menor do que a peça física: usa a RA para observar o aspeto e consulta as medidas no texto do produto.

### Porque é o USDZ maior do que o GLB original?

Depende normalmente do conversor: geometria em texto ocupa várias vezes o espaço do binário e USDZ não inclui WebP nos formatos de imagem. Uma textura WebP pequena pode ser convertida num PNG muito maior; exportar geometria binária .usdc e texturas JPEG reduz o tamanho do ficheiro.

### USDZ e USD são a mesma coisa?

USDZ é um pacote de USD. Uma cena USD pode ser texto .usda, binário .usdc ou vários ficheiros ligados; USDZ junta essas camadas e texturas num único ficheiro sem compressão, o que facilita o envio por mensagem e a abertura num iPhone sem gerir recursos separados.
