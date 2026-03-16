let _gameStarted = false;

// #5 : les didascalies/narrateur s'affichent avec accolades et italique
// On passe isThought=true et on entoure le texte d'accolades
async function say(speaker, text, isThought=false){
  const displayText = isThought ? '{ ' + text + ' }' : text;
  showDialogue(speaker, displayText, isThought);
  await waitContinue();
}

async function showAct(n){
  await fadeOut(500);
  const ov=document.getElementById('act-overlay'), tx=document.getElementById('act-title-text');
  tx.textContent='Acte '+['I','II','III','IV'][n-1];
  ov.style.opacity='1'; ov.classList.add('active');
  await sleep(1800);
  ov.style.opacity='0'; ov.classList.remove('active');
  await sleep(600);
  await fadeIn(400);
}

async function runGame(){
  sceneEl.classList.remove('visible');
  stageHideAll();

  // ── ACTE I ──────────────────────────────────────────────────────
  await showAct(1);
  setProgress(5);
  // #10 : fond apparaît APRÈS l'écran d'acte, avec transition fluide
  await setBgScene('hospital');
  playMusicAmbiance();
  await showLocation('CHUV — Chambre 214', '18 : 09');

  SCENE_CAST = {
    'Marc':   { slot:'left',  key:'marc' },
    'Thomas': { slot:'right', key:'thomas' }
  };
  stageShow('left','marc');
  stageShow('right','thomas');
  stageActivate('left');

  await say('Marc',   'Demain matin, sept heures. On aura la salle deux. C\'est la meilleure lumière.');
  await say('Thomas', 'Vous avez dit ça la dernière fois aussi. Avant l\'appendicite de ma fille.');
  await say('Marc',   'Et ça s\'était bien passé.');
  await say('Thomas', 'Oui.');
  await say(null, 'Un silence. Thomas regardait par la fenêtre. Dehors, le ciel de mai palissait doucement.', true);
  await say('Thomas', 'Docteur Renard… si quelque chose tourne mal demain. Ma femme—');
  await say('Marc',   'Thomas.');
  await say('Thomas', 'Laissez-moi finir. Mes enfants ont sept et dix ans. Emma ne sait pas encore conduire. Je voudrais que vous sachiez que—');
  await say('Marc',   'Thomas, arrêtez. Je vous connais depuis six ans. J\'ai vu vos résultats, vos IRM, vos analyses. Et je vous dis : vous allez rentrer chez vous.');
  await say('Thomas', 'Vous pouvez me le promettre ?');
  await say(null, 'Marc hésita. Pas longtemps. Juste assez pour être honnête.', true);
  await say('Marc',   'Je peux vous promettre que je ferai tout ce qui est en mon pouvoir. Et que mon pouvoir est considérable.');
  await say('Thomas', '… Ça me suffit.');
  await say('Marc',   'Dormez. Vous aurez besoin de toutes vos forces.');
  await say('Thomas', 'Et vous ?');
  await say('Marc',   'Moi j\'ai besoin d\'un café.');
  await say(null, 'Thomas sourit pour la première fois depuis des semaines.', true);
  setProgress(18);

  // ── ACTE II ─────────────────────────────────────────────────────
  await fadeOut(800);
  stageHideAll();
  await sleep(200);
  await showAct(2);
  setProgress(28);
  await setBgScene('apartment');
  await fadeIn(600);
  await showLocation('Appartement de Marc', '00 : 23');

  SCENE_CAST = {
    'Marc':  { slot:'left',  key:'marc' },
    'Lucas': { slot:'right', key:'lucas' }
  };
  stageShow('left','marc');
  stageHide('right');
  stageActivate('left');

  await say(null, 'La bibliothèque. Les braises. Les dossiers éparpillés sur la table basse. Marc n\'avait pas dormi.', true);
  await say(null, 'Il y avait une photo encadrée sur l\'étagère — une femme souriante, des cheveux châtains, les yeux fermés face au soleil. Quatre ans.', true);
  await say(null, 'Thomas. L\'opération. Les risques. Ses mains. Étaient-elles encore assez sûres ?', true);
  await say('Marc', '… Douze heures. Peut-être treize si on rencontre des complications vasculaires.');
  await say(null, 'Il ferma les yeux. Il pensa à Lucas endormi dans sa chambre. Ce fils qu\'il voyait si peu. Ce fils qui ne se plaignait jamais.', true);

  stageShow('right','lucas');
  stageActivate('right');

  await say('Lucas', 'Papa ?');
  await say('Marc',  'Lucas… Il est passé minuit. Qu\'est-ce que tu fais debout ?');
  await say('Lucas', 'Je sais pas. Je dormais pas.');
  await say('Marc',  'Tu as fait un cauchemar ?');
  await say('Lucas', 'Non. Je pensais au monsieur de l\'hôpital.');
  await say('Marc',  'Thomas ?');
  await say('Lucas', 'Celui à qui tu dois faire l\'opération demain. Tu m\'en avais parlé une fois. Que c\'était compliqué.');
  await say('Marc',  'Tu te souviens de ça ?');
  await say('Lucas', 'Tu avais l\'air inquiet. C\'est la seule fois que je t\'ai vu comme ça.');
  await say(null, 'Marc posa ses dossiers. Il regarda son fils — ces yeux trop grands, trop attentifs pour un enfant de neuf ans.', true);
  await say('Marc',  'Viens là.');
  await say('Lucas', 'Il a des enfants, le monsieur ?');
  await say('Marc',  'Deux. Un peu plus grands que toi.');
  await say('Lucas', 'Alors tu dois le sauver. Pour eux.');
  await say('Marc',  'Je vais essayer, mon grand.');
  await say('Lucas', 'Non. Tu vas réussir. Parce que tu es le meilleur docteur du monde.');
  await say(null, 'Marc ne répondit pas. Il serra son fils contre lui.', true);
  await say('Lucas', 'Et le meilleur papa du monde.');
  await say(null, 'Ils restèrent longtemps comme ça. Le feu finissait de mourir dans la cheminée.', true);
  setProgress(40);

  // ── ACTE III ────────────────────────────────────────────────────
  await fadeOut(800);
  stageHideAll();
  await sleep(200);
  await showAct(3);
  setProgress(45);
  await setBgScene('or');
  playMusicTension();
  await fadeIn(600);
  await showLocation('CHUV — Bloc opératoire n°2', '15 : 37');

  SCENE_CAST = {
    'Marc':    { slot:'left',  key:'marc_masque' },
    'Antoine': { slot:'right', key:'antoine_masque' }
  };
  stageShow('left','marc_masque');
  stageShow('right','antoine_masque');
  stageActivate('left');

  await say('Marc',    'Antoine. Dossier de Favre. Tu l\'as relu ce matin ?');
  await say('Antoine', 'Trois fois. L\'angulation de l\'aorte descendante… c\'est du jamais vu. Comment vous comptez aborder la bifurcation ?');
  await say('Marc',    'Par voie postéro-latérale gauche. On limitera l\'exposition du plexus. Ça rallongera l\'intervention, mais c\'est plus sûr.');
  await say('Antoine', 'Je n\'aurais pas pensé à ça.');
  await say('Marc',    'Dans dix ans, si. C\'est pour ça que tu es là aujourd\'hui — pour voir. Pour apprendre. Pas seulement à opérer, mais à décider.');
  await say('Antoine', 'Je me rends compte que je suis très loin d\'être prêt pour ce niveau.');
  await say('Marc',    'Tout le monde l\'est, la première fois. L\'important c\'est de ne pas faire semblant de l\'être.');
  await say('Antoine', 'Ce patient… il compte beaucoup pour vous, n\'est-ce pas ?');
  await say(null, 'Marc ajusta ses gants. Un geste qu\'il avait fait des milliers de fois.', true);
  await say('Marc',    'Ils comptent tous. Mais oui. Celui-là, particulièrement.');
  await say('Antoine', 'On y va ?');
  await say('Marc',    'On prépare le champ opératoire. Ensuite on y va.');
  setProgress(50);

  sceneEl.classList.remove('visible');
  await sleep(400);

  // Mini-jeu 1 : cercles
  let mg1result;
  do {
    mg1result = await runMG_circles({
      total: 10, maxErrors: 3,
      title: 'Préparer le champ opératoire',
      subtitle: 'Cliquez sur chaque point avant la fermeture du cercle',
      speed: 2.8, maxActive: 2,
      failMessage: 'Le champ opératoire doit être préparé avec méthode.\nConcentrez-vous et recommencez.',
    });
  } while(mg1result === false);

  await fadeIn(400);
  stageShow('left','marc_masque');
  stageShow('right','antoine_masque');
  stageActivate('left');
  sceneEl.classList.add('visible');

  await say('Marc',    'Bien. On commence.');
  await say(null, 'Huit heures de silence chirurgical. Chaque geste mesuré. Chaque décision pesée.', true);
  await say('Antoine', 'Docteur Renard — les paramètres vitaux changent. Pression artérielle en baisse.');
  await say('Marc',    'Je vois. Augmentez la perfusion. Préparez une unité de sang O négatif.');
  setProgress(60);

  sceneEl.classList.remove('visible');
  await sleep(400);

  // Mini-jeu 2 : sutures
  let mg2result;
  do {
    mg2result = await runMG_traces({
      total: 12, maxErrors: 3,
      title: 'Suture vasculaire',
      subtitle: 'Tracez chaque incision avec précision',
      fast: false, maxSim: 2,
      failMessage: 'Une précision chirurgicale est exigée.\nChaque suture compte. Recommencez.',
    });
  } while(mg2result === false);

  await fadeIn(400);
  stageShow('left','marc_masque');
  stageShow('right','antoine_masque');
  stageActivate('left');
  sceneEl.classList.add('visible');

  await say('Antoine', 'C\'est… incroyable. Comment vous saviez que c\'était là ?');
  await say('Marc',    'Je ne savais pas. Je sentais.');
  await say(null, 'Onze heures quarante-deux. L\'anévrisme était isolé. La suture, parfaite.', true);
  setProgress(72);

  await say('Marc',    'Antoine. Tu fermes.');
  await say('Antoine', 'Moi ?');
  await say('Marc',    'Tu as regardé pendant onze heures. Maintenant tu fais. Je suis là.');
  await say(null, 'Antoine prit l\'aiguille. Ses mains tremblaient légèrement. Puis elles s\'arrêtèrent.', true);
  setProgress(78);

  sceneEl.classList.remove('visible');
  await sleep(400);

  // Mini-jeu 3 : fermeture Antoine
  let mg3result;
  do {
    mg3result = await runMG_traces({
      total: 8, maxErrors: 4,
      title: 'Fermeture — Antoine',
      subtitle: 'Guidez Antoine dans la fermeture',
      fast: false, maxSim: 1,
      failMessage: 'La fermeture doit être irréprochable.\nGuidez Antoine avec patience. Recommencez.',
    });
  } while(mg3result === false);

  await fadeIn(400);
  stageShow('left','marc_masque');
  stageShow('right','antoine_masque');
  stageActivate('right');
  sceneEl.classList.add('visible');

  await say('Antoine', 'C\'est fait.');
  await say('Marc',    'C\'est fait.');
  await say(null, 'Ils se regardèrent par-dessus leurs masques. Quelque chose venait de changer.', true);
  setProgress(85);

  // ── ACTE IV ─────────────────────────────────────────────────────
  await fadeOut(800);
  stageHideAll();
  await sleep(200);
  await showAct(4);
  setProgress(88);
  await setBgScene('hospital');
  playMusicAmbiance();
  await fadeIn(600);
  await showLocation('CHUV — Couloir', '03 : 14');

  SCENE_CAST = { 'Marc': { slot:'left', key:'marc' } };
  stageShow('left','marc');
  stageActivate('left');

  await say(null, 'Le couloir. Le silence de nuit. Les néons qui bourdonnaient.', true);
  await say(null, 'Marc s\'arrêta devant la fenêtre. Dehors, la ville dormait.', true);
  await say('Marc', 'Thomas.');

  playMusicTension();
  sceneEl.classList.remove('visible');
  await sleep(400);

  const choix = await showChoice({
    duration: 15,
    fast: false,
    allowRandom: false,
    left:  { label: 'Aller voir Thomas en salle de réveil', sub: 'lui dire que c\'est fini' },
    right: { label: 'Rentrer chez Lucas',                   sub: 'tenir sa promesse de père' },
  });

  playMusicAmbiance();
  await fadeIn(400);
  stageShow('left','marc');
  stageActivate('left');
  sceneEl.classList.add('visible');

  if(choix === 'left'){
    await say(null, 'La salle de réveil. Thomas dormait encore, les yeux clos, le visage apaisé.', true);
    await say('Marc',   'Thomas. C\'est fini. Vous rentrez chez vous.');
    await say(null, 'Thomas ouvrit les yeux. Il chercha le visage de Marc. Il sourit.', true);
    await say('Thomas', '… Emma va pouvoir apprendre à conduire.');
    await say('Marc',   'Elle a tout son temps.');
    await say(null, 'Marc resta là quelques minutes. Juste pour être sûr.', true);
  } else if(choix === 'right'){
    await say(null, 'L\'appartement. Les lumières éteintes. La maison silencieuse.', true);
    await say(null, 'Lucas était endormi sur le canapé, un livre sur les genoux. Il avait attendu.', true);
    await say('Marc',  'Lucas.');
    await say('Lucas', 'Papa… c\'est bon ?');
    await say('Marc',  'C\'est bon. Il rentre chez lui.');
    await say('Lucas', 'Je savais.');
    await say(null, 'Marc s\'assit à côté de son fils. Pour la première fois depuis longtemps, il ne pensa à rien.', true);
  } else {
    await say(null, 'Il resta là, dans le couloir. Entre deux mondes.', true);
    await say(null, 'Certaines nuits, il n\'y a pas de bonne direction. Juste l\'instant présent.', true);
    await say('Marc', '… Merci.', true);
  }

  setProgress(100);
  await fadeOut(800);
  stageHideAll();
  await sleep(500);

  const endLines = choix === 'left' ? [
    'Thomas Favre rentra chez lui douze jours plus tard.',
    'Emma passa son permis de conduire en juin.',
    'Marc Renard continua d\'opérer.',
    'Il n\'en parla jamais.',
  ] : choix === 'right' ? [
    'Thomas Favre rentra chez lui douze jours plus tard.',
    'Lucas Renard n\'oublia jamais cette nuit-là.',
    'Marc Renard continua d\'opérer.',
    'Il rentra plus tôt, les autres soirs.',
  ] : [
    'Thomas Favre rentra chez lui douze jours plus tard.',
    'Marc Renard resta longtemps dans ce couloir.',
    'Certaines décisions n\'ont pas de nom.',
    'Elles existent quand même.',
  ];

  await showEndScreen(endLines);
}

async function startGame(){
  if(_gameStarted) return;
  _gameStarted = true;

  // Créer AudioContext pour les sons mini-jeux
  AC = new (window.AudioContext || window.webkitAudioContext)();
  window._actx = AC;

  // Initialiser les éléments audio MP3
  initMusic();

  // #2 : musique démarre dès l'écran d'accueil (fond hôpital visible depuis splash)
  await setBgScene('hospital');
  playMusicAmbiance();

  const splash = document.getElementById('splash-screen');
  splash.classList.add('hiding');
  await sleep(900);
  splash.style.display = 'none';

  await runGame();
}

function restartGame(){
  _gameStarted = false;
  document.getElementById('end-screen').classList.remove('active');
  document.getElementById('credits-screen').classList.remove('active');
  stopMusic();
  startGame();
}

document.getElementById('splash-btn').addEventListener('click', startGame);
