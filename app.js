const questions = [
  {
    type: 'Product thinking',
    text: 'Tell me about a time you had to make a product decision with incomplete information.',
    prompt: 'Take a moment. I am listening for how you frame the problem, what you traded off, and what happened next.',
    listeningFor: 'A clear problem frame, a considered trade-off, and a measurable outcome.'
  },
  {
    type: 'Customer empathy',
    text: 'How would you improve a mobile banking experience for a first-time digital banking customer?',
    prompt: 'Start with what you would need to learn, then walk me through the first thing you would change.',
    listeningFor: 'A specific customer insight, a practical solution, and a way to measure whether it worked.'
  },
  {
    type: 'Business sense',
    text: 'Tell me about a time your design recommendation had to change because of a business constraint.',
    prompt: 'I want to understand how you balance user needs with risk, cost, or commercial priorities.',
    listeningFor: 'Maturity around constraints, collaboration with stakeholders, and the result of your decision.'
  },
  {
    type: 'Influence',
    text: 'How do you get an engineering or business partner aligned around a design decision?',
    prompt: 'Use a real example if you can. Focus on the conversation, not only the final outcome.',
    listeningFor: 'Clear communication, evidence-based reasoning, and respect for other disciplines.'
  }
];

let currentQuestion = 0;
let audio;
let isAnswering = false;

const questionText = document.querySelector('#question-text');
const questionPrompt = document.querySelector('#question-prompt');
const questionType = document.querySelector('#question-type');
const questionNumber = document.querySelector('#question-number');
const questionCount = document.querySelector('#question-count');
const progressBar = document.querySelector('#progress-bar');
const listeningFor = document.querySelector('#listening-for');
const playButton = document.querySelector('#play-question');
const playLabel = document.querySelector('#play-label');
const voiceSelect = document.querySelector('#voice-select');
const speedSelect = document.querySelector('#speed-select');
const testVoice = document.querySelector('#test-voice');
const nextQuestion = document.querySelector('#next-question');
const micButton = document.querySelector('#mic-button');
const micLabel = document.querySelector('#mic-label');
const answerState = document.querySelector('#answer-state');
const transcriptText = document.querySelector('#transcript-text');
const toast = document.querySelector('#toast');

function renderQuestion() {
  const question = questions[currentQuestion];
  const number = String(currentQuestion + 1).padStart(2, '0');
  questionText.textContent = question.text;
  questionPrompt.textContent = question.prompt;
  questionType.textContent = question.type;
  questionNumber.textContent = number;
  questionCount.textContent = `${number} / ${String(questions.length).padStart(2, '0')}`;
  progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  listeningFor.textContent = question.listeningFor;
  transcriptText.textContent = 'Your answer will appear here when voice input is connected. For now, use this room to test the coach voice.';
  answerState.textContent = 'Ready when you are';
  isAnswering = false;
  micLabel.textContent = 'Start answer';
  micButton.classList.remove('active');
}

async function speak(text) {
  playButton.disabled = true;
  playLabel.textContent = 'Preparing voice';
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voiceSelect.value })
    });
    if (!response.ok) throw new Error('TTS request failed');
    const audioUrl = URL.createObjectURL(await response.blob());
    audio?.pause();
    audio = new Audio(audioUrl);
    audio.playbackRate = Number(speedSelect.value);
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
      playButton.disabled = false;
      playLabel.textContent = 'Hear question';
    }, { once: true });
    await audio.play();
    playLabel.textContent = 'Playing question';
  } catch {
    playButton.disabled = false;
    playLabel.textContent = 'Voice unavailable';
    showToast('Could not reach /api/tts. Check your Vercel function or local server.');
    window.setTimeout(() => { playLabel.textContent = 'Hear question'; }, 3000);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 3500);
}

playButton.addEventListener('click', () => speak(questionText.textContent));
testVoice.addEventListener('click', () => speak('Hello, I am your Bridgework interview coach. Take your time and answer with a real example.'));
nextQuestion.addEventListener('click', () => {
  currentQuestion = (currentQuestion + 1) % questions.length;
  renderQuestion();
});
micButton.addEventListener('click', () => {
  isAnswering = !isAnswering;
  micButton.classList.toggle('active', isAnswering);
  micLabel.textContent = isAnswering ? 'Stop answer' : 'Start answer';
  answerState.textContent = isAnswering ? 'Listening for your answer' : 'Answer paused';
  if (isAnswering) transcriptText.textContent = 'Voice input is ready to connect. Your response will be transcribed here.';
});
document.querySelector('.close-button').addEventListener('click', () => showToast('Interview room stays open for this local test.'));
document.querySelector('.leave-button').addEventListener('click', () => showToast('Session ended. Your practice remains private.'));

renderQuestion();
const navItems = [...document.querySelectorAll('[data-screen]')];
const crumb = document.querySelector('#crumb');

const labels = {
  landing: 'Overview',
  profile: 'My profile',
  opportunity: 'Opportunity',
  readiness: 'Readiness',
  interview: 'Interview room',
  debrief: 'Debrief'
};

function showScreen(name) {
  const target = document.getElementById(name);
  if (!target) return;
  screens.forEach((screen) => screen.classList.toggle('active', screen === target));
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.screen === name);
  });
  crumb.textContent = labels[name] || 'Overview';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.replaceState(null, '', `#${name}`);
}

navItems.forEach((item) => {
  item.addEventListener('click', () => showScreen(item.dataset.screen));
});

document.querySelectorAll('.upload-zone, .outline-wide').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.add('clicked');
    const original = button.innerHTML;
    button.innerHTML = '<span>✓</span><b>Evidence added</b><small>Bridgework will organise this for you</small>';
    window.setTimeout(() => {
      button.innerHTML = original;
      button.classList.remove('clicked');
    }, 2200);
  });
});

document.querySelectorAll('.opportunity-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.opportunity-card').forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
    const label = card.querySelector('.selected-label') || document.createElement('span');
    if (!label.classList.contains('selected-label')) {
      label.className = 'selected-label';
      label.textContent = 'Selected';
      card.querySelector('.opp-head').append(label);
    }
  });
});

document.querySelector('.voice-button')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const isListening = button.dataset.listening !== 'false';
  button.dataset.listening = String(!isListening);
  button.querySelector('b').textContent = isListening ? 'Pause' : 'Listening';
  button.querySelector('.mic').textContent = isListening ? 'Ⅱ' : '●';
});

const questionHeading = document.querySelector('#interview .ai-question h2');
if (questionHeading) {
  const speakButton = document.createElement('button');
  speakButton.className = 'small-link speak-question';
  speakButton.type = 'button';
  speakButton.textContent = '▶ Play question';
  questionHeading.parentElement.append(speakButton);

  let questionAudio;
  speakButton.addEventListener('click', async () => {
    speakButton.disabled = true;
    speakButton.textContent = '... Preparing voice';
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questionHeading.textContent.trim(), voice: 'female' })
      });
      if (!response.ok) throw new Error('Speech request failed');
      const audioUrl = URL.createObjectURL(await response.blob());
      questionAudio?.pause();
      questionAudio = new Audio(audioUrl);
      questionAudio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        speakButton.disabled = false;
        speakButton.textContent = '▶ Play question';
      }, { once: true });
      await questionAudio.play();
      speakButton.textContent = 'Ⅱ Playing question';
    } catch {
      speakButton.disabled = false;
      speakButton.textContent = '! Voice unavailable';
      window.setTimeout(() => { speakButton.textContent = '▶ Play question'; }, 2500);
    }
  });
}

const initialScreen = window.location.hash.slice(1) || 'landing';
showScreen(labels[initialScreen] ? initialScreen : 'landing');
