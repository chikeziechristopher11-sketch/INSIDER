let answerBuffer = '';
let answerPauseTimer;
let isSubmittingAnswer = false;
let mediaRecorder;
let recordedChunks = [];
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
let recognition;
let conversationHistory = [];

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
const themeToggle = document.querySelector('#theme-toggle');

function applyTheme(theme) {
  const dark = theme === 'dark';
  document.body.dataset.theme = dark ? 'dark' : 'light';
  themeToggle?.setAttribute('aria-pressed', String(dark));
  themeToggle?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  if (themeToggle) {
    themeToggle.querySelector('.theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
  }
  localStorage.setItem('bridgework-theme', dark ? 'dark' : 'light');
}

applyTheme(localStorage.getItem('bridgework-theme') || 'light');
themeToggle?.addEventListener('click', () => {
  applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
});

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
  transcriptText.textContent = 'Press Start answer and speak naturally. Your transcript will appear here.';
  answerState.textContent = 'Ready when you are';
  isAnswering = false;
  answerBuffer = '';
  isSubmittingAnswer = false;
  window.clearTimeout(answerPauseTimer);
  micLabel.textContent = 'Start answer';
  micButton.classList.remove('active');
}

function setListening(listening) {
  isAnswering = listening;
  micButton.classList.toggle('active', listening);
  micLabel.textContent = listening ? 'Stop answer' : 'Start answer';
  answerState.textContent = listening ? 'Listening for your answer' : 'Ready when you are';
}

function finishAnswer() {
  window.clearTimeout(answerPauseTimer);
  const answer = answerBuffer.trim();
  answerBuffer = '';
  if (!answer || isSubmittingAnswer) return;
  isSubmittingAnswer = true;
  recognition?.stop();
  setListening(false);
  submitAnswer(answer);
}

async function startMobileRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordedChunks = [];
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/mp4';
  mediaRecorder = new MediaRecorder(stream, { mimeType });
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size) recordedChunks.push(event.data);
  };
  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach((track) => track.stop());
    if (!recordedChunks.length) {
      setListening(false);
      answerState.textContent = 'No answer heard';
      return;
    }
    answerState.textContent = 'Transcribing your answer';
    try {
      const audioBlob = new Blob(recordedChunks, { type: mimeType });
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': mimeType },
        body: audioBlob
      });
      if (!response.ok) throw new Error('Transcription request failed');
      const result = await response.json();
      transcriptText.textContent = result.text || 'No words detected';
      await submitAnswer(result.text || '');
    } catch {
      isSubmittingAnswer = false;
      setListening(false);
      answerState.textContent = 'Transcription unavailable';
      showToast('Could not transcribe the recording. Try again.');
    }
  };
  mediaRecorder.start();
  setListening(true);
  answerState.textContent = 'Recording... tap Stop answer when finished';
  transcriptText.textContent = 'Listening to your answer...';
}

async function submitAnswer(answer) {
  const cleanAnswer = answer.trim();
  if (!cleanAnswer) {
    answerState.textContent = 'No answer heard';
    return;
  }

  answerState.textContent = 'Thinking about your answer';
  try {
    conversationHistory.push({ role: 'assistant', content: questionText.textContent });
    conversationHistory.push({ role: 'user', content: cleanAnswer });
    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate: {
          name: 'Amaka Okafor',
          summary: 'Product designer with three years of fintech experience.'
        },
        role: {
          company: 'GTCO',
          title: 'Product Designer, Digital Channels',
          competencies: ['product_thinking', 'customer_empathy', 'business_sense', 'execution', 'influence']
        },
        history: conversationHistory
      })
    });
    if (!response.ok) throw new Error('Interview request failed');
    const result = await response.json();
    if (result.session_state?.interview_complete) {
      answerState.textContent = 'Interview complete';
      showToast('Your interview debrief is ready.');
      return;
    }

    const next = result.question?.trim();
    if (!next) throw new Error('Interview returned no question');
    questionText.textContent = next;
    questionType.textContent = result.competency || 'Follow-up';
    answerState.textContent = 'Next question ready';
    await speak(next);
    isSubmittingAnswer = false;
    setListening(true);
    recognition?.start();
  } catch {
    answerState.textContent = 'Interview unavailable';
    showToast('Could not reach /api/interview. Check your local server or Vercel function.');
    isSubmittingAnswer = false;
  }
}

function createSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const instance = new SpeechRecognition();
  instance.lang = 'en-NG';
  instance.continuous = true;
  instance.interimResults = true;
  instance.onstart = () => {
    setListening(true);
    answerState.textContent = 'Listening...';
    if (!answerBuffer) transcriptText.textContent = 'Speak now...';
  };
  instance.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ');
    answerBuffer = transcript;
    transcriptText.textContent = answerBuffer;
    if (event.results[event.results.length - 1].isFinal) {
      window.clearTimeout(answerPauseTimer);
      answerPauseTimer = window.setTimeout(finishAnswer, 1600);
    }
  };
  instance.onerror = (event) => {
    setListening(false);
    answerState.textContent = event.error === 'not-allowed' ? 'Microphone permission denied' : 'Could not hear you';
    showToast(event.error === 'not-allowed' ? 'Allow microphone access in your browser to answer.' : 'Try speaking again.');
  };
  instance.onend = () => {
    if (isAnswering && !isSubmittingAnswer) {
      try {
        instance.start();
      } catch {
        setListening(false);
      }
    }
  };
  return instance;
}

async function requestMicrophonePermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access is unavailable in this browser');
  }
  const permissionRequest = navigator.mediaDevices.getUserMedia({ audio: true });
  const timeout = new Promise((resolve) => window.setTimeout(resolve, 2500));
  const stream = await Promise.race([permissionRequest, timeout]);
  if (stream?.getTracks) stream.getTracks().forEach((track) => track.stop());
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
    await new Promise((resolve) => audio.addEventListener('ended', resolve, { once: true }));
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
micButton.addEventListener('click', async () => {
  if (!recognition) {
    showToast('Speech recognition is not supported in this browser. Try Chrome or Edge.');
    answerState.textContent = 'Speech recognition unavailable';
    return;
  }
  if (isAnswering) {
    window.clearTimeout(answerPauseTimer);
    answerBuffer = '';
    if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
    else recognition?.stop();
    setListening(false);
    return;
  }
  try {
    await requestMicrophonePermission();
    if (recognition) recognition.start();
    else if (window.MediaRecorder) await startMobileRecording();
    else throw new Error('Speech input is not supported in this browser');
  } catch (error) {
    answerState.textContent = 'Microphone permission required';
    showToast(error.name === 'NotAllowedError'
      ? 'Allow microphone access in your browser to answer.'
      : 'The microphone could not be started. Check your browser settings.');
  }
});
document.querySelector('.close-button').addEventListener('click', () => showToast('Interview room stays open for this local test.'));
document.querySelector('.leave-button').addEventListener('click', () => showToast('Session ended. Your practice remains private.'));

recognition = createSpeechRecognition();
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
