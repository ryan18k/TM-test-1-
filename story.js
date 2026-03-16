let _gameStarted = false;

// say() : isThought=true → indication scénique avec guillemets, italique, pas de personnage
async function say(speaker, text, isThought=false){
  const display = isThought ? '\u00AB\u00A0' + text + '\u00A0\u00BB' : text;
  showDialogue(speaker, display, isThought);
  await waitContinue();
}

async function runGame(){
  sceneEl.classList.remove('visible');
  stageHideAll();

  // ── ACTE I ──────────────────────────────────────────────────────
  await showAct(1,'hospital');
  setProgress(5);
  playMusicAmbiance();
  await showLocation('CHUV — Chambre 214', '18 : 09');

  SCENE_CAST = {
    'Claude': { key:'claude' },
    'Gérard': { key:'gerard' },
  };

  await say('Claude', 'Demain matin, sept heures. On aura la salle deux. C\'est la meilleure lumière.');
  await say('Gérard', 'Vous avez dit ça la dernière fois aussi. Avant l\'appendicite de ma fille.');
  await say('Claude', 'Et ça s\'était bien passé.');
  await say('Gérard', 'Oui.');
  await say(null, 'Un silence. Gérard regardait par la fenêtre. Dehors, le ciel de mai palissait doucement.', true);
  await say('Gérard', 'Docteur Renard… si quelque chose tourne mal demain. Ma femme—');
  await say('Claude', 'Gérard.');
  await say('Gérard', 'Laissez-moi finir. Mes enfants ont sept et dix ans. Emma ne sait pas encore conduire. Je voudrais que vous sachiez que—');
  await say('Claude', 'Gérard, arrêtez. Je vous connais depuis six ans. J\'ai vu vos résultats, vos IRM, vos analyses. Et je vous dis : vous allez rentrer chez vous.');
  await say('Gérard', 'Vous pouvez me le promettre ?');
  await say(null, 'Claude hésita. Pas longtemps. Juste assez pour être honnête.', true);
  await say('Claude', 'Je peux vous promettre que je ferai tout ce qui est en mon pouvoir. Et que mon pouvoir est considérable.');
  await say('Gérard', '… Ça me suffit.');
  await say('Claude', 'Dormez. Vous aurez besoin de toutes vos forces.');
  await say('Gérard', 'Et vous ?');
  await say('Claude', 'Moi j\'ai besoin d\'un café.');
  await say(null, 'Gérard sourit pour la première fois depuis des semaines.', true);
  setProgress(18);

  // ── ACTE II ─────────────────────────────────────────────────────
  await fadeOut(800);
  stageHideAll();
  await sleep(200);
  await showAct(2,'apartment');
  setProgress(28);
  await showLocation('Appartement de Claude', '00 : 23');

  SCENE_CAST = {
    'Claude': { key:'claude' },
    'Lucas':  { key:'lucas' },
  };

  await say(null, 'La bibliothèque. Les braises. Les dossiers éparpillés sur la table basse. Claude n\'avait pas dormi.', true);
  await say(null, 'Il y avait une photo encadrée sur l\'étagère — une femme souriante, les yeux fermés face au soleil. Quatre ans déjà.', true);
  await say(null, 'Gérard. L\'opération. Les risques. Ses mains. Étaient-elles encore assez sûres ?', true);
  await say('Claude', '… Douze heures. Peut-être treize si on rencontre des complications vasculaires.');
  await say(null, 'Il ferma les yeux. Il pensa à Lucas endormi dans sa chambre. Ce fils qu\'il voyait si peu.', true);
  await say('Lucas', 'Papa ?');
  await say('Claude', 'Lucas… Il est passé minuit. Qu\'est-ce que tu fais debout ?');
  await say('Lucas', 'Je sais pas. Je dormais pas.');
  await say('Claude', 'Tu as fait un cauchemar ?');
  await say('Lucas', 'Non. Je pensais au monsieur de l\'hôpital.');
  await say('Claude', 'Gérard ?');
  await say('Lucas', 'Celui à qui tu dois faire l\'opération demain. Tu m\'en avais parlé une fois. Que c\'était compliqué.');
  await say('Claude', 'Tu te souviens de ça ?');
  await say('Lucas', 'Tu avais l\'air inquiet. C\'est la seule fois que je t\'ai vu comme ça.');
  await say(null, 'Claude posa ses dossiers. Il regarda son fils — ces yeux trop grands, trop attentifs pour un enfant de neuf ans.', true);
  await say('Claude', 'Viens là.');
  await say('Lucas', 'Il a des enfants, le monsieur ?');
  await say('Claude', 'Deux. Un peu plus grands que toi.');
  await say('Lucas', 'Alors tu dois le sauver. Pour eux.');
  await say('Claude', 'Je vais essayer, mon grand.');
  await say('Lucas', 'Non. Tu vas réussir. Parce que tu es le meilleur docteur du monde.');
  await say(null, 'Claude ne répondit pas. Il serra son fils contre lui.', true);
  await say('Lucas', 'Et le meilleur papa du monde.');
  await say(null, 'Ils restèrent longtemps comme ça. Le feu finissait de mourir dans la cheminée.', true);
  setProgress(40);

  // ── ACTE III ────────────────────────────────────────────────────
  await fadeOut(800);
  stageHideAll();
  await sleep(200);
  await showAct(3,'or');
  setProgress(45);
  playMusicTension();
  await showLocation('CHUV — Bloc opératoire n°2', '15 : 37');

  SCENE_CAST = {
    'Claude':  { key:'claude_masque' },
    'Antoine': { key:'antoine_masque' },
  };

  await say('Claude',  'Antoine. Dossier de Favre. Tu l\'as relu ce matin ?');
  await say('Antoine', 'Trois fois. L\'angulation de l\'aorte descendante… c\'est du jamais vu. Comment vous comptez aborder la bifurcation ?');
  await say('Claude',  'Par voie postéro-latérale gauche. On limitera l\'exposition du plexus. Ça rallongera l\'intervention, mais c\'est plus sûr.');
  await say('Antoine', 'Je n\'aurais pas pensé à ça.');
  await say('Claude',  'Dans dix ans, si. C\'est pour ça que tu es là aujourd\'hui — pour voir. Pour apprendre. Pas seulement à opérer, mais à décider.');
  await say('Antoine', 'Je me rends compte que je suis très loin d\'être prêt pour ce niveau.');
  await say('Claude',  'Tout le monde l\'est, la première fois. L\'important c\'est de ne pas faire semblant de l\'être.');
  await say('Antoine', 'Ce patient… il compte beaucoup pour vous, n\'est-ce pas ?');
  await say(null, 'Claude ajusta ses gants. Un geste qu\'il avait fait des milliers de fois.', true);
  await say('Claude',  'Ils comptent tous. Mais oui. Celui-là, particulièrement.');
  await say('Antoine', 'On y va ?');
  await say('Claude',  'On prépare le champ opératoire. Ensuite on y va.');
  setProgress(50);

  sceneEl.classList.remove('visible');
  await sleep(400);

  // Mini-jeu 1 — cercles
  let mg1;
  do {
    mg1 = await runMG_circles({
      total:10, maxErrors:3, speed:2.8, maxActive:2,
      title:'Préparer le champ opératoire',
      subtitle:'Appuyez sur chaque point avant la fermeture du cercle',
      failMessage:'Le champ opératoire doit être préparé avec méthode.\nConcentrez-vous et recommencez.',
    });
  } while(mg1===false);

  await fadeIn(400);
  sceneEl.classList.add('visible');

  await say('Claude',  'Bien. On commence.');
  await say(null, 'Huit heures de silence chirurgical. Chaque geste mesuré. Chaque décision pesée.', true);
  await say('Antoine', 'Docteur Renard — les paramètres vitaux changent. Pression artérielle en baisse.');
  await say('Claude',  'Je vois. Augmentez la perfusion. Préparez une unité de sang O négatif.');
  setProgress(60);

  sceneEl.classList.remove('visible');
  await sleep(400);

  // Mini-jeu 2 — dosage (nouveau type)
  let mg2;
  do {
    mg2 = await runMG_dosage({
      duration:16000,
      title:'Maintenir la perfusion',
      subtitle:'Maintenez le curseur dans la zone verte',
      failMessage:'La perfusion a été interrompue.\nUne main ferme est indispensable. Recommencez.',
    });
  } while(mg2===false);

  await fadeIn(400);
  sceneEl.classList.add('visible');

  await say('Antoine', 'C\'est… incroyable. Comment vous saviez que c\'était là ?');
  await say('Claude',  'Je ne savais pas. Je sentais.');
  await say(null, 'Onze heures quarante-deux. L\'anévrisme était isolé. La suture, parfaite.', true);
  setProgress(72);

  await say('Claude',  'Antoine. Tu fermes.');
  await say('Antoine', 'Moi ?');
  await say('Claude',  'Tu as regardé pendant onze heures. Maintenant tu fais. Je suis là.');
  await say(null, 'Antoine prit l\'aiguille. Ses mains tremblaient légèrement. Puis elles s\'arrêtèrent.', true);
  setProgress(78);

  sceneEl.classList.remove('visible');
  await sleep(400);

  // Mini-jeu 3 — sutures
  let mg3;
  do {
    mg3 = await runMG_traces({
      total:8, maxErrors:4, maxSim:1,
      title:'Fermeture — Antoine',
      subtitle:'Tracez chaque suture avec précision',
      failMessage:'La fermeture doit être irréprochable.\nGuidez Antoine avec patience. Recommencez.',
    });
  } while(mg3===false);

  await fadeIn(400);
  sceneEl.classList.add('visible');

  await say('Antoine', 'C\'est fait.');
  await say('Claude',  'C\'est fait.');
  await say(null, 'Ils se regardèrent par-dessus leurs masques. Quelque chose venait de changer.', true);
  setProgress(85);

  // ── ACTE IV ─────────────────────────────────────────────────────
  await fadeOut(800);
  stageHideAll();
  await sleep(200);
  await showAct(4,'hospital');
  setProgress(88);
  playMusicAmbiance();
  await showLocation('CHUV — Couloir', '03 : 14');

  SCENE_CAST = { 'Claude': { key:'claude' } };

  await say(null, 'Le couloir. Le silence de nuit. Les néons qui bourdonnaient.', true);
  await say(null, 'Claude s\'arrêta devant la fenêtre. Dehors, la ville dormait.', true);
  await say('Claude', 'Gérard.');

  playMusicTension();
  sceneEl.classList.remove('visible');
  await sleep(400);

  const choix = await showChoice({
    duration:15, fast:false, allowRandom:false,
    left:  { label:'Aller voir Gérard en salle de réveil', sub:'lui dire que c\'est fini' },
    right: { label:'Rentrer chez Lucas',                    sub:'tenir sa promesse de père' },
  });

  playMusicAmbiance();
  await fadeIn(400);
  sceneEl.classList.add('visible');

  if(choix==='left'){
    await say(null, 'La salle de réveil. Gérard dormait encore, les yeux clos, le visage apaisé.', true);
    await say('Claude', 'Gérard. C\'est fini. Vous rentrez chez vous.');
    await say(null, 'Gérard ouvrit les yeux. Il chercha le visage de Claude. Il sourit.', true);
    await say('Gérard', '… Emma va pouvoir apprendre à conduire.');
    await say('Claude', 'Elle a tout son temps.');
    await say(null, 'Claude resta là quelques minutes. Juste pour être sûr.', true);
  } else if(choix==='right'){
    await say(null, 'L\'appartement. Les lumières éteintes. La maison silencieuse.', true);
    await say(null, 'Lucas était endormi sur le canapé, un livre sur les genoux. Il avait attendu.', true);
    await say('Claude', 'Lucas.');
    await say('Lucas', 'Papa… c\'est bon ?');
    await say('Claude', 'C\'est bon. Il rentre chez lui.');
    await say('Lucas', 'Je savais.');
    await say(null, 'Claude s\'assit à côté de son fils. Pour la première fois depuis longtemps, il ne pensa à rien.', true);
  } else {
    await say(null, 'Il resta là, dans le couloir. Entre deux mondes.', true);
    await say(null, 'Certaines nuits, il n\'y a pas de bonne direction. Juste l\'instant présent.', true);
    await say('Claude', '… Merci.', true);
  }

  setProgress(100);
  await fadeOut(800);
  stageHideAll();
  await sleep(500);

  const endLines = choix==='left' ? [
    'Gérard Favre rentra chez lui douze jours plus tard.',
    'Emma passa son permis de conduire en juin.',
    'Claude Renard continua d\'opérer.',
    'Il n\'en parla jamais.',
  ] : choix==='right' ? [
    'Gérard Favre rentra chez lui douze jours plus tard.',
    'Lucas Renard n\'oublia jamais cette nuit-là.',
    'Claude Renard continua d\'opérer.',
    'Il rentra plus tôt, les autres soirs.',
  ] : [
    'Gérard Favre rentra chez lui douze jours plus tard.',
    'Claude Renard resta longtemps dans ce couloir.',
    'Certaines décisions n\'ont pas de nom.',
    'Elles existent quand même.',
  ];

  await showEndScreen(endLines);
}

async function startGame(){
  if(_gameStarted) return;
  _gameStarted=true;
  AC = new (window.AudioContext||window.webkitAudioContext)();
  window._actx=AC;
  initMusic();

  // Fond hospital immédiat (sans animation, le splash est devant)
  const layer=document.getElementById('bg-layer');
  layer.style.backgroundImage="url('images/bg_hospital.jpg')";
  _currentBg='images/bg_hospital.jpg';

  // Lancer la musique
  playMusicAmbiance();

  // Cacher le splash
  const splash=document.getElementById('splash-screen');
  splash.classList.add('hiding');
  await sleep(900);
  splash.style.display='none';

  await runGame();
}

function restartGame(){
  _gameStarted=false;
  document.getElementById('end-screen').classList.remove('active');
  document.getElementById('credits-screen').classList.remove('active');
  stopMusic();
  startGame();
}

document.getElementById('splash-btn').addEventListener('click', startGame);
