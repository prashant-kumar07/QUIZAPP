const questionsData = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Pre Processor", "Hyper Text Markup Language", "Hyper Text Multiple Language", "Hyper Tool Multi Language"],
        answer: 1
    },
    {
        question: "Which CSS property is used to control the spacing between elements?",
        options: ["margin", "padding", "spacing", "border"],
        answer: 0
    },
    {
        question: "What is the correct syntax for referring to an external script called 'app.js'?",
        options: ["<script href='app.js'>", "<script name='app.js'>", "<script src='app.js'>", "<script file='app.js'>"],
        answer: 2
    },
    {
        question: "Which method converts a JSON string into a JavaScript object?",
        options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.convert()"],
        answer: 1
    },
    {
        question: "What is the output of 2 + '2' in JavaScript?",
        options: ["4", "22", "NaN", "Error"],
        answer: 1
    },
    {
        question: "Which keyword is used to declare a variable that cannot be reassigned?",
        options: ["var", "let", "const", "static"],
        answer: 2
    },
    {
        question: "What does the 'DOM' stand for?",
        options: ["Document Object Model", "Data Object Mode", "Document Oriented Model", "Digital Ordinance Model"],
        answer: 0
    },
    {
        question: "Which event is triggered when a user clicks on an HTML element?",
        options: ["onchange", "onmouseover", "onclick", "onmouseclick"],
        answer: 2
    },
    {
        question: "How do you check if a number is an integer in JavaScript?",
        options: ["Number.isInteger()", "Number.isNumber()", "Integer.check()", "Math.isInteger()"],
        answer: 0
    },
    {
        question: "Which array method removes the last element from an array?",
        options: ["shift()", "pop()", "push()", "splice()"],
        answer: 1
    }
];

// App State
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft;
const TIME_PER_QUESTION = 15; // seconds
let userAnswers = []; // Store answers to persist state

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerDisplay = document.getElementById('time-left');
const scoreDisplay = document.getElementById('current-score');
const progressBar = document.getElementById('progress-bar');
const currentQNum = document.getElementById('q-current');
const totalQNum = document.getElementById('q-total');

const finalScoreDisplay = document.getElementById('final-score');
const totalPossibleScoreDisplay = document.getElementById('total-possible-score');
const resultMessage = document.getElementById('result-message');
const startHighScoreIds = document.getElementById('start-high-score');

// Load High Score on Init
window.addEventListener('DOMContentLoaded', () => {
    const highScore = localStorage.getItem('quizHighScore') || 0;
    startHighScoreIds.textContent = highScore;
});

// Event Listeners
startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', () => {
    nextQuestion();
});
prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
});
restartBtn.addEventListener('click', () => {
    resultScreen.classList.remove('active');
    resultScreen.classList.add('hide');
    startScreen.classList.remove('hide');
    startScreen.classList.add('active');

    // Refresh high score
    const highScore = localStorage.getItem('quizHighScore') || 0;
    startHighScoreIds.textContent = highScore;
});

function startGame() {
    startScreen.classList.remove('active');
    startScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    quizScreen.classList.add('active');

    // Randomize Questions
    currentQuestions = [...questionsData].sort(() => Math.random() - 0.5);
    userAnswers = new Array(currentQuestions.length).fill(null);

    currentQuestionIndex = 0;
    score = 0;
    scoreDisplay.textContent = score;
    totalQNum.textContent = currentQuestions.length;

    loadQuestion();
}

function loadQuestion() {
    clearInterval(timer);

    const question = currentQuestions[currentQuestionIndex];

    // Update UI
    questionText.textContent = question.question;
    currentQNum.textContent = currentQuestionIndex + 1;

    // Progress Bar
    const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Navigation State
    prevBtn.disabled = currentQuestionIndex === 0;
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.textContent = 'Finish';
    } else {
        nextBtn.textContent = 'Next';
    }

    // Reset Options
    optionsContainer.innerHTML = '';

    // Render Options
    question.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = opt;
        btn.dataset.index = index;
        btn.addEventListener('click', selectAnswer);
        optionsContainer.appendChild(btn);
    });

    // Check if already answered
    const existingAnswer = userAnswers[currentQuestionIndex];
    if (existingAnswer !== null) {
        // Show saved state
        const btns = optionsContainer.querySelectorAll('.option-btn');
        btns.forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.dataset.index) === existingAnswer.selectedIndex) {
                if (existingAnswer.isCorrect) {
                    btn.classList.add('correct');
                } else {
                    btn.classList.add('wrong');
                }
            }
            if (!existingAnswer.isCorrect && parseInt(btn.dataset.index) === question.answer) {
                btn.classList.add('correct');
            }
        });
        timerDisplay.textContent = "0"; // or just show timeout
    } else {
        // Start Timer for new question
        timeLeft = TIME_PER_QUESTION;
        timerDisplay.textContent = timeLeft;
        startTimer();
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            autoHandleTimeout();
        }
    }, 1000);
}

function autoHandleTimeout() {
    userAnswers[currentQuestionIndex] = { selectedIndex: -1, isCorrect: false }; // -1 for timeout

    // Disable all buttons
    const btns = optionsContainer.querySelectorAll('.option-btn');
    btns.forEach(btn => btn.disabled = true);

    // Show correct answer
    const currentQ = currentQuestions[currentQuestionIndex];
    if (btns[currentQ.answer]) {
        btns[currentQ.answer].classList.add('correct');
    }
}

function selectAnswer(e) {
    clearInterval(timer);

    const selectedBtn = e.target;
    const selectedIndex = parseInt(selectedBtn.dataset.index);
    const currentQ = currentQuestions[currentQuestionIndex];

    const isCorrect = selectedIndex === currentQ.answer;
    userAnswers[currentQuestionIndex] = { selectedIndex, isCorrect };

    const btns = optionsContainer.querySelectorAll('.option-btn');
    btns.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score += 10;
        scoreDisplay.textContent = score;
    } else {
        selectedBtn.classList.add('wrong');
        // Show correct
        if (btns[currentQ.answer]) {
            btns[currentQ.answer].classList.add('correct');
        }
    }
}

function nextQuestion() {
    // If time ran out or user didn't answer but clicked Next:
    // We should probably mark it as skipped/wrong if not answered yet?
    // Or just let them skip? 
    // Standard quiz: If you skip, you can come back?
    // BUT our timer resets if we allow come-back-to-unanswered.
    // If we want to force decision:
    if (userAnswers[currentQuestionIndex] === null) {
        // Auto-submit as timeout/skip? 
        // Or just allow skip. 
        // Let's allow skip, but reset timer when they return.
        // That matches logic above in `loadQuestion`.
        // So no action needed here.
        clearInterval(timer);
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    quizScreen.classList.remove('active');
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');
    resultScreen.classList.add('active');

    finalScoreDisplay.textContent = score;
    totalPossibleScoreDisplay.textContent = currentQuestions.length * 10;

    // Save High Score
    const currentHighScore = localStorage.getItem('quizHighScore') || 0;
    if (score > currentHighScore) {
        localStorage.setItem('quizHighScore', score);
        resultMessage.textContent = "New High Score! 🎉";
    } else {
        if (score === currentQuestions.length * 10) {
            resultMessage.textContent = "Perfect Score! 🌟";
        } else if (score > (currentQuestions.length * 5)) {
            resultMessage.textContent = "Great Job! 👍";
        } else {
            resultMessage.textContent = "Keep Practicing! 💪";
        }
    }
}
