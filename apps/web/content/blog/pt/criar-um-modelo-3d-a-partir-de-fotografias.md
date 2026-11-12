---

group: how-to-make-a-3d-model-from-photos
title: "Modelo 3D a partir de uma foto: como criar e verificar"
description: "Cria um modelo 3D a partir de uma foto: escolhe a imagem, verifica os lados que ficaram fora da foto e descarrega os ficheiros GLB e USDZ."
date: 2026-11-11
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: modelo 3d a partir de foto
cta: Escolhe uma fotografia nítida de uma cadeira ou de um aparador do teu catálogo, vistos de três quartos, e verifica todos os ângulos antes de gastares um crédito.
---

Para criar um modelo 3D a partir de uma foto, carrega uma foto nítida de um objeto, com luz uniforme, numa ferramenta de imagem para 3D: os lados que não aparecem são deduzidos dessa foto. A alternativa é a fotogrametria, com pelo menos 20 fotografias sobrepostas à volta da peça. Nos dois métodos, a fotografia determina grande parte do resultado.

![Ilustração de um regador galvanizado, metade em metal e metade em argila cinzenta mate com malha branca, sobre fundo escuro](/blog/illustrations/how-to-make-a-3d-model-from-photos/hero.webp "Ilustração, não um resultado do easyrender: um regador metade em metal galvanizado e metade em argila com malha.")

## Modelo 3D a partir de fotografias: uma ou várias?

Tens o objeto à tua frente? A fotogrametria e o LiDAR exigem acesso à peça; a criação de modelos a partir de imagens, ou image-to-3D, também funciona com a foto de um aparador enviada pelo fornecedor.

A fotogrametria junta fotografias sobrepostas. A [Polycam](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) pede pelo menos 20, com cerca de 70% de sobreposição, e 100 ou mais para peças detalhadas; [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) começa após 20 imagens, aceita 300 e recomenda círculos e arcos a várias alturas.

LiDAR no iPhone Pro ou iPad Pro mede profundidade enquanto andas à volta. É rápido a captar formas grandes e simples, mas regista menos detalhe fino, como elementos torneados.

![Dois métodos: fotogrametria com 20 a 100 fotos ou mais de uma peça acessível e imagem para 3D com uma foto usada para deduzir os lados que não aparecem](diagram:photo-vs-photogrammetry "A fotogrametria mede o que a câmara viu. A criação a partir de imagens usa uma foto para deduzir os lados que não aparecem. Quantidades de fotografias segundo a Polycam.")

Escolhemos assim:

- Só fotografia do fornecedor, peça num armazém estrangeiro: imagem para 3D, o único método disponível.
- Peça no teu armazém, carvalho ou linho com textura e uma hora livre: fotogrametria para registar a superfície.
- Forma grande e simples, como um sofá de três lugares, e iPhone Pro disponível: LiDAR, quando o volume importa mais do que o tecido.
- Vidro, espelhos ou cromado polido: difíceis para todos, porque os reflexos são lidos como superfície.

O comparativo [fotogrametria ou IA de uma foto](/compare/photogrammetry-software) explica as vantagens e dificuldades de cada método.

## Como funciona a criação de 3D a partir de uma imagem?

Algumas ferramentas passam diretamente da foto para o modelo. Outras desenham primeiro o objeto de vários ângulos e usam essas vistas para construir o modelo, com mais referências para os lados que a foto não mostra.

O easyrender usa o segundo método, escolhido após um teste A/B com anúncios reais. Esse teste usou um modelo de imagem maior; o modelo mais económico que hoje desenha as vistas ainda não foi comparado da mesma forma.

A primeira fase produz uma imagem com nove vistas do objeto, dispostas numa grelha quadrada de 3 por 3.

Oito vistas mostram o objeto a intervalos de 45 graus, da vista frontal à vista de três quartos do lado esquerdo; a nona mostra-o de cima. Em cada célula, a peça aparece inteira e centrada num fundo branco, com luz suave; a segunda fase lê a fotografia e as nove vistas para construir uma malha com textura.

![Cinco passos em duas fases: fotografia, imagem com nove vistas, verificação das costas e dos lados, construção e GLB e USDZ, regressando a outra foto se a pré-visualização estiver errada](diagram:image-to-3d-pipeline "O percurso seguido abaixo. No easyrender a pré-visualização é gratuita e os créditos só são gastos no passo 4, se decidires construir.")

Uma foto mostra a forma e a cor gerais, mas não revela o que está por trás de um entrançado aberto; os lados que não aparecem tendem a ser deduzidos por simetria. As nossas instruções pedem lados ocultos coerentes com a construção visível, sem inventar logótipos, texto ou decoração.

Para móveis, acrescentamos regras com base nos testes: manter o número de pernas, braços, almofadas e gavetas, a direção do veio e as costuras. Os restantes métodos estão em [como criar um modelo 3D](/pt/guias/como-criar-um-modelo-3d).

## Passo 1: escolhe a fotografia certa

Mostra o objeto inteiro, nítido, com luz suave uniforme e fundo liso. Nada o deve tapar: nem almofada sobre o braço nem planta à frente de uma perna.

Para móveis, escolhe uma vista de três quartos em vez de uma vista de frente. A fotografia frontal esconde a profundidade do assento; de três quartos, vês a frente e um lado, com menos partes fora da foto.

![Poltrona em bouclé com estrutura tubular de aço, fotografada de três quartos sobre fundo branco](/showcase/armchair.jpg "Um bom ponto de partida: poltrona inteira, três quartos e fundo liso.")

Usa JPEG, PNG ou WebP abaixo de 4 MB.

A verificação rejeita fotografias com menos de 400 píxeis no lado mais curto e avisa quando têm menos de 800. Também rejeita imagens mais de quatro vezes mais largas do que altas ou tão uniformes que parecem vazias.

Acima desses valores, conta sobretudo a nitidez: verificamos o desfoque numa cópia pequena de cada imagem. Observa um contorno a 100%: se o veio ou a trama não se distinguem na foto, falta essa informação para construir o modelo.

Antes de carregar, verifica:

- Peça inteira, margem de todos os lados, pés sem cortes.
- Câmara aproximadamente a meia altura, sem apontar de cima.
- Contornos nítidos à resolução original.
- Luz uniforme, sem sombra dura a atravessar a peça.
- Fundo liso: parede, papel ou chão limpo.
- Um objeto, não uma divisão mobilada.

## Passo 2: retira o que não é o objeto

Um fundo confuso altera a leitura da fotografia. O padrão de um tapete pode parecer parte da base de uma mesa, ou uma cortina pode confundir-se com um candeeiro.

Se só tens uma fotografia em contexto, recorta-a à volta da peça, deixando uma pequena margem. A largura da imagem de um aparador comprido pode chegar a quatro vezes a altura; acima disso, a verificação pede uma foto do produto inteiro.

Remover o fundo ajuda, mas pode deixar halos claros nos contornos. Verifica-os à resolução original, porque podem parecer parte do objeto.

As sombras também pertencem ao fundo. Uma sombra dura sob uma mesa pode ser lida como uma placa escura ligada às pernas: espera por luz suave de céu encoberto.

## Passo 3: verifica a pré-visualização de todos os ângulos

Antes da construção final, observa as vistas da peça. Presta atenção às costas e aos lados que a fotografia não mostrou.

Conta pernas, portas e gavetas em cada célula, não apenas de frente. Compara células opostas, como frente à direita e costas à esquerda: se os braços mudarem de forma, revê a foto ou a nota antes de construir o modelo.

A vista de cima revela o que as outras escondem. É onde notas um abajur redondo que parece oval ou um tampo mais largo numa extremidade.

![Nove vistas da mesma poltrona em bouclé, frente, lados, costas e cima, geradas a partir da fotografia anterior](/showcase/armchair-angles.jpg "A imagem gratuita com nove vistas criada pelo easyrender a partir dessa foto, sem retoques. As costas e a parte de cima são deduzidas da foto, que não as mostrava.")

As verificações automáticas rejeitam pré-visualizações com menos de 768 píxeis, com o objeto ausente de mais de duas células ou com mais de três vistas quase iguais entre as oito à volta da peça.

Em cópias pequenas em tons de cinzento, vistas diferentes apresentam uma diferença de pelo menos 3%; numa vista repetida, a diferença fica abaixo de 1%. Repetir a foto em todas as células não acrescenta referências para construir o modelo.

A contagem precisa de uma pessoa: compara cada célula com a peça antes de avançar. Se algo está errado, muda a foto ou acrescenta uma nota, em vez de voltar a usar a mesma imagem sem alterações.

O easyrender aceita notas sobre o que a foto esconde: «quatro portas», «costas abertas», «puxadores de latão». A imagem com nove vistas acima é um resultado real obtido a partir da foto do passo 1; tens duas pré-visualizações gratuitas por dia sem créditos e só gastas ao construir o modelo.

A pré-visualização gratuita inclui a marca de água «easyrender.ai preview», que não aparece na imagem com nove vistas mostrada acima. [Carrega uma foto](/pt)

## Passo 4: constrói e descarrega os ficheiros

Quando a forma estiver correta, inicia a construção do modelo com textura. O GLB é comum na web e no Android; o USDZ é usado pelo AR Quick Look no iPhone e no iPad.

O nosso processo usa uma textura de 2048 píxeis e cria uma malha com um material cuja cor vem dessa imagem. É o caso mais simples para visualizadores e fica abaixo dos 10 materiais recomendados pelo Scene Viewer.

Os seis modelos da galeria vão de 14.590 triângulos no vaso de barro a 69.910 na mesa de cabeceira. Todos ficam abaixo dos 100.000 recomendados pelo [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer).

![Poltrona em bouclé como modelo 3D com textura construído a partir da fotografia do passo 1, num visualizador](/showcase/armchair.glb "Modelo do easyrender a partir da foto e da imagem com nove vistas, com texturas comprimidas para esta página: 25.879 triângulos, 538 KB. Roda-o, verifica as costas e observa o tecido com luz neutra antes de publicar.")

Abre o GLB no Blender em File, Import, glTF 2.0 ou no [Babylon.js Sandbox](https://sandbox.babylonjs.com/). No Blender ativa Statistics nos overlays para veres o número de triângulos; abre sempre o ficheiro e roda-o devagar antes de usar.

O easyrender fornece ambos os ficheiros em cada modelo concluído. O USDZ é convertido do GLB no navegador quando o descarregas, mantendo a correspondência; a realidade aumentada (RA) está a chegar e usará as dimensões guardadas no ficheiro, por isso mantém as medidas no anúncio.

Os guias de [ficheiro GLB](/pt/guias/ficheiro-glb) e [ficheiro USDZ](/pt/guias/ficheiro-usdz) explicam o conteúdo.

## O que pode correr mal e como corriges?

Muitos erros começam na fotografia. Parte do sintoma e corrige a imagem ou definição indicada.

| Sintoma                               | Causa                                                                                                                    | Correção                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Foto rejeitada por ser pequena        | Lado curto abaixo de 400 píxeis, normalmente miniatura                                                                   | Usa o original com menos de 4 MB                                                           |
| Foto rejeitada por ser estreita       | Largura superior a quatro vezes a altura                                                                                 | Recorta à volta da peça com margem                                                         |
| Duas pernas tornam-se uma             | Pernas traseiras escondidas atrás das dianteiras                                                                         | Usa uma foto de três quartos com as quatro pernas visíveis                                 |
| Quatro portas tornam-se três          | Juntas com pouco contraste                                                                                               | Usa luz rasante ou acrescenta a nota «quatro portas»                                       |
| Costas iguais à frente                | A fotografia só mostrou a frente                                                                                         | Acrescenta a nota «costas abertas» ou «costas lisas», ou usa uma foto de um canto traseiro |
| Entrançado parece padrão impresso     | Uma foto não mostra o que há atrás dos espaços                                                                           | Avalia num visualizador pequeno ou usa fotogrametria                                       |
| Tecido mais amarelo ou escuro         | Luz diferente ou Metallic omisso, metálico por predefinição                                                              | Verifica com luz neutra e define Metallic como 0                                           |
| Superfícies facetadas com luz lateral | Sem normais, calculadas planas segundo a [especificação glTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) | Usa Shade Smooth no Blender e exporta novamente                                            |

## Como sabes se está pronto para publicar?

Define os critérios antes de avaliar o modelo. Deves conseguir responder sim ou não a cada um.

1. Número correto de pernas, portas, gavetas e puxadores.
2. Costas e parte inferior coerentes com a peça, segundo quem a possui.
3. Textura legível em ecrã inteiro.
4. Abre no navegador, num iPhone e num Android.
5. Ficheiro adequado ao destino: [Shopify](https://help.shopify.com/en/manual/products/product-media/product-media-types) aceita 500 MB, Scene Viewer recomenda 10 MB e 100.000 triângulos.

Se falha o ponto 1 ou 2, volta à fotografia ou à nota. O ponto 5 pede compressão, explicada no guia GLB.

## O que não podes obter de uma só fotografia?

A fotografia não fornece as dimensões físicas. Escreve-as no anúncio quando o comprador precisar delas.

Um logótipo pequeno, um puxador fino ou texto distante podem não ser legíveis na fotografia de partida. Em vime e entrançados, uma foto não mostra o que fica atrás de cada abertura: documenta esses detalhes com fotografias adicionais.

Vidro, espelhos e cromado refletem o ambiente em vez de mostrar a superfície, dificultando também a fotogrametria. Estas ferramentas tratam um objeto de cada vez, não divisões mobiladas.

## FAQ

### De quantas fotografias precisas para um modelo 3D?

Basta uma para criar 3D a partir de uma imagem; os lados que não aparecem são deduzidos dessa foto. A fotogrametria mede várias superfícies e precisa de pelo menos 20 fotografias sobrepostas, muitas vezes 100 ou mais para peças detalhadas: precisas do objeto à tua frente e de espaço para andar à volta.

### Que resolução deve ter a fotografia?

Aponta para pelo menos 800 píxeis no lado curto, mais se possível. O easyrender rejeita fotos abaixo de 400, avisa abaixo de 800 e verifica o desfoque; depois, conta a nitidez: amplia um contorno a 100% e confirma que o veio ou a trama são visíveis.

### Criar 3D a partir de uma imagem é o mesmo que fotogrametria?

Não: a fotogrametria mede a partir de muitas fotografias reais, pelo que cada superfície foi vista pela câmara. A criação a partir de uma imagem deduz dessa foto os lados que não aparecem; a fotogrametria exige acesso à peça, enquanto o outro método funciona com uma fotografia de catálogo.

### É gratuito transformar uma fotografia num modelo 3D?

Experimentar costuma ser gratuito; obter o ficheiro final costuma ser pago, por modelo ou subscrição. No easyrender tens duas pré-visualizações diárias sem créditos; um modelo concluído custa {{renderCredits}} créditos, ou {{renderPrice}} a {{creditPrice}} por crédito, como indicado na página de preços antes de iniciares a construção do modelo.

### Podes imprimir em 3D um modelo criado a partir de uma foto?

Considera-o um modelo para ecrãs: a fotografia não mostra todos os lados nem fornece medidas para fabricar a peça. O easyrender exporta GLB e USDZ para web e RA, não STL ou ficheiros de impressão; para produzir uma peça física usa CAD construído com medidas reais.
