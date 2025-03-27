import React, { useState, useEffect } from "react";

import {
  Car,
  Shuffle,
  CircleX,
  TrafficCone,
  CircleCheckBig,
  ArrowRight,
} from "lucide-react";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [quizMode, setQuizMode] = useState(null);
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [customQuestionCount, setCustomQuestionCount] = useState(20);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showConfirmAbort, setShowConfirmAbort] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/questions.json");
        const data = await response.json();
        setQuestions(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    if (quizInProgress && timerActive) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswerSubmit(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizInProgress, timerActive, currentQuestionIndex]);

  const startOrderedQuiz = () => {
    setQuizMode("ordered");
    setSelectedQuestions(questions);
    setQuizInProgress(true);
    setTimerActive(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
  };

  const startRandomQuiz = () => {
    // Ensure custom count doesn't exceed total questions
    const safeQuestionCount = Math.min(customQuestionCount, questions.length);

    // Shuffle and select number of questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedSet = shuffled.slice(0, safeQuestionCount);

    setQuizMode("random");
    setSelectedQuestions(selectedSet);
    setQuizInProgress(true);
    setTimerActive(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
  };

  const handleAnswerSubmit = (optionKey) => {
    setSelectedAnswer(optionKey);
    setTimerActive(false);

    // Check if answer is correct
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (optionKey === currentQuestion.answer) {
      setScore((prevScore) => prevScore + 1);
    }

    setShowNextButton(true);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex + 1 < selectedQuestions.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setTimerActive(true);
      setTimeRemaining(30);
      setShowNextButton(false);
    } else {
      // Quiz is complete
      setQuizInProgress(false);
      setTimerActive(false);
      setQuizComplete(true);
    }
  };

  const abortQuiz = () => {
    setShowConfirmAbort(false);
    setQuizInProgress(false);
    setTimerActive(false);
    setQuizComplete(true);
  };

  const resetQuiz = () => {
    setQuizMode(null);
    setQuizInProgress(false);
    setTimerActive(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizComplete(false);
    setScore(0);
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  const renderLoadingScreen = () => (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="flex flex-col text-center items-center">
        <div className="loader"></div>
        <p className="text-2xl font-semibold text-gray-800 m-16">
          Preparing LL Quiz...
        </p>
      </div>
    </div>
  );

  const renderStartScreen = () => (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 border-2 border-gray-200 m-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center flex items-center justify-center">
          <Car className="mr-2 text-blue-600" /> LL Test Prep
        </h1>

        <div className="space-y-4">
          <button
            onClick={startOrderedQuiz}
            className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            <TrafficCone className="mr-2" /> Full Practice Test
          </button>

          <div className="border-b border-gray-300 my-4 text-center">
            <span className="px-3 bg-white text-gray-500">OR</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Shuffle className="mr-2 text-blue-600" />
              <span className="text-gray-800 ml-2">Random Questions</span>
              <input
                type="number"
                value={customQuestionCount}
                onChange={(e) => setCustomQuestionCount(Number(e.target.value))}
                min="1"
                max={questions.length}
                className="border rounded px-2 py-1 w-20 text-center"
              />
            </div>

            <button
              onClick={startRandomQuiz}
              className="w-full flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300"
            >
              <Shuffle className="mr-2" /> Quick Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizCompleteScreen = () => {
    let hasPassed = score >= selectedQuestions.length * 0.6;
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-96 max-w-[90vw] border-2 border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 flex items-center justify-center">
            <CircleCheckBig className="mr-2 text-green-600" /> Test Complete
          </h2>
          <p className="text-xl mb-4">
            Mode:{" "}
            <span className="font-semibold">
              {quizMode === "ordered" ? "Full Practice" : "Quick Practice"}
            </span>
          </p>
          <p className="text-xl mb-6">
            Your Score:{" "}
            <span
              className={`font-bold ${
                hasPassed ? "text-green-600" : "text-red-600"
              }`}
            >
              {score}
            </span>{" "}
            / {selectedQuestions.length}
            <span className="block text-sm text-gray-600 mt-2">
              {hasPassed
                ? "Congratulations! You're ready for the test."
                : "Keep studying. You're getting there."}
            </span>
          </p>
          <button
            onClick={resetQuiz}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmationAbort = () => {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center w-96 max-w-[90vw]">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Abort Quiz?</h2>
          <p className="mb-6 text-gray-700">
            Are you sure you want to end the quiz?
          </p>
          <div className="grid grid-rows-2 gap-4">
            <button
              onClick={() => setShowConfirmAbort(false)}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
            >
              Continue Quiz
            </button>
            <button
              onClick={abortQuiz}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300"
            >
              End Quiz
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the question UI
  const renderQuestionUI = () => {
    const currentQuestion = selectedQuestions[currentQuestionIndex];

    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <div className="bg-white p-4 rounded-xl shadow-2xl max-w-[90vw] border-2 border-gray-200">
          <div className="grid grid-cols-3 mb-4">
            <div className="text-green-600 font-bold">Score: {score}</div>
            <div className="text-gray-800 font-semibold justify-self-center">
              Question {currentQuestionIndex + 1} / {selectedQuestions.length}
            </div>
            <button
              onClick={() => setShowConfirmAbort(true)}
              className="text-gray-400 hover:text-red-400 justify-self-end"
            >
              <CircleX />
            </button>
          </div>

          <div className="mb-4">
            <div
              className={`h-2 ${
                timeRemaining > 15
                  ? "bg-green-500"
                  : timeRemaining > 7
                    ? "bg-yellow-500"
                    : "bg-red-500"
              } bg-gray-200 rounded-full transition-all ease-linear duration-1000`}
              style={{
                width: `${(timeRemaining / 30) * 100}%`,
              }}
            ></div>
          </div>

          {currentQuestion.question && (
            <div className="mb-6 p-4 flex justify-center rounded-lg shadow-xl">
              <img
                src={`data:image/jpeg;base64,${currentQuestion.question}`}
                alt="Question"
                className="max-w-[80vw]"
              />
            </div>
          )}

          <div className="flex flex-col space-y-4 justify-left w-max">
            {Object.entries(currentQuestion.options).map(([key, option]) => (
              <button
                key={key}
                onClick={() => setSelectedAnswer(key)}
                disabled={selectedAnswer !== null}
                className={`flex items-center p-4 rounded-lg transition duration-300 shadow-sm
                                    ${
                                      key === selectedAnswer && timerActive
                                        ? "border-1 border-gray-600 bg-gray-300 hover:bg-gray-400 text-gray-800"
                                        : timerActive
                                          ? "border-1 border-gray-600 hover:bg-gray-200 text-gray-800"
                                          : key === currentQuestion.answer
                                            ? "bg-green-200 text-green-900"
                                            : selectedAnswer === key
                                              ? "bg-red-200 text-red-900"
                                              : "bg-gray-100 text-gray-800"
                                    }`}
              >
                {key}.
                {option && (
                  <img
                    src={`data:image/jpeg;base64,${option}`}
                    alt={`Option ${key}`}
                    className="max-w-[60vw] overflow-hidden ml-4 rounded-md"
                  />
                )}
              </button>
            ))}
          </div>

          {showNextButton ? (
            <div className="mt-8 flex justify-center">
              <button
                onClick={moveToNextQuestion}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
              >
                Next Question <ArrowRight className="ml-2" />
              </button>
            </div>
          ) : (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => handleAnswerSubmit(selectedAnswer)}
                disabled={selectedAnswer === null}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render logic
  if (isLoading) return renderLoadingScreen();
  if (showConfirmAbort) return renderConfirmationAbort();
  if (quizComplete) return renderQuizCompleteScreen();
  if (!quizInProgress) return renderStartScreen();

  return renderQuestionUI();
};

export default App;
