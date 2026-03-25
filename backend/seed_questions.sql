-- Seed Love Map Questions (quiz_questions)
INSERT INTO quiz_questions (question_text, category) VALUES
('Qual é o nome do(a) melhor amigo(a) do seu parceiro(a)?', 'Amizade'),
('Quais são as três coisas de que seu parceiro(a) mais se orgulha?', 'Admiração'),
('Qual é a comida favorita do seu parceiro(a)?', 'Gostos Pessoais'),
('Qual é o maior medo do seu parceiro(a)?', 'Vulnerabilidade'),
('Qual é o sonho de infância do seu parceiro(a)?', 'Sonhos'),
('O que deixaria seu parceiro(a) mais feliz em um dia comum?', 'Felicidade'),
('Quem é o maior herói ou inspiração do seu parceiro(a)?', 'Valores'),
('Como seu parceiro(a) gosta de ser confortado(a) quando está triste?', 'Apoio'),
('Se seu parceiro(a) pudesse viajar para qualquer lugar agora, para onde iria?', 'Aventura'),
('Qual é a música ou banda favorita do seu parceiro(a)?', 'Entretenimento')
ON CONFLICT DO NOTHING;

-- Seed Personality Questions (personality_questions) - Case they are missing or to ensure count
INSERT INTO personality_questions (question_text, category) VALUES
('Qual o seu maior desafio atual no campo emocional?', 'Autoconhecimento'),
('Como você descreveria o seu dia ideal ao lado de quem ama?', 'Desejos'),
('O que é inegociável para você em um relacionamento?', 'Valores'),
('Como você costuma reagir a surpresas positivas?', 'Temperamento'),
('Qual a sua lembrança mais feliz de infância?', 'Histórico')
ON CONFLICT (question_text) DO NOTHING;
