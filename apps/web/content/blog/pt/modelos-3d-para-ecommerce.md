---

group: 3d-models-for-ecommerce
title: "Modelos 3D para ecommerce: métodos, ficheiros e custos"
description: "Como obter modelos 3D para ecommerce: quatro métodos, GLB e USDZ, verificações no telemóvel e um teste com poucos produtos."
date: 2026-11-13
updated: 2026-11-11
author: Jorge Rodríguez
authorType: person
keyword: modelos 3d para ecommerce
cta: Escolhe uma peça com profundidade, como uma poltrona ou um aparador, e verifica todos os ângulos antes de decidires se o 3D compensa para a tua loja.
---

Os modelos 3D para ecommerce são normalmente ficheiros GLB ou USDZ que o comprador pode rodar no ecrã e ver na divisão pelo telemóvel com realidade aumentada (RA). Podes obtê-los de quatro formas: contratar um profissional 3D, usar os ficheiros CAD do fabricante, digitalizar o produto ou gerá-lo com IA a partir de uma fotografia.

![Ilustração de um mocassim castanho junto à caixa, frente em pele e calcanhar em argila cinzenta mate com malha branca, sobre fundo escuro](/blog/illustrations/3d-models-for-ecommerce/hero.webp "Ilustração, não um resultado do easyrender: um mocassim metade em pele e metade em argila com malha, junto à caixa.")

## O que acrescenta um modelo 3D à página de produto?

Uma foto mostra o ângulo que escolheste. O modelo deixa o comprador escolher: costas da estante, parte inferior da mesa de centro ou espessura da almofada da poltrona.

![Poltrona giratória cinzenta estofada na fotografia de catálogo, vista de trás a três quartos](/showcase/swivel-chair.jpg "A fotografia de catálogo: um ângulo de trás escolhido pelo fotógrafo.")
![A mesma poltrona giratória num visualizador 3D que permite observar frente e assento](/showcase/swivel-chair.glb "O modelo criado pelo easyrender a partir dessa fotografia: o comprador escolhe a vista. A frente é deduzida da fotografia, que só mostra as costas.")

No iPhone e iPad, um ficheiro USDZ abre no [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) e mostra a peça na divisão através da câmara. No Android, o [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) faz o mesmo com GLB.

A RA mostra o aspeto da peça na divisão. As dimensões vêm do ficheiro: Scene Viewer interpreta uma unidade como um metro, mas uma fotografia não fornece medidas, por isso escreve-as na descrição do produto.

## Como avalias se o 3D compensa?

Decide antes o que queres melhorar: menos perguntas sobre costas e profundidade, mais adições ao carrinho nas páginas com modelo ou menos devoluções motivadas pelo aspeto. São três objetivos verificáveis numa loja de móveis.

Não publicamos números de conversão ou devoluções atribuídos ao 3D porque não medimos resultados que possamos sustentar. Trata os números publicados por outros como hipóteses a testar no teu catálogo.

Escolhe cinco a dez produtos com modelo e um grupo de produtos semelhantes sem modelo. Mantém preços, fotografias e textos durante quatro a seis semanas, depois compara adições ao carrinho por visualização e motivos de devolução.

Num site teu, o [model-viewer](https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/features/ar.ts) emite eventos para análise. `camera-change` com origem `user-interaction` indica rotação manual; `ar-status` comunica início ou falha de RA e `quick-look-button-tapped` a passagem para Quick Look no iPhone.

## De que ficheiros precisa uma loja?

GLB para a web e o Android, USDZ para RA nos dispositivos Apple. As plataformas compatíveis aceitam um ou ambos.

![Um modelo em dois ficheiros: GLB para navegadores e Scene Viewer Android, USDZ para AR Quick Look no iPhone e iPad](diagram:store-files "Um modelo, dois ficheiros, três pontos de acesso. Num site teu podes servir ambos com model-viewer.")

### Modelos 3D na Shopify

A [Shopify aceita GLB e USDZ](https://help.shopify.com/en/manual/products/product-media/product-media-types) até 500 MB nos conteúdos do produto. Acima de 15 MB otimiza geometria e texturas; também converte cada modelo para disponibilizar as duas versões.

### WooCommerce e sites próprios

WooCommerce acrescenta 3D com extensões como [Arty 3D Viewer](https://woocommerce.com/products/arty-3d-viewer/). Num site teu, [model-viewer](https://modelviewer.dev/) mostra GLB e `ar-modes="webxr scene-viewer quick-look"` abre o visualizador de RA adequado a cada telemóvel.

### Que limites de tamanho e complexidade escolhes?

A Shopify aceita ficheiros grandes, mas o telemóvel do comprador beneficia de ficheiros pequenos. Comparamos os nossos exemplos com os valores publicados pelo Scene Viewer.

| Critério   | Recomendação Scene Viewer                  | Seis modelos da nossa galeria |
| ---------- | ------------------------------------------ | ----------------------------- |
| Triângulos | Até 100.000, idealmente 30.000 a 50.000    | 14.590 a 69.910               |
| Textura    | Máximo 2048 x 2048                         | Uma de 1024 x 1024 em cada    |
| Materiais  | Até 10                                     | Um em cada                    |
| Tamanho    | 10 MB; acima pode prejudicar a experiência | 308.448 a 1.287.432 bytes     |

Scene Viewer lista as extensões glTF suportadas. Uma extensão ausente, como texturas WebP, pode impedir a abertura: para RA Android prefere PNG ou JPEG e testa num telemóvel antes de acrescentar a ligação ao ficheiro na página.

## Como crias modelos 3D de produtos?

Comparamos quatro métodos: se exigem acesso à peça, quanto tempo te ocupam, a fidelidade dos lados que a foto não mostra e as dificuldades habituais.

### Contrata um profissional 3D

O profissional constrói com fotografias, desenhos e medidas, sem precisar da peça física. Preparação e espera exigem mais tempo, mas referências documentadas permitem um resultado exato; os orçamentos no Fiverr ou Upwork variam com a complexidade.

Escolhemos este caminho para um sofá vendido em três larguras ou para a peça principal de uma campanha, quando a precisão é necessária.

### Usa os ficheiros CAD do fabricante

Se vendes peças desenhadas por ti, a fábrica pode já ter ficheiros CAD ou SketchUp. A geometria é precisa, mas para a web costuma precisar de texturas realistas e muito menos triângulos.

Pede-os antes de encomendar um modelo novo. Conta com trabalho de preparação: um ficheiro de fábrica pode ultrapassar bastante os 100.000 triângulos recomendados pelo Scene Viewer.

### Digitaliza o produto

Polycam e [RealityScan](https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide) usam muitas fotografias sobrepostas. RealityScan começa após 20 imagens e aceita até 300; precisas da peça e de espaço para andar à volta.

É a nossa escolha para superfícies detalhadas no teu armazém, como vime ou carvalho. Vidro, espelhos e metal polido dificultam a reconstrução.

### Gera com IA a partir de uma foto

Meshy, Tripo e easyrender partem de uma imagem. É o caminho disponível quando só tens a foto do fornecedor: como a foto só mostra um lado, verifica na pré-visualização as costas que ficaram fora da imagem.

![Nove vistas de um vaso de grés mate geradas a partir de uma única fotografia de produto](/showcase/vase-angles.jpg "Vistas geradas pelo easyrender a partir de uma foto de um vaso de grés, sem retoques. Formas redondas e mates são um caso simples.")

Escolhemos este método para catálogos feitos com fotografias de fornecedores. Uma só imagem pode não mostrar bem logótipos pequenos e entrançados abertos, e não mostra os lados que ficaram fora da foto; o guia de [como criar um modelo 3D](/pt/guias/como-criar-um-modelo-3d) compara os métodos.

O comparativo [profissional 3D ou IA](/compare/3d-modeler-vs-ai) trata da escolha entre contratação e fotografia. Para ferramentas específicas, consulta [Meshy](/compare/meshy) e [Tripo](/compare/tripo).

## Modelos 3D para lojas de móveis: por onde começas?

Avalia cada produto: o comprador quer ver as costas e a profundidade, hesita por causa do preço, pede outros ângulos ou menciona o aspeto nas devoluções? Usa estas quatro perguntas para definir prioridades antes de produzir modelos.

Começa pelos cinco com mais respostas positivas: frequentemente poltronas, aparadores e candeeiros com abajures trabalhados. Gravuras emolduradas e tapetes ganham pouco com rotação.

Testa dois métodos no mesmo produto, como digitalização pelo telemóvel e IA no mesmo candeeiro. Compara no ecrã do telemóvel: o resultado diz mais do que uma lista de funções.

Para catálogos grandes, avalia carregamentos em lote e custo por modelo. O easyrender permite carregar várias fotografias, verificar a pré-visualização gratuita de cada uma e construir só os modelos aprovados.

## Como acrescentas 3D à loja?

Para o primeiro grupo, segue esta ordem:

1. Escolhe cinco produtos com as quatro perguntas anteriores.
2. Cria cada modelo pelo método adequado.
3. Verifica pernas, portas, costas e textura em ecrã inteiro.
4. Reduz texturas para 2048 píxeis ou menos e comprime geometria se o visualizador suportar.
5. Carrega os ficheiros com as ferramentas da plataforma, como os conteúdos de produto da Shopify.
6. Abre cada página num iPhone e Android com dados móveis e testa RA em ambos.
7. Avalia os resultados durante quatro a seis semanas e escolhe os próximos produtos.

## Um exemplo: um aparador em nogueira

Tens três fotografias do fornecedor: frente, três quartos e pormenor dos puxadores de latão. Para criar o modelo a partir de uma imagem, escolhe a fotografia de três quartos: mostra a profundidade e o painel lateral.

![Três fotografias desenhadas de um aparador: vista frontal que não mostra a profundidade, vista de três quartos com o painel lateral, assinalada como a melhor escolha, e pormenor de um puxador](diagram:sideboard-photo-pick "Só a vista de três quartos mostra o painel lateral, revelando mais da profundidade na foto. Desenho para este exemplo, não um anúncio real.")

Verifica portas, pernas e veio da madeira. Compara os puxadores com o pormenor, porque as peças pequenas precisam de informação visual suficiente, e observa as costas que a fotografia não mostrava.

Carrega o GLB com as ferramentas da plataforma e abre a página em iPhone e Android. Na Shopify, o USDZ do iPhone é criado a partir do mesmo carregamento.

## O que pode correr mal ao acrescentar 3D?

Muitos problemas só aparecem num telemóvel real. Por isso, a verificação no dispositivo faz parte do processo.

| Sintoma                        | Causa                                                          | Correção                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sem botão RA no Android        | Scene Viewer exige HTTPS ou dispositivo compatível             | Serve GLB por HTTPS e testa outro telemóvel                                                                                                        |
| Sem RA no iPhone no teu site   | Falta USDZ ou tipo de conteúdo correto                         | Acrescenta USDZ como `model/vnd.usdz+zip`, exigido pelo [Safari](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) |
| Peça enorme ou minúscula em RA | Dimensões no ficheiro sem medição                              | Escreve medidas no texto; o comprador pode redimensionar                                                                                           |
| Peça suspensa                  | Base acima da origem                                           | Move a origem para a base no Blender                                                                                                               |
| Página lenta com dados móveis  | Texturas de 4096 píxeis ou geometria sem compressão            | Usa 2048 ou 1024 e Draco ou Meshopt onde suportado                                                                                                 |
| Modelo escuro ou sujo em RA    | Sombras gravadas na textura, desaconselhadas pelo Scene Viewer | Usa textura sem sombras e Metallic a 0 se omisso                                                                                                   |
| GLB não abre no Scene Viewer   | Extensão não listada, como WebP                                | Exporta versão simples com PNG ou JPEG                                                                                                             |

## Quais são os limites do 3D para ecommerce?

Uma fotografia permite representar forma e materiais, mas não fornece medidas. Mantém dimensões na descrição e usa a RA para observar o aspeto da peça.

Vidro e cromados mostram reflexos em vez da superfície, dificultando vários métodos. Para mostrar texto e logótipos pequenos, precisas de fotografias tiradas de perto que registem o detalhe.

O 3D não substitui as fotografias usadas em pesquisas, anúncios e grelhas. Continuam a aplicar-se as bases de [fotografia de produto](/pt/guias/fotografia-de-produto-para-ecommerce).

## FAQ

### Precisas de modelos 3D para toda a loja?

Não: ajudam sobretudo onde o comprador quer ver profundidade e costas, como cadeiras, sofás, aparadores e candeeiros. Para objetos planos ou simples, boas fotografias chegam; começa com poucos produtos que geram pedidos de outras vistas e avalia o resultado antes de converter o catálogo inteiro de uma vez.

### De que formatos 3D precisa uma loja online?

Normalmente dois: GLB para web e RA Android, USDZ para AR Quick Look no iPhone e iPad. A Shopify aceita ambos e cria as duas versões; se a tua ferramenta só fornece uma, podes converter com Reality Converter da Apple no Mac ou com o Blender.

### Que tamanho deve ter um modelo 3D de produto?

Deve carregar bem num telemóvel com dados móveis. Scene Viewer recomenda até 10 MB, 100.000 triângulos e texturas de 2048 píxeis, idealmente 30.000 a 50.000 triângulos; a Shopify aceita até 500 MB e otimiza acima de 15 MB, mas um ficheiro menor continua a carregar mais depressa.

### Quanto custa um modelo 3D para ecommerce?

Depende do método: os profissionais dão orçamento, as aplicações de digitalização cobram frequentemente uma subscrição e as ferramentas de IA cobram por modelo ou por mês. No easyrender a pré-visualização é gratuita e um modelo concluído custa {{renderCredits}} créditos ({{renderPrice}}); podes comprar créditos avulsos ou receber {{proCredits}} por mês no Pro por {{proPrice}}, conforme o plano escolhido.

### Que dimensões mostra um produto em realidade aumentada?

Em telemóveis compatíveis podes vê-lo com USDZ no AR Quick Look ou GLB no Scene Viewer. As dimensões dependem dos valores guardados no ficheiro: uma foto não contém medidas da peça, por isso a RA mostra o aspeto e a descrição continua a ser a referência para largura, profundidade e altura.
