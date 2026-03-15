let _gameStarted = false;

async function say(speaker, text, isThought=false){
  showDialogue(speaker, text, isThought);
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

  // ══════════════════════════════════════════
  // ACTE I — Chambre de Gérard
  // Claude : scrubs uniquement (neutre, pensif)
  // ══════════════════════════════════════════
  await showAct(1);
  setProgress(5);
  setBgScene('hospital');
  setAmbience('hospital', 1200);
  await showLocation('CHUV — Chambre 214', '18 : 09');

  SCENE_CAST = {
    'Claude': { slot:'left',  key:'claude_neutre' },
    'Gérard': { slot:'right', key:'gerard_calme'  },
  };
  stageShow('left',  'claude_neutre');
  stageShow('right', 'gerard_calme');
  stageActivate('left');

  await say('Claude', 'Demain matin, sept heures. On aura la salle deux. C\'est la meilleure lumière.');
  await say('Gérard', 'Vous avez dit ça la dernière fois aussi. Avant l\'appendicite de ma fille.');
  await say('Claude', 'Et ça s\'était bien passé.');
  await say('Gérard', 'Oui.');
  await say(null, 'Un silence. Gérard regardait par la fenêtre. Dehors, le ciel de mai palissait doucement.', true);
  await say('Gérard', 'Docteur Renard… si quelque chose tourne mal demain. Ma femme—');

  SCENE_CAST['Claude'].key = 'claude_neutre';
  stageShow('left', 'claude_neutre');
  stageActivate('left');

  await say('Claude', 'Gérard.');
  await say('Gérard', 'Laissez-moi finir. Mes enfants ont sept et dix ans. Emma ne sait pas encore conduire. Je voudrais que vous sachiez que—');

  SCENE_CAST['Claude'].key = 'claude_neutre';
  stageShow('left', 'claude_neutre');

  await say('Claude', 'Gérard, arrêtez. Je vous connais depuis six ans. J\'ai vu vos résultats, vos IRM, vos analyses. Et je vous dis : vous allez rentrer chez vous.');
  await say('Gérard', 'Vous pouvez me le promettre ?');
  await say(null, 'Claude hésita. Pas longtemps. Juste assez pour être honnête.', true);

  SCENE_CAST['Claude'].key = 'claude_pensif';
  stageShow('left', 'claude_pensif');

  await say('Claude', 'Je peux vous promettre que je ferai tout ce qui est en mon pouvoir. Et que mon pouvoir est considérable.');

  SCENE_CAST['Gérard'].key = 'gerard_souriant';
  stageShow('right', 'gerard_souriant');

  await say('Gérard', '… Ça me suffit.');

  SCENE_CAST['Claude'].key = 'claude_neutre';
  stageShow('left', 'claude_neutre');

  await say('Claude', 'Dormez. Vous aurez besoin de toutes vos forces.');
  await say('Gérard', 'Et vous ?');
  await say('Claude', 'Moi j\'ai besoin d\'un café.');
  await say(null, 'Gérard sourit pour la première fois depuis des semaines.', true);
  setProgress(18);

  // ══════════════════════════════════════════
  // ACTE II — Appartement de Claude
  // Claude : veste civile uniquement
  // Lucas : pyjama rayé uniquement
  // ══════════════════════════════════════════
  await fadeOut(800); stageHideAll(); await sleep(200);
  await showAct(2);
  setProgress(28);
  setBgScene('apartment');
  setAmbience('apartment', 1500);
  await fadeIn(600);
  await showLocation('Appartement de Claude', '00 : 23');

  SCENE_CAST = {
    'Claude': { slot:'left',  key:'claude_serieux' },
    'Lucas':  { slot:'right', key:'lucas_inquiet'  },
  };
  stageShow('left', 'claude_serieux');
  stageHide('right');
  stageActivate('left');

  await say(null, 'La bibliothèque. Les braises. Les dossiers éparpillés sur la table basse. Claude n\'avait pas dormi.', true);
  await say(null, 'Il y avait une photo encadrée sur l\'étagère — une femme souriante, des cheveux châtains, les yeux fermés face au soleil. Quatre ans.', true);
  await say(null, 'Gérard. L\'opération. Les risques. Ses mains. Étaient-elles encore assez sûres ?', true);

  SCENE_CAST['Claude'].key = 'claude_inquiet';
  stageShow('left', 'claude_inquiet');

  await say('Claude', '… Douze heures. Peut-être treize si on rencontre des complications vasculaires.');
  await say(null, 'Il ferma les yeux. Il pensa à Lucas endormi dans sa chambre. Ce fils qu\'il voyait si peu.', true);

  stageShow('right', 'lucas_inquiet');
  stageActivate('right');

  await say('Lucas', 'Papa ?');

  SCENE_CAST['Claude'].key = 'claude_serieux';
  stageShow('left', 'claude_serieux');
  stageActivate('left');

  await say('Claude', 'Lucas… Il est passé minuit. Qu\'est-ce que tu fais debout ?');
  stageActivate('right');
  await say('Lucas', 'Je sais pas. Je dormais pas.');
  await say('Claude', 'Tu as fait un cauchemar ?');
  await say('Lucas', 'Non. Je pensais au monsieur de l\'hôpital.');
  await say('Claude', 'Gérard ?');
  await say('Lucas', 'Celui à qui tu dois faire l\'opération demain. Tu m\'en avais parlé une fois. Que c\'était compliqué.');
  await say('Claude', 'Tu te souviens de ça ?');

  SCENE_CAST['Lucas'].key = 'lucas_soucieux';
  stageShow('right', 'lucas_soucieux');

  await say('Lucas', 'Tu avais l\'air inquiet. C\'est la seule fois que je t\'ai vu comme ça.');
  await say(null, 'Claude posa ses dossiers. Il regarda son fils — ces yeux trop grands, trop attentifs pour un enfant de neuf ans.', true);

  SCENE_CAST['Claude'].key = 'claude_souriant';
  stageShow('left', 'claude_souriant');
  stageActivate('left');

  await say('Claude', 'Viens là.');
  stageActivate('right');
  await say('Lucas', 'Il a des enfants, le monsieur ?');
  await say('Claude', 'Deux. Un peu plus grands que toi.');

  SCENE_CAST['Lucas'].key = 'lucas_admiratif';
  stageShow('right', 'lucas_admiratif');

  await say('Lucas', 'Alors tu dois le sauver. Pour eux.');

  SCENE_CAST['Claude'].key = 'claude_inquiet';
  stageShow('left', 'claude_inquiet');

  await say('Claude', 'Je vais essayer, mon grand.');

  SCENE_CAST['Lucas'].key = 'lucas_content';
  stageShow('right', 'lucas_content');

  await say('Lucas', 'Non. Tu vas réussir. Parce que tu es le meilleur docteur du monde.');
  await say(null, 'Claude ne répondit pas. Il serra son fils contre lui.', true);
  await say('Lucas', 'Et le meilleur papa du monde.');
  await say(null, 'Ils restèrent longtemps comme ça. Le feu finissait de mourir dans la cheminée.', true);
  setProgress(40);

  // ══════════════════════════════════════════
  // ACTE III — Bloc opératoire
  // Claude + Antoine : masques uniquement
  // ══════════════════════════════════════════
  await fadeOut(800); stageHideAll(); await sleep(200);
  await showAct(3);
  setProgress(45);
  setBgScene('or');
  setAmbience('or', 1200);
  await fadeIn(600);
  await showLocation('CHUV — Bloc opératoire n°2', '15 : 37');

  SCENE_CAST = {
    'Claude':  { slot:'left',  key:'claude_masque'   },
    'Antoine': { slot:'right', key:'antoine_nerveux'  },
  };
  stageShow('left',  'claude_masque');
  stageShow('right', 'antoine_nerveux');
  stageActivate('left');

  await say('Claude', 'Antoine. Dossier de Favre. Tu l\'as relu ce matin ?');

  SCENE_CAST['Antoine'].key = 'antoine_neutre';
  stageShow('right', 'antoine_neutre');
  stageActivate('right');

  await say('Antoine', 'Trois fois. L\'angulation de l\'aorte descendante… c\'est du jamais vu. Comment vous comptez aborder la bifurcation ?');

  SCENE_CAST['Claude'].key = 'claude_masque2';
  stageShow('left', 'claude_masque2');
  stageActivate('left');

  await say('Claude', 'Par voie postéro-latérale gauche. On limitera l\'exposition du plexus. Ça rallongera l\'intervention, mais c\'est plus sûr.');

  SCENE_CAST['Antoine'].key = 'antoine_nerveux';
  stageShow('right', 'antoine_nerveux');
  stageActivate('right');

  await say('Antoine', 'Je n\'aurais pas pensé à ça.');
  await say('Claude', 'Dans dix ans, si. C\'est pour ça que tu es là aujourd\'hui — pour voir. Pour apprendre. Pas seulement à opérer, mais à décider.');
  await say('Antoine', 'Je me rends compte que je suis très loin d\'être prêt pour ce niveau.');

  SCENE_CAST['Claude'].key = 'claude_masque';
  stageShow('left', 'claude_masque');
  stageActivate('left');

  await say('Claude', 'Tout le monde l\'est, la première fois. L\'important c\'est de ne pas faire semblant de l\'être.');
  await say('Antoine', 'Ce patient… il compte beaucoup pour vous, n\'est-ce pas ?');
  await say(null, 'Claude ajusta ses gants. Un geste qu\'il avait fait des milliers de fois.', true);
  await say('Claude', 'Ils comptent tous. Mais oui. Celui-là, particulièrement.');

  SCENE_CAST['Antoine'].key = 'antoine_masque';
  stageShow('right', 'antoine_masque');

  await say('Antoine', 'On y va ?');
  await say('Claude', 'On prépare le champ opératoire. Ensuite on y va.');
  setProgress(50);

  sceneEl.classList.remove('visible');
  await sleep(400);

  let mg1result;
  do {
    mg1result = await runMG_circles({
      total:10, maxErrors:3,
      title:'Préparer le champ opératoire',
      subtitle:'Cliquez sur chaque point avant la fermeture du cercle',
      speed:2.8, maxActive:2,
    });
  } while(mg1result === false);

  await fadeIn(400);
  SCENE_CAST['Claude'].key  = 'claude_masque';
  SCENE_CAST['Antoine'].key = 'antoine_masque';
  stageShow('left',  'claude_masque');
  stageShow('right', 'antoine_masque');
  stageActivate('left');
  sceneEl.classList.add('visible');

  await say('Claude', 'Bien. On commence.');
  await say(null, 'Huit heures de silence chirurgical. Chaque geste mesuré. Chaque décision pesée.', true);

  SCENE_CAST['Antoine'].key = 'antoine_nerveux';
  stageShow('right', 'antoine_nerveux');
  stageActivate('right');

  await say('Antoine', 'Docteur Renard — les paramètres vitaux changent. Pression artérielle en baisse.');

  SCENE_CAST['Claude'].key = 'claude_masque2';
  stageShow('left', 'claude_masque2');
  stageActivate('left');

  await say('Claude', 'Je vois. Augmentez la perfusion. Préparez une unité de sang O négatif.');
  setProgress(60);

  sceneEl.classList.remove('visible');
  await sleep(400);

  let mg2result;
  do {
    mg2result = await runMG_traces({
      total:12, maxErrors:3,
      title:'Suture vasculaire',
      subtitle:'Tracez chaque incision avec précision',
      fast:false, maxSim:2,
    });
  } while(mg2result === false);

  await fadeIn(400);
  SCENE_CAST['Claude'].key  = 'claude_masque2';
  SCENE_CAST['Antoine'].key = 'antoine_masque';
  stageShow('left',  'claude_masque2');
  stageShow('right', 'antoine_masque');
  stageActivate('right');
  sceneEl.classList.add('visible');

  await say('Antoine', 'C\'est… incroyable. Comment vous saviez que c\'était là ?');
  stageActivate('left');
  await say('Claude', 'Je ne savais pas. Je sentais.');
  await say(null, 'Onze heures quarante-deux. L\'anévrisme était isolé. La suture, parfaite.', true);
  setProgress(72);

  await say('Claude', 'Antoine. Tu fermes.');

  SCENE_CAST['Antoine'].key = 'antoine_nerveux';
  stageShow('right', 'antoine_nerveux');
  stageActivate('right');

  await say('Antoine', 'Moi ?');
  stageActivate('left');
  await say('Claude', 'Tu as regardé pendant onze heures. Maintenant tu fais. Je suis là.');
  await say(null, 'Antoine prit l\'aiguille. Ses mains tremblaient légèrement. Puis elles s\'arrêtèrent.', true);
  setProgress(78);

  sceneEl.classList.remove('visible');
  await sleep(400);

  let mg3result;
  do {
    mg3result = await runMG_traces({
      total:8, maxErrors:4,
      title:'Fermeture — Antoine',
      subtitle:'Guidez Antoine dans la fermeture',
      fast:false, maxSim:1,
    });
  } while(mg3result === false);

  await fadeIn(400);
  SCENE_CAST['Claude'].key  = 'claude_masque';
  SCENE_CAST['Antoine'].key = 'antoine_masque';
  stageShow('left',  'claude_masque');
  stageShow('right', 'antoine_masque');
  stageActivate('right');
  sceneEl.classList.add('visible');

  await say('Antoine', 'C\'est fait.');
  stageActivate('left');
  await say('Claude', 'C\'est fait.');
  await say(null, 'Ils se regardèrent par-dessus leurs masques. Quelque chose venait de changer.', true);
  setProgress(85);

  // ══════════════════════════════════════════
  // ACTE IV — Couloir
  // Claude : scrubs (retour hôpital sans masque)
  // ══════════════════════════════════════════
  await fadeOut(800); stageHideAll(); await sleep(200);
  await showAct(4);
  setProgress(88);
  setBgScene('hospital');
  setAmbience('hospital', 1200);
  await fadeIn(600);
  await showLocation('CHUV — Couloir', '03 : 14');

  SCENE_CAST = { 'Claude': { slot:'left', key:'claude_neutre' } };
  stageShow('left', 'claude_neutre');
  stageActivate('left');

  await say(null, 'Le couloir. Le silence de nuit. Les néons qui bourdonnaient.', true);
  await say(null, 'Claude s\'arrêta devant la fenêtre. Dehors, la ville dormait.', true);

  SCENE_CAST['Claude'].key = 'claude_pensif';
  stageShow('left', 'claude_pensif');

  await say('Claude', 'Gérard.');

  setAmbience('choice', 800);
  sceneEl.classList.remove('visible');
  await sleep(400);

  const choix = await showChoice({
    duration: 15,
    fast: false,
    allowRandom: false,
    left:  { label: 'Aller voir Gérard en salle de réveil', sub: 'lui dire que c\'est fini' },
    right: { label: 'Rentrer chez Lucas', sub: 'tenir sa promesse de père' },
  });

  setAmbience('ending', 1500);
  await fadeIn(400);
  sceneEl.classList.add('visible');

  if(choix === 'left'){
    SCENE_CAST = {
      'Claude': { slot:'left',  key:'claude_neutre'    },
      'Gérard': { slot:'right', key:'gerard_calme'     },
    };
    stageShow('left',  'claude_neutre');
    stageShow('right', 'gerard_calme');
    stageActivate('left');

    await say(null, 'La salle de réveil. Gérard dormait encore, les yeux clos, le visage apaisé.', true);
    await say('Claude', 'Gérard. C\'est fini. Vous rentrez chez vous.');
    await say(null, 'Gérard ouvrit les yeux. Il chercha le visage de Claude. Il sourit.', true);

    SCENE_CAST['Gérard'].key = 'gerard_souriant';
    stageShow('right', 'gerard_souriant');
    stageActivate('right');

    await say('Gérard', '… Emma va pouvoir apprendre à conduire.');
    stageActivate('left');
    await say('Claude', 'Elle a tout son temps.');
    await say(null, 'Claude resta là quelques minutes. Juste pour être sûr.', true);

  } else if(choix === 'right'){
    SCENE_CAST = {
      'Claude': { slot:'left',  key:'claude_neutre'   },
      'Lucas':  { slot:'right', key:'lucas_soucieux'  },
    };
    stageShow('left',  'claude_neutre');
    stageShow('right', 'lucas_soucieux');
    stageActivate('left');

    await say(null, 'L\'appartement. Les lumières éteintes. La maison silencieuse.', true);
    await say(null, 'Lucas était endormi sur le canapé, un livre sur les genoux. Il avait attendu.', true);
    await say('Claude', 'Lucas.');

    SCENE_CAST['Lucas'].key = 'lucas_admiratif';
    stageShow('right', 'lucas_admiratif');
    stageActivate('right');

    await say('Lucas', 'Papa… c\'est bon ?');
    stageActivate('left');
    await say('Claude', 'C\'est bon. Il rentre chez lui.');

    SCENE_CAST['Lucas'].key = 'lucas_content';
    stageShow('right', 'lucas_content');
    stageActivate('right');

    await say('Lucas', 'Je savais.');
    await say(null, 'Claude s\'assit à côté de son fils. Pour la première fois depuis longtemps, il ne pensa à rien.', true);

  } else {
    SCENE_CAST = { 'Claude': { slot:'left', key:'claude_pensif' } };
    stageShow('left', 'claude_pensif');
    stageActivate('left');

    await say(null, 'Il resta là, dans le couloir. Entre deux mondes.', true);
    await say(null, 'Certaines nuits, il n\'y a pas de bonne direction. Juste l\'instant présent.', true);
    await say('Claude', '… Merci.', true);
  }

  setProgress(100);
  await fadeOut(800);
  stageHideAll();
  await sleep(500);

  const endLines = choix === 'left' ? [
    'Gérard Favre rentra chez lui douze jours plus tard.',
    'Emma passa son permis de conduire en juin.',
    'Claude Renard continua d\'opérer.',
    'Il n\'en parla jamais.',
  ] : choix === 'right' ? [
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
  loadPortraits();
  if(_gameStarted) return;
  _gameStarted = true;
  AC = new (window.AudioContext || window.webkitAudioContext)();
  window._actx = AC;
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
  disposeAmbience();
  startGame();
}

document.getElementById('splash-btn').addEventListener('click', startGame);
