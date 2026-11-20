export default {
  // Navigation & layout
  nav_home: 'Home',
  nav_tracks: 'Tracks',
  nav_leaderboard: 'Leaderboard',
  nav_notebook: 'Notebook',
  nav_octocoreos: 'OctoCoreOS',
  nav_hacking: 'Hacking',
  nav_settings: 'Settings',
  nav_profile: 'Profile',

  // Placement test
  placement_test_title: 'Placement Test',
  placement_test_desc: 'Answer 5 questions to find your starting rank.',
  question: 'Question',
  of: 'of',
  skip_question: 'Skip',
  submit_answer: 'Submit',
  correct: 'Correct!',
  incorrect: 'Not quite. Try again next time.',
  rank_assigned: 'Your rank is',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  xp_earned: 'XP earned',
  continue_learning: 'Continue Learning',

  // Logic track keywords — International Standard Pseudocode (used for en and all non-pt-BR locales)
  logic_top_bar_title: 'Programming Logic',
  logic_description: 'Learn the foundations of programming logic with International Standard Pseudocode.',
  pseudocode_keywords_intro: 'This track uses standard keywords:',
  pseudocode_keywords: 'IF / ELSE, WHILE, FOR, PRINT, INPUT',
  pseudocode_example: 'Example:',
  pseudocode_example_code: 'IF score >= 70 THEN\n  PRINT "Pass"\nELSE\n  PRINT "Try Again"\nEND IF',
  logic_unit_title: 'Unit 1 — Logic',
  logic_unit_description: 'Variables, conditions, loops, and functions.',

  // Commands & syntax hints shown in the UI
  hint_if: 'IF',
  hint_else: 'ELSE',
  hint_while: 'WHILE',
  hint_for: 'FOR',
  hint_print: 'PRINT',
  hint_input: 'INPUT',

  // Leaderboard
  leaderboard_title: 'Leaderboard',
  leaderboard_empty: 'No entries yet. Be the first!',
  leaderboard_no_internet: 'Offline — leaderboard updates when you reconnect.',

  // OctoCoreOS
  octocoreos_title: 'OctoCoreOS',
  octocoreos_desc: 'A POSIX-compatible Linux console for learning and experimentation.',
  octofetch_title: 'octofetch',
  octofetch_os_line: 'OS: OctoCoreOS 1.0',
  terminal_title: 'Terminal',
  terminal_prompt: 'octo@octocoreos:~$ ',

  // Hacking
  hacking_title: 'Ethical Hacking',
  hacking_desc: 'Learn hacking concepts, tools, and safe practice.',
  hacking_info: 'Educational content only. Always use skills ethically.',

  // Notebook
  notebook_title: 'Notebook',
  notebook_empty: 'Your notes will appear here.',
  notebook_hint: 'Type a note and save it.',

  // Settings / language selector
  settings_title: 'Settings',
  settings_language: 'Language',
  lang_en: 'English',
  lang_pt: 'Português (Brasil)',
  settings_theme: 'Theme',
  theme_system: 'System',
  theme_light: 'Light',
  theme_dark: 'Dark',
  settings_about: 'About',

  // Mascot / OctoAI
  mascot_peek_title: 'OctoAI',
  mascot_peek_hint: 'Tap the mascot to chat with OctoAI.',
  octoai_title: 'OctoAI Chat',
  octoai_placeholder: 'Ask me anything about programming...',
  octoai_offline: 'OctoAI is offline. Connect to use it.',

  // Offline & sync
  offline_mode: 'Offline mode',
  sync_pending: 'Progress saved locally. Syncs when online.',
  sync_complete: 'Sync complete.',

  // Errors & empty states
  error_generic: 'Something went wrong. Please try again.',
  error_not_available: 'Not available right now.',
  empty_state_title: 'Nothing here yet',
  empty_state_body: 'Start learning to see content here.',

  // Generic UI
  loading: 'Loading...',
  retry: 'Retry',
  close: 'Close',
  confirm: 'Confirm',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  done: 'Done',
} as const;
