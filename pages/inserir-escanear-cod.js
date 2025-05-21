import { supabase, getLoggedUserId } from '../app.js';

window.handleAddPoints = async function (codigo) {
  console.log('handleAddPoints chamado com código:', codigo);
  const userId = getLoggedUserId();
  if (!userId) {
    window.showModal('Usuário não autenticado. Faça login novamente.');
    return;
  }

  // Busca o registro do código na tabela add_pontos
  const { data, error } = await supabase
    .from('add_pontos')
    .select('*')
    .eq('id', codigo)
    .eq('usado', false)
    .single();

  if (error || !data) {
    window.showModal('Código inválido, inexistente ou já utilizado.');
    return;
  }

  // Realiza o UPDATE
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('add_pontos')
    .update({ data_uso: now, usuario_utilizador: userId })
    .eq('id', codigo)
    .eq('usado', false);

  if (updateError) {
    window.showModal('Erro ao adicionar pontos. Tente novamente.');
    return;
  }

  // Sucesso: exibe mensagem e força atualização do saldo/histórico
  window.showModal('Pontos adicionados com sucesso!');
  // Opcional: recarregar saldo/histórico se função global existir
  if (typeof atualizarHistoricoPontos === 'function') atualizarHistoricoPontos(userId);
  if (typeof carregarExtrato === 'function') carregarExtrato();
}; 