export default {
  // Navigation & layout
  nav_home: 'Início',
  nav_tracks: 'Trilhas',
  nav_leaderboard: 'Classificação',
  nav_notebook: 'Caderno',
  nav_octocoreos: 'OctoCoreOS',
  nav_hacking: 'Hacking',
  nav_settings: 'Configurações',
  nav_profile: 'Perfil',

  // Placement test
  placement_test_title: 'Teste de Colocação',
  placement_test_desc: 'Responda 5 perguntas para descobrir seu nível inicial.',
  question: 'Pergunta',
  of: 'de',
  skip_question: 'Pular',
  submit_answer: 'Enviar',
  correct: 'Correto!',
  incorrect: 'Não foi dessa vez. Tente de novo mais tarde.',
  rank_assigned: 'Seu nível é',
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  xp_earned: 'XP conquistados',
  continue_learning: 'Continuar Aprendendo',

  // Logic track keywords — Portugol (used ONLY when language == pt-BR)
  logic_top_bar_title: 'Lógica de Programação',
  logic_description: 'Aprenda os fundamentos da lógica de programação com Portugol.',
  pseudocode_keywords_intro: 'Esta trilha usa as palavras-chave:',
  pseudocode_keywords: 'se / senao, enquanto, para, escreva, leia',
  pseudocode_example: 'Exemplo:',
  pseudocode_example_code: 'se pontuacao >= 70 entao\n  escreva "Aprovado"\nsenao\n  escreva "Tente Novamente"\nfimse',
  logic_unit_title: 'Unidade 1 — Lógica',
  logic_unit_description: 'Variáveis, condicionais, loops e funções.',

  // Commands & syntax hints shown in the UI
  hint_if: 'se',
  hint_else: 'senao',
  hint_while: 'enquanto',
  hint_for: 'para',
  hint_print: 'escreva',
  hint_input: 'leia',

  // Leaderboard
  leaderboard_title: 'Classificação',
  leaderboard_empty: 'Nenhuma entrada ainda. Seja o primeiro!',
  leaderboard_no_internet: 'Offline — a classificação é atualizada quando você reconectar.',

  // OctoCoreOS
  octocoreos_title: 'OctoCoreOS',
  octocoreos_desc: 'Um console Linux compatível com POSIX para aprendizado e experimentação.',
  octofetch_title: 'octofetch',
  octofetch_os_line: 'SO: OctoCoreOS 1.0',
  terminal_title: 'Terminal',
  terminal_prompt: 'octo@octocoreos:~$ ',

  // Hacking
  hacking_title: 'Hacking Ético',
  hacking_desc: 'Aprenda conceitos, ferramentas e prática segura de hacking.',
  hacking_info: 'Conteúdo apenas educacional. Use sempre o conhecimento de forma ética.',

  // Notebook
  notebook_title: 'Caderno',
  notebook_empty: 'Suas anotações aparecerão aqui.',
  notebook_hint: 'Digite uma nota e salve.',

  // Settings / language selector
  settings_title: 'Configurações',
  settings_language: 'Idioma',
  lang_en: 'English',
  lang_pt: 'Português (Brasil)',
  settings_theme: 'Tema',
  theme_system: 'Sistema',
  theme_light: 'Claro',
  theme_dark: 'Escuro',
  settings_about: 'Sobre',

  // Mascot / OctoAI
  mascot_peek_title: 'OctoAI',
  mascot_peek_hint: 'Toque no mascote para conversar com o OctoAI.',
  octoai_title: 'Chat do OctoAI',
  octoai_placeholder: 'Me pergunte qualquer coisa sobre programação...',
  octoai_offline: 'OctoAI está offline. Conecte-se para usá-lo.',

  // Offline & sync
  offline_mode: 'Modo offline',
  sync_pending: 'Progresso salvo localmente. Sincroniza quando online.',
  sync_complete: 'Sincronização concluída.',

  // Errors & empty states
  error_generic: 'Algo deu errado. Tente novamente.',
  error_not_available: 'Não disponível agora.',
  empty_state_title: 'Nada aqui ainda',
  empty_state_body: 'Comece a aprender para ver conteúdo aqui.',

  // Generic UI
  loading: 'Carregando...',
  retry: 'Tentar novamente',
  close: 'Fechar',
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  save: 'Salvar',
  delete: 'Excluir',
  edit: 'Editar',
  done: 'Concluído',
} as const;
