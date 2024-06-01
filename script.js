// script.js
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

function generateQuestions() {
  const courseName = document.getElementById("courseName").value;
  const courseCode = document.getElementById("courseCode").value;
  const numTFQuestions = document.getElementById("numTFQuestions").value;
  const numMCQQuestions = document.getElementById("numMCQQuestions").value;

  localStorage.setItem("courseName", JSON.stringify(courseName));
  localStorage.setItem("courseCode", JSON.stringify(courseCode));

  const questionsContainer = document.getElementById("questionsContainer");
  questionsContainer.innerHTML = "";

  // Generate T/F Questions
  for (let i = 0; i < numTFQuestions; i++) {
    questionsContainer.innerHTML += `
            <div>
                <label>سؤال ${i + 1} (صح/خطأ):</label>
                <input type="text" id="tfQuestion${i}" placeholder="نص السؤال">
                <label>الإجابة الصحيحة:</label>
                <select id="tfAnswer${i}">
                    <option value="true">صح</option>
                    <option value="false">خطأ</option>
                </select>
            </div>
        `;
  }

  // Generate MCQ Questions
  for (let i = 0; i < numMCQQuestions; i++) {
    questionsContainer.innerHTML += `
            <div>
                <label>سؤال ${
                  i + 1 + parseInt(numTFQuestions)
                } (اختيار من متعدد):</label>
                <input type="text" id="mcqQuestion${i}" placeholder="نص السؤال">
                <label>اختيارات:</label>
                <input type="text" id="mcqOption${i}a" placeholder="اختيار أ">
                <input type="text" id="mcqOption${i}b" placeholder="اختيار ب">
                <input type="text" id="mcqOption${i}c" placeholder="اختيار ج">
                <input type="text" id="mcqOption${i}d" placeholder="اختيار د">
                <label>الإجابة الصحيحة:</label>
                <select id="mcqAnswer${i}">
                    <option value="a">أ</option>
                    <option value="b">ب</option>
                    <option value="c">ج</option>
                    <option value="d">د</option>
                </select>
            </div>
        `;
  }

  questionsContainer.innerHTML += `
        <button type="button" onclick="saveQuestions()">حفظ الأسئلة</button>
    `;
}

function saveQuestions() {
  const numTFQuestions = document.getElementById("numTFQuestions").value;
  const numMCQQuestions = document.getElementById("numMCQQuestions").value;

  questions = [];

  // Save T/F Questions
  for (let i = 0; i < numTFQuestions; i++) {
    const question = document.getElementById(`tfQuestion${i}`).value;
    const answer = document.getElementById(`tfAnswer${i}`).value;
    questions.push({ type: "tf", question, answer });
  }

  // Save MCQ Questions
  for (let i = 0; i < numMCQQuestions; i++) {
    const question = document.getElementById(`mcqQuestion${i}`).value;
    const options = {
      a: document.getElementById(`mcqOption${i}a`).value,
      b: document.getElementById(`mcqOption${i}b`).value,
      c: document.getElementById(`mcqOption${i}c`).value,
      d: document.getElementById(`mcqOption${i}d`).value,
    };
    const answer = document.getElementById(`mcqAnswer${i}`).value;
    questions.push({ type: "mcq", question, options, answer });
  }

  // Save to local storage
  localStorage.setItem("questions", JSON.stringify(questions));

  alert("تم حفظ الأسئلة بنجاح!");
}

function startExam() {
  const studentName = document.getElementById("studentName").value;
  const studentID = document.getElementById("studentID").value;

  localStorage.setItem("studentName", JSON.stringify(studentName));
  localStorage.setItem("studentID", JSON.stringify(studentID));

  if (studentName === "" || studentID === "") {
    alert("يرجى إدخال الاسم والرقم الأكاديمي.");
    return;
  }

  document.getElementById("studentForm").style.display = "none";
  document.getElementById("examContainer").style.display = "block";

  // Retrieve questions from local storage
  const storedQuestions = localStorage.getItem("questions");
  if (storedQuestions) {
    questions = JSON.parse(storedQuestions);
  }

  // Shuffle questions
  questions = shuffleArray(questions);

  // Shuffle options for MCQ questions
  questions.forEach((question) => {
    if (question.type === "mcq") {
      question.options = shuffleOptions(question.options);
    }
  });

  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function shuffleOptions(options) {
  const keys = Object.keys(options);
  const shuffledKeys = shuffleArray(keys.slice());
  const shuffledOptions = {};
  shuffledKeys.forEach((key) => {
    shuffledOptions[key] = options[key];
  });
  return shuffledOptions;
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

  const examContainer = document.getElementById("examContainer");
  examContainer.innerHTML = "";

  const question = questions[currentQuestionIndex];

  if (question.type === "tf") {
    examContainer.innerHTML = `
            <div>
                <h3>سؤال ${currentQuestionIndex + 1}:</h3>
                <p>${question.question}</p>
                <label><input type="radio" name="answer" value="true"> صح</label>
                <label><input type="radio" name="answer" value="false"> خطأ</label>
            </div>
        `;
  } else if (question.type === "mcq") {
    examContainer.innerHTML = `
            <div>
                <h3>سؤال ${currentQuestionIndex + 1}:</h3>
                <p>${question.question}</p>
                <label><input type="radio" name="answer" value="a"> ${
                  question.options.a
                }</label><br>
                <label><input type="radio" name="answer" value="b"> ${
                  question.options.b
                }</label><br>
                <label><input type="radio" name="answer" value="c"> ${
                  question.options.c
                }</label><br>
                <label><input type="radio" name="answer" value="d"> ${
                  question.options.d
                }</label><br>
            </div>
        `;
  }

  examContainer.innerHTML += `
        <button type="button" onclick="submitAnswer()">التالي</button>
    `;
}

function submitAnswer() {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');

  if (!selectedAnswer) {
    alert("يرجى اختيار إجابة.");
    return;
  }

  const question = questions[currentQuestionIndex];

  if (selectedAnswer.value === question.answer) {
    score++;
  }

  currentQuestionIndex++;
  showQuestion();
}

function showResult() {
  const examContainer = document.getElementById("examContainer");
  examContainer.innerHTML = `
        <h2>النتيجة: ${localStorage
          .getItem("studentName")
          .replace(/"/g, "")} </h2>
        <h3>نتيجة مادة : ${localStorage
          .getItem("courseName")
          .replace(/"/g, "")} </h3>
        <p>لقد أجبت بشكل صحيح على ${score} من ${questions.length} سؤال.</p>
    `;
}
