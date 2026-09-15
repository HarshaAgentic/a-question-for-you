/* ════════════════════════════════════════════════════════════
   will you go on a date with me?  —  8-bit edition
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MUSIC_ID  = 'aO9KoEaEkMg';   // background music
  var SHORTS_ID = 'LVMAVVNcnBQ';   // the reward video
  var MUSIC_VOL = 38;
  var QUESTION  = 'WILL YOU GO\nON A DATE\nWITH ME ?';

  var YES_STEPS = [
    'YES',
    'YOU MEANT YES ?',
    'PLEASE :(',
    'WELL WE TAKE THAT AS YES THEN'
  ];

  /* the no button slowly loses its nerve */
  var NO_STEPS = ['NO', 'no', 'n o', 'no...?'];

  /* what she says back, as the nos stack up */
  var BUBBLES = ['...seriously?', 'i\u2019m literally right here', 'ok that\u2019s enough'];

  /* browser-tab nagging */
  var TITLES = ['will you go on a date with me?', 'say yes', 'please', 'i\u2019m still here'];

  /* shown if she just sits there */
  var NUDGES = [
    { at: 15000, text: '(it\u2019s not a hard question)' },
    { at: 32000, text: '(i can wait)' }
  ];

  var $ = function (id) { return document.getElementById(id); };

  /* ── diagnostics: add #diag to the url to see what the players are doing ── */
  var DIAG = /(^|[#&])diag\b/.test(location.hash), diagBox = null, diagLines = [];
  function diag(msg) {
    if (!DIAG) return;
    if (!diagBox) { diagBox = document.createElement('div'); diagBox.id = 'diag'; document.body.appendChild(diagBox); }
    diagLines.push('[' + (performance.now() / 1000).toFixed(1) + 's] ' + msg);
    if (diagLines.length > 14) diagLines.shift();
    diagBox.textContent = diagLines.join('\n');
  }
  function ytErr(c) {
    return ({2:'bad param',5:'html5 error',100:'video not found',
             101:'embedding not allowed',150:'embedding not allowed'})[c] || 'unknown';
  }

  var elIntro = $('s-intro'), elAsk = $('s-ask'), elWin = $('s-win');
  var qText   = $('qtext'),   caret = document.querySelector('.caret');
  var btns    = $('btns'),    yesBtn = $('yesBtn'), noBtn = $('noBtn');
  var soundBtn= $('soundBtn'),tapHint = $('tapHint'), winTitle = $('winTitle');
  var charAnim= $('charAnim'), bubble = $('bubble'), bubbleText = $('bubbleText');
  var nudge   = $('nudge');
  var coupleHearts = $('coupleHearts');

  var noCount = 0;
  var decided = false;
  var musicFailed = false;
  var musicOn = false;

  /* ── screen switching ─────────────────────────────────── */
  function show(el) {
    [elIntro, elAsk, elWin].forEach(function (s) { s.classList.remove('is-on'); });
    el.classList.add('is-on');
  }
  function fadeTo(from, to, cb) {
    from.classList.add('fading');
    setTimeout(function () {
      from.classList.remove('fading', 'is-on');
      show(to);
      if (cb) cb();
    }, 820);
  }


  /* ── 1. intro: "hi lol" → the question ────────────────── */
  setTimeout(function () { show(elAsk); startTypewriter(); }, 3350);

  /* ── 2. typewriter ────────────────────────────────────── */
  function startTypewriter() {
    var i = 0;
    setTimeout(function tick() {
      if (i <= QUESTION.length) {
        qText.textContent = QUESTION.slice(0, i);
        var ch = QUESTION[i - 1];
        if (i > 0 && ch !== ' ' && ch !== '\n') blip(520 + (i % 4) * 40, 0.018, 0.028);
        i++;
        setTimeout(tick, 52);
      } else {
        caret.classList.add('done');
        btns.classList.add('show');
        setTitle(0);
        startIdleNudges();
      }
    }, 520);
  }

  /* ── her reactions ────────────────────────────────────── */
  var bubbleTimer = null;
  function react(kind) {
    if (!charAnim) return;
    charAnim.classList.remove('sad', 'happy');
    void charAnim.offsetWidth;           // restart the animation
    charAnim.classList.add(kind);
  }

  function say(text, holdMs) {
    if (!bubble) return;
    clearTimeout(bubbleTimer);
    bubbleText.textContent = text;
    bubble.classList.add('show');
    bubbleTimer = setTimeout(function () { bubble.classList.remove('show'); }, holdMs || 2600);
  }

  /* ── idle nudges ──────────────────────────────────────── */
  var nudgeTimers = [];
  function startIdleNudges() {
    stopIdleNudges();
    NUDGES.forEach(function (n) {
      nudgeTimers.push(setTimeout(function () {
        if (decided || noCount > 0) return;
        nudge.textContent = n.text;
        nudge.classList.add('show');
        setTitle(3);
      }, n.at));
    });
  }
  function stopIdleNudges() {
    nudgeTimers.forEach(clearTimeout);
    nudgeTimers = [];
    if (nudge) nudge.classList.remove('show');
  }

  /* ── tab title ────────────────────────────────────────── */
  function setTitle(i) { document.title = TITLES[Math.min(i, TITLES.length - 1)]; }

  /* if she tabs away mid-question, notice out loud */
  document.addEventListener('visibilitychange', function () {
    if (decided) return;
    if (document.hidden) document.title = 'where did you go';
    else setTitle(Math.min(noCount, 3));
  });

  /* ── 3. the buttons ───────────────────────────────────── */
  yesBtn.addEventListener('click', function () {
    if (decided) return;
    decided = true;
    blip(880, 0.09, 0.07); setTimeout(function () { blip(1320, 0.14, 0.07); }, 90);
    setTimeout(function () { blip(1760, 0.18, 0.06); }, 190);
    stopIdleNudges();
    react('happy');
    say('!!!', 1800);
    document.title = 'IT\u2019S A DATE \u2665';
    burstHearts(26);
    winTitle.textContent = noCount >= 3 ? "IT'S A DATE ANYWAY ♥" : "IT'S A DATE!";
    goToVideo();
  });

  noBtn.addEventListener('click', function () {
    if (decided) return;
    noCount++;
    stopIdleNudges();

    /* little descending sad-trombone */
    blip(330 - noCount * 40, 0.10, 0.05);
    setTimeout(function () { blip(260 - noCount * 40, 0.12, 0.045); }, 110);
    setTimeout(function () { blip(200 - noCount * 40, 0.20, 0.04); }, 230);

    react('sad');
    say(BUBBLES[Math.min(noCount, BUBBLES.length) - 1]);
    setTitle(noCount);

    noBtn.textContent = NO_STEPS[Math.min(noCount, NO_STEPS.length - 1)];
    yesBtn.textContent = YES_STEPS[Math.min(noCount, 3)];
    yesBtn.classList.remove('step1', 'step2', 'step3');
    yesBtn.classList.add('step' + Math.min(noCount, 3));

    if (noCount === 1) noBtn.classList.add('n1');
    if (noCount === 2) { noBtn.classList.remove('n1'); noBtn.classList.add('n2'); }

    if (noCount >= 3) {
      decided = true;
      setTimeout(function () { noBtn.classList.add('gone'); }, 800);
      burstHearts(26);
      winTitle.textContent = "IT'S A DATE ANYWAY ♥";
      setTimeout(goToVideo, 2000);   // let her read the line first
    }
  });

  /* ── little hearts drifting around the two of them ─────── */
  var MINI_COLORS = ['var(--rose)', 'var(--rose-hi)', 'var(--cloud-hi)', 'var(--sky-b)'];
  var coupleTimer = null;

  function spawnMiniHeart() {
    if (!coupleHearts) return;
    var w = coupleHearts.clientWidth || 300;
    var h = coupleHearts.clientHeight || 300;
    /* bias towards the sides so they rise around the pair, not up the middle */
    var t = Math.random();
    var x = t < 0.42 ? Math.random() * w * 0.3               // left of him
          : t < 0.84 ? w * 0.7 + Math.random() * w * 0.3     // right of her
          : w * 0.42 + Math.random() * w * 0.16;             // the gap between

    var el = document.createElement('div');
    el.className = 'mini-heart';
    el.style.left = Math.round(x) + 'px';
    el.style.top  = Math.round(h * (0.45 + Math.random() * 0.5)) + 'px';
    el.style.color = MINI_COLORS[(Math.random() * MINI_COLORS.length) | 0];
    var dur = 3.4 + Math.random() * 2.6;
    el.style.animationDuration = dur + 's';
    coupleHearts.appendChild(el);
    setTimeout(function () { el.remove(); }, dur * 1000 + 200);
  }

  function startCoupleHearts() {
    if (coupleTimer || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (var i = 0; i < 5; i++) setTimeout(spawnMiniHeart, 1500 + i * 260);
    coupleTimer = setInterval(spawnMiniHeart, 620);
  }

  function goToVideo() {
    fadeTo(elAsk, elWin, function () { duckMusic(); mountShorts(); startCoupleHearts(); });
  }

  /* ════════════════════════════════════════════════════════
     YouTube players
     ════════════════════════════════════════════════════════ */
  var musicPlayer = null, shortsPlayer = null;
  var apiReady = false, wantShorts = false, userGestured = false;

  window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    musicPlayer = new YT.Player('music', {
      videoId: MUSIC_ID,
      playerVars: {
        autoplay: 1, controls: 0, disablekb: 1, playsinline: 1,
        loop: 1, playlist: MUSIC_ID, modestbranding: 1, rel: 0, iv_load_policy: 3,
        origin: location.origin
      },
      events: {
        onReady: function (e) {
          diag('music onReady (gestured=' + userGestured + ')');
          e.target.setVolume(MUSIC_VOL);
          autoplayBegin();
        },
        onStateChange: function (e) {
          diag('music state=' + e.data);
          if (e.data === YT.PlayerState.PLAYING && !musicOn) tryUnmute();
          if (e.data === YT.PlayerState.ENDED) e.target.playVideo(); // hard loop guard
        },
        onError: function (e) {
          musicFailed = true;
          diag('MUSIC ERROR ' + e.data + ' (' + ytErr(e.data) + ')');
          soundBtn.classList.add('muted');
        }
      }
    });
    if (wantShorts) mountShorts();
  };

  (function loadAPI() {
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = function () { diag('IFRAME API FAILED TO LOAD (offline?)'); };
    document.head.appendChild(s);
    setTimeout(function () { if (!apiReady) diag('api still not ready after 5s'); }, 5000);
  })();

  /* the reward video — API player when available, plain iframe otherwise */
  function mountShorts() {
    if (shortsPlayer) return;
    var host = $('player');
    if (!host) return;

    if (apiReady && window.YT && YT.Player) {
      shortsPlayer = new YT.Player('player', {
        videoId: SHORTS_ID,
        playerVars: {
          autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, controls: 1,
          origin: location.origin          // youtube wants this with the js api
        },
        events: {
          onReady: function (e) {
            diag('shorts ready');
            try { e.target.unMute(); e.target.setVolume(100); e.target.playVideo(); } catch (err) {}
            // if it has not actually started, offer a tap-to-play overlay
            setTimeout(function () {
              try {
                if (e.target.getPlayerState() !== YT.PlayerState.PLAYING) {
                  diag('shorts not playing -> overlay');
                  showTapToPlay();
                }
              } catch (err) {}
            }, 1800);
          },
          onStateChange: function (e) {
            diag('shorts state=' + e.data);
            if (e.data === YT.PlayerState.PLAYING) hideOverlay();
          },
          onError: function (e) {
            diag('SHORTS ERROR ' + e.data + ' (' + ytErr(e.data) + ')');
            showVideoFallback(e.data);
          }
        }
      });
    } else {
      wantShorts = true;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + SHORTS_ID +
              '?autoplay=1&playsinline=1&rel=0&modestbranding=1&origin=' +
              encodeURIComponent(location.origin);
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', '');
      host.replaceWith(f);
      shortsPlayer = f;
    }
  }

  /* ── overlays on the little tv ───────────────────────────── */
  function tvInner() { return document.querySelector('.tv-inner'); }
  function hideOverlay() { var o = $('tvOverlay'); if (o) o.remove(); }

  function overlay(html) {
    hideOverlay();
    var o = document.createElement('div');
    o.id = 'tvOverlay';
    o.innerHTML = html;
    tvInner().appendChild(o);
    return o;
  }

  /* autoplay refused -> one big friendly play button */
  function showTapToPlay() {
    var o = overlay('<button class="tv-btn" id="tvPlay">&#9654; PLAY</button>');
    $('tvPlay').addEventListener('click', function () {
      try { shortsPlayer.unMute(); shortsPlayer.setVolume(100); shortsPlayer.playVideo(); } catch (e) {}
      hideOverlay();
    });
  }

  /* youtube refused entirely -> explain + give her a way to watch it */
  function showVideoFallback(code) {
    var blocked = (code === 101 || code === 150);
    overlay(
      '<p class="tv-msg">' + (blocked
        ? 'youtube won\u2019t embed this one'
        : 'the video didn\u2019t load<br><span class="tv-sub">(an ad blocker may be stopping it)</span>') +
      '</p>' +
      '<a class="tv-btn" target="_blank" rel="noopener" href="https://www.youtube.com/shorts/' + SHORTS_ID + '">&#9654; WATCH IT</a>' +
      '<button class="tv-btn ghost" id="tvRetry">RETRY</button>'
    );
    var r = $('tvRetry');
    if (r) r.addEventListener('click', function () {
      hideOverlay();
      try { shortsPlayer.loadVideoById(SHORTS_ID); shortsPlayer.playVideo(); } catch (e) {}
    });
  }

  /* fade the background music down so it does not fight the video */
  function duckMusic() {
    if (!musicPlayer || !musicPlayer.getVolume) return;
    var v = musicPlayer.getVolume();
    var id = setInterval(function () {
      v -= 4;
      if (v <= 0) { clearInterval(id); try { musicPlayer.pauseVideo(); } catch (e) {} }
      else { try { musicPlayer.setVolume(v); } catch (e) {} }
    }, 55);
  }

  /* ── sound: keep trying until audio is confirmed on ──────
     browsers refuse audible playback until a real user gesture, and the
     gesture can easily land before the yt api has finished loading -- so we
     retry on EVERY interaction until we have verified sound is actually on. */
  function markGesture() {
    userGestured = true;
    tapHint.classList.remove('show');
    startMusic();
  }

  /* ── audible playback without a click ────────────────────
     browsers always allow MUTED autoplay, and only guard the audible part.
     so: start muted (guaranteed to roll), then unmute once the player really
     reports PLAYING. driving this off the state event -- rather than a blind
     timer -- matters, because calling playVideo() again mid-buffer restarts
     the load and the attempts end up fighting each other. */
  var unmuteTries = 0;

  function autoplayBegin() {
    if (!musicPlayer || musicOn) return;
    try {
      musicPlayer.setVolume(MUSIC_VOL);
      musicPlayer.mute();        // always permitted
      musicPlayer.playVideo();
      diag('autoplay: muted start');
    } catch (e) { diag('autoplayBegin threw ' + e.message); }
  }

  /* called when the player reports it is genuinely PLAYING */
  function tryUnmute() {
    if (musicOn || decided || musicFailed || !musicPlayer) return;
    if (unmuteTries >= 8) {
      diag('unmute refused; waiting for a tap');
      if (!userGestured) tapHint.classList.add('show');
      soundBtn.classList.add('muted');
      return;
    }
    unmuteTries++;
    try { musicPlayer.unMute(); musicPlayer.setVolume(MUSIC_VOL); } catch (e) {}

    setTimeout(function () {
      if (musicOn) return;
      var playing = false, muted = true;
      try {
        playing = musicPlayer.getPlayerState() === YT.PlayerState.PLAYING;
        muted   = musicPlayer.isMuted();
      } catch (e) {}
      diag('unmute try ' + unmuteTries + ': playing=' + playing + ' muted=' + muted);

      if (playing && !muted) {
        musicOn = true;
        soundBtn.classList.remove('muted');
        tapHint.classList.remove('show');
        GESTURES.forEach(function (ev) { document.removeEventListener(ev, markGesture, true); });
        diag('AUTOPLAY SUCCEEDED (no click needed)');
        return;
      }
      // the policy pushed back. keep it rolling muted and try again shortly --
      // never re-issue playVideo() while it is mid-buffer.
      if (!playing) { try { musicPlayer.mute(); musicPlayer.playVideo(); } catch (e) {} }
      if (unmuteTries >= 3 && !userGestured) tapHint.classList.add('show');
      setTimeout(tryUnmute, 900);
    }, 400);
  }

  function startMusic() {
    if (musicOn || decided || musicFailed) return;
    if (!musicPlayer || !musicPlayer.playVideo) return;   // not ready; a later gesture retries
    try {
      musicPlayer.unMute();
      musicPlayer.setVolume(MUSIC_VOL);
      musicPlayer.playVideo();
      diag('startMusic attempt');
      setTimeout(confirmMusic, 700);
    } catch (e) { diag('startMusic threw ' + e.message); }
  }

  function confirmMusic() {
    if (!musicPlayer || !musicPlayer.getPlayerState) return;
    try {
      musicOn = (musicPlayer.getPlayerState() === YT.PlayerState.PLAYING) && !musicPlayer.isMuted();
      diag('music on=' + musicOn);
      soundBtn.classList.toggle('muted', !musicOn);
      if (musicOn) {
        tapHint.classList.remove('show');
        GESTURES.forEach(function (ev) { document.removeEventListener(ev, markGesture, true); });
      }
    } catch (e) {}
  }

  /* capture phase so the yes/no buttons cannot swallow the event */
  var GESTURES = ['pointerdown', 'touchstart', 'click', 'keydown'];
  GESTURES.forEach(function (ev) { document.addEventListener(ev, markGesture, true); });

  soundBtn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    userGestured = true;
    tapHint.classList.remove('show');
    var target = decided ? shortsPlayer : musicPlayer;
    if (!target || !target.isMuted) return;
    try {
      if (target.isMuted()) { target.unMute(); soundBtn.classList.remove('muted'); if (!decided) target.playVideo(); }
      else { target.mute(); soundBtn.classList.add('muted'); }
    } catch (e) {}
  });

  /* ════════════════════════════════════════════════════════
     ambience: starfield, hearts, chiptune blips
     ════════════════════════════════════════════════════════ */

  /* — twinkling pixel stars — */
  (function starfield() {
    var c = $('stars'), ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [];

    function seed() {
      c.width = innerWidth * dpr; c.height = innerHeight * dpr;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round((innerWidth * innerHeight) / 17000);
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.round(Math.random() * innerWidth),
          y: Math.round(Math.random() * innerHeight * 0.92),
          s: Math.random() < 0.18 ? 3 : 2,
          p: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.5,
          c: Math.random() < 0.22 ? '224,200,160' : '242,236,216'
        });
      }
    }

    var t = 0;
    function draw() {
      t += 0.026;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var a = 0.20 + 0.55 * (0.5 + 0.5 * Math.sin(t * st.sp + st.p));
        ctx.fillStyle = 'rgba(' + st.c + ',' + a.toFixed(3) + ')';
        ctx.fillRect(st.x, st.y, st.s, st.s);
      }
      requestAnimationFrame(draw);
    }

    seed();
    addEventListener('resize', seed);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
    else { ctx.fillStyle = 'rgba(242,236,216,.5)'; stars.forEach(function (s) { ctx.fillRect(s.x, s.y, s.s, s.s); }); }
  })();

  /* — drifting pixel hearts — */
  var heartBox = $('hearts');
  var HEART_COLORS = ['var(--rose)', 'var(--rose-hi)', 'var(--cloud-hi)', 'var(--sky-b)'];

  function spawnHeart(x, fast) {
    var h = document.createElement('div');
    h.className = 'heart';
    h.style.left = (x !== undefined ? x : Math.random() * (innerWidth - 40)) + 'px';
    h.style.top = (innerHeight - 20 + Math.random() * 40) + 'px';
    h.style.color = HEART_COLORS[(Math.random() * HEART_COLORS.length) | 0];
    var dur = fast ? 2.4 + Math.random() * 2 : 7 + Math.random() * 5;
    h.style.animationDuration = dur + 's';
    h.style.transform = 'scale(' + (0.4 + Math.random() * 0.5) + ')';
    heartBox.appendChild(h);
    setTimeout(function () { h.remove(); }, dur * 1000 + 200);
  }

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(function () { spawnHeart(); }, 1700);
  }

  function burstHearts(n) {
    for (var i = 0; i < n; i++) {
      (function (k) {
        setTimeout(function () { spawnHeart(Math.random() * (innerWidth - 40), true); }, k * 55);
      })(i);
    }
  }

  /* — tiny chiptune blips (square wave, no assets) — */
  var actx = null;
  function blip(freq, dur, vol) {
    try {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        actx = new AC();
      }
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.04, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + (dur || 0.06));
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + (dur || 0.06) + 0.02);
    } catch (e) {}
  }

  [yesBtn, noBtn].forEach(function (b) {
    b.addEventListener('mouseenter', function () { blip(660, 0.04, 0.03); });
  });

  /* keyboard: Y / N / Enter */
  document.addEventListener('keydown', function (e) {
    if (decided || !elAsk.classList.contains('is-on')) return;
    var k = e.key.toLowerCase();
    if (k === 'y' || k === 'enter') yesBtn.click();
    if (k === 'n') noBtn.click();
  });
})();
