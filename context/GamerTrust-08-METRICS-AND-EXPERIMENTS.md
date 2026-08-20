# GamerTrust - Métricas e experimentos de produto

## North star metric

### Transações protegidas concluídas sem contestação relevante

Essa métrica combina valor para comprador, vendedor e plataforma. Ela evita otimizar apenas anúncios, visitas ou pagamentos iniciados.

Deve ser acompanhada por:

- quantidade de compradores e vendedores únicos;
- valor total transacionado;
- satisfação dos dois lados;
- repetição de compra e venda.

## Métricas de saúde do marketplace

### Oferta

- Novos anúncios por semana.
- Percentual de anúncios que concluem verificação.
- Anúncios ativos por categoria e região.
- Qualidade e completude do anúncio.
- Concentração de ofertas por vendedor.
- Produtos com demanda e pouca oferta.

### Demanda

- Compradores ativos.
- Pesquisas por categoria.
- Favoritos e alertas.
- Usuários que retornam.
- Intenção de compra por sessão.

### Liquidez

- Percentual de anúncios vendidos em 7, 30 e 60 dias.
- Tempo até primeira visualização qualificada.
- Tempo até primeiro favorito ou oferta.
- Tempo até venda.
- Razão entre compradores interessados e ofertas disponíveis.

### Confiança

- Anúncios reprovados ou corrigidos.
- Fraude detectada antes da publicação.
- Divergência entre anúncio e item recebido.
- Transações sem problema.
- Contestações e seus motivos.
- Compreensão dos selos.
- Evolução do TrustScore.

## Funil principal

### Vendedor

1. Inicia anúncio.
2. Identifica produto.
3. Completa informações.
4. Define preço.
5. Inicia evidências.
6. Conclui evidências.
7. Envia para revisão.
8. Recebe aprovação.
9. Publica.
10. Recebe interesse.
11. Conclui venda.

### Comprador

1. Abre o produto.
2. Pesquisa ou navega.
3. Visualiza resultado.
4. Abre produto ou oferta.
5. Compara ou favorita.
6. Faz oferta ou inicia compra.
7. Confirma pagamento.
8. Recebe produto.
9. Conclui transação.
10. Avalia.

## Métricas da busca

- Pesquisas com resultados úteis.
- Resultado zero.
- Correção aceita ou desfeita.
- Clique em produto ou oferta.
- Tempo até primeiro clique útil.
- Reformulação.
- Uso de filtros.
- Busca que gera favorito.
- Busca que gera oferta.
- Busca que gera compra.
- Diversidade de vendedores e ofertas.
- Satisfação declarada.

## Metas iniciais de aprendizagem

Valores abaixo são hipóteses, não compromissos definitivos.

| Métrica | Referência inicial |
| --- | --- |
| Conclusão das evidências iniciadas | Acima de 65% |
| Aprovação na primeira tentativa | Acima de 70% |
| Busca sem resultado útil | Abaixo de 10% |
| Abertura de resultado após busca | Acima de 35% |
| Busca com ação de valor | Acima de 12% |
| Transação concluída sem disputa | Acima de 97% |
| Avaliação após compra | Acima de 30% |
| Recompra ou nova venda em 90 dias | Acima de 20% |

As metas devem ser segmentadas por categoria, região, canal, faixa de preço e maturidade do usuário.

## Métricas que não devem ser usadas isoladamente

- Número de cadastros.
- Total de anúncios.
- Visualizações.
- Tempo dentro do aplicativo.
- Cliques em recomendações.
- Volume transacionado sem considerar disputa.

Otimizar apenas essas métricas pode aumentar quantidade e reduzir confiança.

## Experimentos prioritários

### 1. Resultados agrupados versus anúncios individuais

Hipótese: agrupar ofertas pelo mesmo modelo reduz repetição e acelera a comparação.

Medir:

- abertura de resultado;
- uso de comparação;
- tempo até ação;
- compra;
- satisfação.

### 2. Selos específicos versus selo genérico

Hipótese: “Posse verificada” e “Funcionamento revisado” geram mais compreensão do que “Produto verificado”.

Medir:

- entendimento;
- confiança;
- intenção de compra;
- contestação por expectativa incorreta.

### 3. Oferta recomendada explicada

Hipótese: mostrar por que uma oferta foi recomendada aumenta confiança e reduz escolha baseada apenas no menor preço.

Medir:

- seleção da oferta;
- visualização de outras ofertas;
- conversão;
- contestação;
- percepção de neutralidade.

### 4. Roteiro visual de evidências

Hipótese: exemplos visuais e validação durante a captura reduzem abandono e reenvio.

Medir:

- conclusão;
- tempo;
- correções;
- aprovação inicial.

### 5. Faixa de preço explicada

Hipótese: apresentar faixa e fatores melhora precificação sem gerar sensação de imposição.

Medir:

- preço escolhido;
- tempo até venda;
- alterações posteriores;
- satisfação do vendedor.

### 6. Tela de resultado zero com alerta

Hipótese: permitir alerta preserva demanda que seria perdida.

Medir:

- alertas criados;
- retorno após notificação;
- compra futura;
- cancelamento de alerta.

### 7. Busca por necessidade

Hipótese: consultas como “placa para 1440p” aproximam compradores menos técnicos de produtos adequados.

Medir:

- conclusão da busca;
- comparação;
- compra;
- devolução ou contestação por incompatibilidade.

## Regras de experimentação

- Não reduzir proteção para aumentar conversão.
- Não esconder informação relevante entre variantes.
- Não experimentar linguagem enganosa sobre verificação.
- Medir efeitos sobre comprador e vendedor.
- Segmentar resultados para identificar prejuízo a vendedores novos.
- Definir antecipadamente a métrica principal e os limites de segurança.
- Encerrar o experimento quando houver risco de prejuízo ou quebra de confiança.

## Painéis de decisão

### Visão executiva

- Transações protegidas concluídas.
- Liquidez por categoria.
- Receita e valor transacionado.
- Fraude e contestação.
- Retenção de compradores e vendedores.

### Visão de busca

- Resultado zero.
- Abertura e ação após busca.
- Termos em crescimento.
- Consultas com baixa satisfação.
- Filtros mais usados.
- Produtos demandados sem oferta.

### Visão de confiança

- Funil de evidências.
- Motivos de correção.
- Tempo de revisão.
- Divergência após compra.
- Selos e sua relação com conversão.

### Visão de vendedores

- Tempo até venda.
- Qualidade dos anúncios.
- Competitividade de preço.
- Evolução do TrustScore.
- Concentração de visibilidade.
